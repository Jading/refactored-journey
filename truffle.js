const HDWalletProvider = require("@truffle/hdwallet-provider");
const HDWalletKlaytnProvider = require("truffle-hdwallet-provider-klaytn");
const CaverExtKAS = require("caver-js-ext-kas");

const kasNetworkName = process.env.MAINNET ? "mainnet" : "baobab";
const kasAccesskey = process.env.KASACCESSKEY;
const kasSecret = process.env.KASSECRET;
const kasNodeUrl = "https://node-api.klaytnapi.com/v1/klaytn";

const kasCaver = new CaverExtKAS(1001, kasAccesskey, kasSecret);

const MNEMONIC = process.env.MNEMONIC;
const PRIVATEKEY = process.env.PRIVATEKEY;

const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;

const needsNodeAPI =
  process.env.npm_config_argv &&
  (process.env.npm_config_argv.includes("rinkeby") ||
    process.env.npm_config_argv.includes("live"));

console.log("MNEMONIC: ", MNEMONIC);
console.log("PRIVATEKEY: ", PRIVATEKEY);
console.log("NODE_API_KEY: ", NODE_API_KEY);

if (!((MNEMONIC || PRIVATEKEY) && NODE_API_KEY) && needsNodeAPI) {
  console.error("Please set a mnemonic and ALCHEMY_KEY or INFURA_KEY.");
  process.exit(0);
}

const rinkebyNodeUrl = isInfura
  ? "https://rinkeby.infura.io/v3/" + NODE_API_KEY
  : "https://eth-rinkeby.alchemyapi.io/v2/" + NODE_API_KEY;

const mainnetNodeUrl = isInfura
  ? "https://mainnet.infura.io/v3/" + NODE_API_KEY
  : "https://eth-mainnet.alchemyapi.io/v2/" + NODE_API_KEY;

module.exports = {
  networks: {
    develop: {
      port: 9545,
      gas: 5000000,
      network_id: "*",
    },
    development: {
      host: "localhost",
      port: 7545,
      gas: 5000000,
      network_id: "*", // Match any network id
    },
    docker_dev: {
      host: "host.docker.internal",
      port: 8545,
      gas: 5000000,
      network_id: "*",
    },
    rinkeby: {
      provider: () => new HDWalletProvider({
        // mnemonic: {
        //   phrase: MNEMONIC,
        //   // password: "mnemonicpassword"
        // },
        privateKeys: [PRIVATEKEY],
        providerOrUrl: rinkebyNodeUrl,
        numberOfAddresses: 10,
        shareNonce: true,
        // derivationPath: "m/44'/137'/0'/0/"
      }),
      gas: 50000000,
      network_id: "*",
    },
    baobab: {
      networkCheckTimeout: 10000,
      provider: () => {
        const option = {
          headers: [
            { name: 'Authorization', value: 'Basic ' + Buffer.from(kasAccesskey + ':' + kasSecret).toString('base64') },
            { name: 'x-chain-id', value: '1001' }
          ],
          keepAlive: false,
        }

        // Create a KeyringContainer instance
        const keyringContainer = new kasCaver.keyringContainer();

        // Create a keyring from private key
        const keyring = keyringContainer.keyring.createFromPrivateKey(PRIVATEKEY);

        // Add a keyring to the keyringContainer
        keyringContainer.add(keyring);
        return new HDWalletKlaytnProvider(PRIVATEKEY, kasCaver);
      },
      gas: 5000000,
      network_id: "1001",
    },
    live: {
      network_id: 1,
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: MNEMONIC,
          // password: "mnemonicpassword"
        },
        // privateKeys: [PRIVATEKEY, ...],
        providerOrUrl: mainnetNodeUrl,
        numberOfAddresses: 1,
        shareNonce: true,
        // derivationPath: "m/44'/137'/0'/0/"
      }),
      gas: 5000000,
      gasPrice: 5000000000,
    },
  },
  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
      gasPrice: 2
    },
  },
  compilers: {
    solc: {
      version: "^0.5.0",
    },
  },
};
