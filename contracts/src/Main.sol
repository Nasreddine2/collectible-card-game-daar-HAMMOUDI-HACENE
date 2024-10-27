// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Collection.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Main is Ownable {
  uint private count;

  Collection[] private collections;
  mapping(string => Collection) private collectionsByName;
  address private _cardNftContract;
  address private _boosterContract;

  struct CollectionStruct {
    string name;
    string collectionId;
    uint256 cardCount;
    uint256[] cards;
  }

  constructor(address _address, address _boosterNft, address _owner) Ownable(_owner) {
    count = 0;
    _cardNftContract = _address;
    _boosterContract = _boosterNft;
  }

  function transferCard(address to, uint256 cardId) public {
    CardNFT cardNFT = CardNFT(_cardNftContract);
    address from = cardNFT.ownerOf(cardId);
    require(msg.sender == from, "You must be the owner of the card !");
    cardNFT.transferFrom(from, to, cardId);
  }

 

  function createCollection(
    string calldata name,
    string calldata collectionId,
    string[] calldata cardIds,
    uint256 cardCount
  ) external onlyOwner {
    Collection newCollection = new Collection(
      name,
      collectionId,
      cardCount,
      _cardNftContract
    );
    CardNFT cardNFT = CardNFT(_cardNftContract);
    for (uint i = 0; i < cardCount; i++) {
      // create card
      uint256 cardId = cardNFT.safeMint(owner(), cardIds[i]);

      // add to cards
      newCollection.addCard(cardId);
    }

    collections.push(newCollection);
    collectionsByName[name] = newCollection;
  }

  function getCollections() public view onlyOwner returns (CollectionStruct[] memory) {
    // create an array of collectionStructs
    CollectionStruct[] memory collectionStructs = new CollectionStruct[](
      collections.length
    );
    // loop through collections
    for (uint i = 0; i < collections.length; i++) {
      // get collection
      Collection collection = collections[i];
      // get name
      string memory name = collection.name();
      string memory collectionId = collection.collectionId();
      // get cardCount
      uint256 cardCount = collection.cardCount();
      // get cardNftContract
      uint256[] memory cards = collection.getCards();
      // create collectionStruct
      CollectionStruct memory collectionStruct = CollectionStruct(
        name,
        collectionId,
        cardCount,
        cards
      );
      // add to collectionStructs
      collectionStructs[i] = collectionStruct;
    }
    return collectionStructs;
  }


  function getCollectionById(
    uint256 id
  ) public view onlyOwner returns (CollectionStruct memory) {
    Collection collection = collections[id];
    return
      CollectionStruct(
        collection.name(),
        collection.collectionId(),
        collection.cardCount(),
        collection.getCards()
      );
  }

  function getCollectionByName(
    string memory name
  ) public view onlyOwner returns (CollectionStruct memory) {
    Collection collection = collectionsByName[name];
    return
      CollectionStruct(
        collection.name(),
        collection.collectionId(),
        collection.cardCount(),
        collection.getCards()
      );
  }
}