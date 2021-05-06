/* libraries used */

const truffleAssert = require('truffle-assertions');

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
  const agent = accounts[3];
  const proxyForOwner = accounts[8];  // Opensea proxy address

  let boraMetaToken;
  let proxy;
  let attacker;


  const CONTRACT_URI = "https://test-nft.boraecosystem.com/api/bmt";

  before(async () => {
    // boraMetaToken = await BoraMetaToken.deployed();

    proxy = await MockProxyRegistry.new();
    await proxy.setProxy(userA, proxyForOwner);
    boraMetaToken = await BoraMetaToken.new(proxy.address);

  });

  describe('#constructor()', () => {

    it('should set the contractURI to the supplied value', async () => {
      assert.equal(await boraMetaToken.contractURI(), CONTRACT_URI);
    });

    it('should set proxyRegistryAddress to the supplied value', async () => {
      assert.equal(await boraMetaToken.proxyRegistryAddress(), proxy.address);
    });

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

  let toTokenId1 = "1";
  describe('#mint()', () => {

    // owner attempts to mint to userB
    it('should allow owner to mint', async () => {
      const quantity = toBN(1);
      await boraMetaToken.mint(userB, { from: owner });
      const balanceUserA = await boraMetaToken.balanceOf(userB);
      assert.isOk(balanceUserA.eq(quantity));
    });

    // userA attempts to mint to userB
    it('should not allow non-owner or non-operator to mint', async () => {
      await truffleAssert.fails(
        boraMetaToken.mint(userB, { from: userA }),
        truffleAssert.ErrorType.revert,
        'Ownable: caller is not the owner'
      );
    });

  });

  describe('#safeTransferFrom()', () => {

    // non tokenOwner attempts to transfer toTokenId1 to userA
    it('should not allow non tokenOwner to transfer', async () => {
      await truffleAssert.fails(
        boraMetaToken.safeTransferFrom(userB, userA, toTokenId1, { from: owner }),
        truffleAssert.ErrorType.revert,
        'ERC721: transfer caller is not owner nor approved.'
      );
    });

    // userB attempts to transfer toTokenId1 to userA
    it('should allow tokenOwner to transfer', async () => {
      await boraMetaToken.safeTransferFrom(userB, userA, toTokenId1, { from: userB });
    });

    // proxyAddress attempts to transfer toTokenId1 back to userB
    it('should allow proxyAddress to transfer', async () => {
      await boraMetaToken.safeTransferFrom(userA, userB, toTokenId1, { from: proxyForOwner });
    });

    // approved account attempts to transfer toTokenId1 back to userA
    it('should allow approved account to transfer', async () => {
      await boraMetaToken.approve(agent, toTokenId1, {from: userB});
      await boraMetaToken.safeTransferFrom(userB, userA, toTokenId1, { from: agent });
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