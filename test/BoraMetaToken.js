/* libraries used */

const truffleAssert = require('truffle-assertions');

const setup = require('../lib/setupCreatureAccessories.js');
const testVals = require('../lib/testValuesCommon.js');
const vals = require('../lib/valuesCommon.js');

/* Contracts in this test */

const MockProxyRegistry = artifacts.require(
  "../contracts/MockProxyRegistry.sol"
);
const LootBoxRandomness = artifacts.require(
  "../contracts/LootBoxRandomness.sol"
);
const BoraMetaToken = artifacts.require(
  "./BoraMetaToken.sol"
);

/* Useful aliases */

const toBN = web3.utils.toBN;


/* Utilities */

const toTokenId = optionId => optionId;


contract("BoraMetaToken", (accounts) => {
  const TOTAL_OPTIONS = 9;

  const owner = accounts[0];
  const userA = accounts[1];
  const userB = accounts[2];
  const proxyForOwner = accounts[8];  // Opensea proxy address

  let boraMetaToken;
  let proxy;
  let attacker;

  const URI_BASE = 'https://creatures-api.opensea.io';
  const CONTRACT_URI = `${URI_BASE}/contract/opensea-creatures`;

  before(async () => {
    // boraMetaToken = await BoraMetaToken.deployed();

    proxy = await MockProxyRegistry.new();
    await proxy.setProxy(owner, proxyForOwner);
    boraMetaToken = await BoraMetaToken.new(proxy.address);

    console.log("proxyForOwner: ", proxyForOwner);
    console.log("proxy.address: ", proxy.address);

  });

  describe('#constructor()', () => {
    it('should set the contractURI to the supplied value', async () => {
      assert.equal(await boraMetaToken.contractURI(), CONTRACT_URI);
    });

    // let add = await boraMetaToken.proxyRegistryAddress()
    // console.log(add);
    // it('should set proxyRegistryAddress to the supplied value', async () => {
    //   assert.equal(await boraMetaToken.proxyRegistryAddress(), proxy.address);
    // });
  });

  describe('#name()', () => {
    it('should return the correct name', async () => {
      assert.equal(
        await boraMetaToken.name(),
        'BORA Metaverse NFT'
      );
    });
  });

  describe('#symbol()', () => {
    it('should return the correct symbol', async () => {
      assert.equal(await boraMetaToken.symbol(), 'BMT');
    });
  });

  //NOTE: We test this early relative to its place in the source code as we
  //      mint tokens that we rely on the existence of in later tests here.

  describe('#mintTo()', () => {
    // userA attempts to mintTo to userB
    it('should not allow non-owner or non-operator to mint', async () => {
      await truffleAssert.fails(
        boraMetaToken.mintTo(userB, { from: userA }),
        truffleAssert.ErrorType.revert,
        'Ownable: caller is not the owner'
      );
    });

    // owner attempts to mintTo to userB
    it('should allow owner to mint', async () => {
      const quantity = toBN(10);
      await boraMetaToken.mintTo(userB, { from: owner });
      // Check that the recipient got the correct quantity
      // Token numbers are one higher than option numbers
      const balanceUserA = await boraMetaToken.balanceOf(userA, toTokenId(vals.CLASS_COMMON));
      console.log("balanceUserA: ", balanceUserA);
      // assert.isOk(balanceUserA.eq(quantity));
      // // Check that balance is correct
      // const balanceOf = await boraMetaToken.balanceOf(owner, vals.CLASS_COMMON);
      // assert.isOk(balanceOf.eq(toBN(vals.MINT_INITIAL_SUPPLY).sub(quantity)));
      // // Check that total supply is correct
      // const premintedRemaining = await boraMetaToken.balanceOf(owner, toTokenId(vals.CLASS_COMMON));
      // assert.isOk(premintedRemaining.eq(toBN(vals.MINT_INITIAL_SUPPLY).sub(quantity)));
    });

    it('should allow proxy to mint', async () => {
      const quantity = toBN(100);
      //FIXME: move all quantities to top level constants
      const total = toBN(110);
      // await boraMetaToken.mintTo(userA, { from: proxyForOwner });
      await boraMetaToken.mintTo(userA, { from: proxy.address });
      // Check that the recipient got the correct quantity
      const balanceUserA = await boraMetaToken.balanceOf(
        userA,
        toTokenId(vals.CLASS_COMMON)
      );
      assert.isOk(balanceUserA.eq(total));
      // Check that balance is correct
      const balanceOf = await boraMetaToken.balanceOf(owner, vals.CLASS_COMMON);
      assert.isOk(balanceOf.eq(toBN(vals.MINT_INITIAL_SUPPLY).sub(total)));
      // Check that total supply is correct
      const premintedRemaining = await boraMetaToken.balanceOf(
        owner,
        toTokenId(vals.CLASS_COMMON)
      );
      assert.isOk(premintedRemaining.eq(toBN(vals.MINT_INITIAL_SUPPLY).sub(total)));
    });
  });

});


  // /**
  //  * NOTE: This check is difficult to test in a development
  //  * environment, due to the OwnableDelegateProxy. To get around
  //  * this, in order to test this function below, you'll need to:
  //  *
  //  * 1. go to BoraMetaToken.sol, and
  //  * 2. modify _isOwnerOrProxy
  //  *
  //  * --> Modification is:
  //  *      comment out
  //  *         return owner() == _address || address(proxyRegistry.proxies(owner())) == _address;
  //  *      replace with
  //  *         return true;
  //  * Then run, you'll get the reentrant error, which passes the test
  //  **/

  // describe('Re-Entrancy Check', () => {
  //   it('Should have the correct factory address set',
  //     async () => {
  //       assert.equal(await attacker.factoryAddress(), boraMetaToken.address);
  //     });

  //   // With unmodified code, this fails with:
  //   //   BoraMetaToken#_mint: CANNOT_MINT_MORE
  //   // which is the correct behavior (no reentrancy) for the wrong reason
  //   // (the attacker is not the owner or proxy).

  //   xit('Minting from factory should disallow re-entrancy attack',
  //     async () => {
  //       await truffleAssert.passes(
  //         boraMetaToken.mint(1, userA, 1, "0x0", { from: owner })
  //       );
  //       await truffleAssert.passes(
  //         boraMetaToken.mint(1, userA, 1, "0x0", { from: userA })
  //       );
  //       await truffleAssert.fails(
  //         boraMetaToken.mint(
  //           1,
  //           attacker.address,
  //           1,
  //           "0x0",
  //           { from: attacker.address }
  //         ),
  //         truffleAssert.ErrorType.revert,
  //         'ReentrancyGuard: reentrant call'
  //       );
  //     });
  // });