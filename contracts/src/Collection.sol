// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CardNft.sol";

contract Collection is Ownable {
  string public name;
  string public collectionId;
  uint256 public cardCount;
  // list of CardNft nfts
  uint256[] public cards;
  address private _cardNftContract;

  constructor(
    string memory _name,
    string memory _collectionId,
    uint256 _cardCount,
    address cardNftContract
  ) Ownable(msg.sender) {
    name = _name;
    cardCount = _cardCount;
    collectionId = _collectionId;
    _cardNftContract = cardNftContract;
  }

  function addCard(uint256 cardId) external onlyOwner {
    cards.push(cardId);
  }

  function getCards() public view returns (uint256[] memory) {
    return cards;
  }
}
