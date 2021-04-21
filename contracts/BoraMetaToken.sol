pragma solidity ^0.5.0;

import "./ERC721Tradable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title BoraMeta
 * BoraMeta - a contract for bora non-fungible meta token.
 */
contract BoraMetaToken is ERC721Tradable {
    constructor(address _proxyRegistryAddress)
        public
        ERC721Tradable("BORA Metaverse NFT", "BMT", _proxyRegistryAddress)
    {}

    function baseTokenURI() public pure returns (string memory) {
        return "https://creatures-api.opensea.io/api/creature/";
    }

    function contractURI() public pure returns (string memory) {
        return "https://creatures-api.opensea.io/contract/opensea-creatures";
    }
}
