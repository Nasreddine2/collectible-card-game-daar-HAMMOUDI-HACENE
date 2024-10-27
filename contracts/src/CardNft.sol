// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract CardNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
  uint256 private _nextTokenId;
  string private _baseTokenURI;

  constructor(
    address initialOwner,
    string memory newbaseURI
  ) ERC721("CartNft", "AFS") Ownable(initialOwner) {
    _baseTokenURI = newbaseURI;
  }

  function setBaseURI(string memory newbaseURI) public onlyOwner {
    _baseTokenURI = newbaseURI;
  }

  function baseURI() public view returns (string memory) {
    return _baseTokenURI;
  }

  function safeMint(address to, string memory cardId) public returns (uint256) {
    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);
    console.log(string.concat(_baseTokenURI , cardId));
    _setTokenURI(tokenId, string.concat(_baseTokenURI , cardId));
    return tokenId;
  }

  // The following functions are overrides required by Solidity.

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal override(ERC721, ERC721Enumerable) returns (address) {
    return super._update(to, tokenId, auth);
  }

  function _increaseBalance(
    address account,
    uint128 value
  ) internal override(ERC721, ERC721Enumerable) {
    super._increaseBalance(account, value);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    override(ERC721, ERC721Enumerable, ERC721URIStorage)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function getAllMintedTokens() public view returns (uint256[] memory) {
    uint256 total = totalSupply();
    uint256[] memory mintedTokens = new uint256[](total);

    for (uint256 i = 0; i < total; i++) {
      mintedTokens[i] = tokenByIndex(i);
    }

    return mintedTokens;
  }

  function getTokensForOwner(
    address owner
  ) public view returns (uint256[] memory) {
    uint256 total = balanceOf(owner);
    uint256[] memory tokens = new uint256[](total);

    for (uint256 i = 0; i < total; i++) {
      tokens[i] = tokenOfOwnerByIndex(owner, i);
    }

    return tokens;
  }
}
