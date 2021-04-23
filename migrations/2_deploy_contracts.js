const BoraMetaToken = artifacts.require("./BoraMetaToken.sol");

// const DEPLOY_BORAMETATOKEN = process.env.DEPLOY_BORAMETATOKEN;
const DEPLOY_BORAMETATOKEN = true;

module.exports = async (deployer, network, addresses) => {
  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = "";
  if (network === 'rinkeby') {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317"; // rinkeby
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1"; // mainnet
  }

  if (DEPLOY_BORAMETATOKEN) {
    console.log("triggerd!!");
    await deployer.deploy(BoraMetaToken, proxyRegistryAddress, {gas: 5000000});
  }
};