// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BoosterNft is Ownable {
    struct Booster {
        uint256 boosterId;
        string name;
        uint256 price; // Prix en ETH
        uint256[] cardIds; // Cartes contenues dans ce booster
    }

    struct Player {
        mapping(uint256 => Booster) boosters; // Les boosters achetés par le joueur
        mapping(uint256 => uint256) nonNftCards; // Cartes non-NFT et le nombre par type
    }

    uint256 public nextBoosterId;
    mapping(uint256 => Booster) public boostersForSale; // Boosters mis en vente par l'admin
    mapping(address => Player) private players; // Enregistrement des joueurs (PRIVÉ)

    event BoosterPurchased(address indexed buyer, uint256 boosterId);
    event BoosterOpened(address indexed player, uint256 boosterId, uint256[] cards);

    // Constructeur qui passe l'adresse de l'owner initial au constructeur Ownable
    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Ajouter un booster en vente
    /// @param _name Nom du booster
    /// @param _price Prix du booster en ETH
    /// @param _cardIds Identifiants des cartes dans ce booster
    function addBoosterForSale(string memory _name, uint256 _price, uint256[] memory _cardIds) public onlyOwner {
        uint256 boosterId = nextBoosterId++;
        boostersForSale[boosterId] = Booster(boosterId, _name, _price, _cardIds);
    }

    /// @notice Acheter un booster
    /// @param _boosterId Identifiant du booster
    function purchaseBooster(uint256 _boosterId) public payable {
        require(boostersForSale[_boosterId].price > 0, "Booster not found");
        require(msg.value == boostersForSale[_boosterId].price, "Incorrect ETH value");

        // Enregistre l'achat pour le joueur
        players[msg.sender].boosters[_boosterId] = boostersForSale[_boosterId];
        
        emit BoosterPurchased(msg.sender, _boosterId);
    }

    /// @notice Ouvrir un booster et ajouter les cartes au compte du joueur
    /// @param _boosterId Identifiant du booster à ouvrir
    function openBooster(uint256 _boosterId) public {
        require(players[msg.sender].boosters[_boosterId].boosterId > 0, "Booster not owned");

        Booster memory booster = players[msg.sender].boosters[_boosterId];
        
        // Transférer les cartes non-NFT au joueur
        for (uint256 i = 0; i < booster.cardIds.length; i++) {
            players[msg.sender].nonNftCards[booster.cardIds[i]] += 1;
        }

        // Supprime le booster une fois ouvert
        delete players[msg.sender].boosters[_boosterId];

        emit BoosterOpened(msg.sender, _boosterId, booster.cardIds);
    }

    /// @notice Récupérer les cartes non-NFT et leur quantité pour un joueur
    /// @return cardIds Tableau des identifiants de cartes
    /// @return cardCounts Tableau des quantités pour chaque identifiant de carte
    function getNonNftCards() public view returns (uint256[] memory cardIds, uint256[] memory cardCounts) {
        uint256 count = 0;

        // D'abord, on compte combien de cartes non-NFT le joueur possède
        for (uint256 i = 0; i < 10; i++) {
            if (players[msg.sender].nonNftCards[i] > 0) {
                count++;
            }
        }

        // On initialise les tableaux de la taille correcte
        uint256[] memory ids = new uint256[](count);
        uint256[] memory counts = new uint256[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < 10; i++) {
            if (players[msg.sender].nonNftCards[i] > 0) {
                ids[index] = i;
                counts[index] = players[msg.sender].nonNftCards[i];
                index++;
            }
        }

        return (ids, counts);
    }

    /// @notice Récupérer un booster acheté par un joueur
    /// @param _player Adresse du joueur
    /// @param _boosterId Identifiant du booster
    function getBoosterForPlayer(address _player, uint256 _boosterId) public view returns (Booster memory) {
        return players[_player].boosters[_boosterId];
    }



    function getBoostersForSale() external view returns (Booster[] memory) {
     Booster[] memory boosterList = new Booster[](nextBoosterId);

        for (uint256 i = 0; i < nextBoosterId; i++) {
            boosterList[i] = boostersForSale[i];
        }

        return boosterList;
  }

}
