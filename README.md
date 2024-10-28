# collectible-card-game-daar-HAMMOUDI-HACENE

# Pokémon NFT Marketplace

Bienvenue sur **Pokémon NFT Marketplace**, une plateforme décentralisée pour gérer, acheter, vendre et transférer des cartes Pokémon au format NFT. Ce projet utilise **MetaMask** pour l'authentification et l'interaction avec des contrats intelligents déployés sur la blockchain.

## Fonctionnalités

### Utilisateur Administrateur
- **Mint de Nouvelles Collections** : Créez de nouvelles collections de cartes et ajoutez-les directement dans le système.
- **Transfert de Cartes** : Transférez des cartes NFT vers d'autres utilisateurs.
- **Mise en Vente** : Mettez en vente des cartes NFT en définissant un prix en ETH.

### Utilisateur Standard
- **Accueil Utilisateur** : Accédez à votre collection personnelle et au marché de cartes.
- **Achat de Cartes** : Parcourez le marché et achetez des cartes mises en vente par d'autres utilisateurs.
- **Gestion de Cartes** : Consultez votre collection et suivez vos achats, ventes et transferts de cartes NFT.

## Technologies Utilisées

- **Frontend** : React, Material-UI
- **Blockchain** : Solidity pour les contrats intelligents, déployés sur Ethereum
- **Backend** : Nodejs pour la récupération des métadonnées des cartes Pokemon. MetaMask pour l'authentification
- **Smart Contracts** : OpenZeppelin pour la gestion des contrats ERC721 et ERC721Enumerable

## Installation et Déploiement

### Prérequis
Assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/)
- [MetaMask](https://metamask.io/) (extension de navigateur)
- [Ganache](https://www.trufflesuite.com/ganache) (pour un réseau local Ethereum, si nécessaire)
- Un compilateur Solidity (Truffle ou Hardhat recommandé pour la gestion des contrats)

### Étapes


1. **Clonez le projet :**
   ```bash
    git clone https://github.com/Nasreddine2/collectible-card-game-daar-HAMMOUDI-HACENE.git
    cd collectible-card-game-daar-HAMMOUDI-HACENE
   ```
   Installez les dépendances et lancement application :
   Faudra ouvrir 3 Temrinaux :

   **Terminal Contrats**
   ```bash
   cd contrats
   yarn install
   npx hardhat compile
   npx hardhat node
   ```
   **Terminal Backend**

   ```bash
   cd backend
   yarn install
   npm start
   ```
   **Terminal Frontend**
   ```bash
   cd frontend
   yarn install
   npm run dev
   ```

  ## Utilisation
  ### Admin : 
  Accédez à l'interface admin pour gérer les collections, les transferts, et les mises en vente.
  ### Utilisateur : 
  Naviguez sur la plateforme pour consulter votre collection et acheter des cartes disponibles sur le marché.


  ## Licence
  Ce projet est sous licence MIT. Consultez le fichier LICENSE pour plus d'informations.
