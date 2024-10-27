import axios from 'axios'
import 'dotenv/config'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const MAIN_WALLLET = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const BASE_URL = 'http://localhost:3000/api/cards/'
const BASE_BOOSTER_URL = 'http://localhost:3000/api/boosters/'

const CARDS_BASE_URL = 'https://api.pokemontcg.io/v2/cards/'

const deployer: DeployFunction = async hre => {
  if (hre.network.config.chainId !== 31337) return
  const { deployer } = await hre.getNamedAccounts()

  // Déployer le contrat des cartes NFT
  const nft = await hre.deployments.deploy('CardNFT', {
    args: [MAIN_WALLLET, BASE_URL],
    from: deployer,
    log: true,
  })

  // Déployer le contrat BoosterMarket (au lieu de BoosterNft)
  const BoosterNft = await hre.deployments.deploy('BoosterNft', {
    args: [MAIN_WALLLET], // Le seul argument est l'adresse de l'owner
    from: deployer,
    log: true,
  })

  // Déployer le contrat principal
  const main = await hre.deployments.deploy('Main', {
    args: [nft.address, BoosterNft.address, MAIN_WALLLET],
    from: deployer,
    log: true,
  })

  // Déployer le contrat du marché de cartes NFT
  const marketPlace = await hre.deployments.deploy('CardMarket', {
    args: [nft.address, MAIN_WALLLET],
    from: deployer,
    log: true,
  })

  // Obtenir une instance du contrat Main
  const mainContract = await hre.ethers.getContractAt(
    'Main',
    main.address,
    deployer
  )

  let cardIds: string[] = []

  // Récupérer les cartes de l'API backend
  try {
    const response = await axios.get(
      `http://localhost:3000/api/collections/base1/cards`
    )

    if (Array.isArray(response.data)) {
      cardIds = response.data.map((c: any) => c.id)
    } else {
      console.error(
        'Les données des cartes ne sont pas dans le format attendu.'
      )
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes:', error)
  }

  if (cardIds.length === 0) {
    console.error('No card IDs found, aborting collection creation.')
    return
  }

  // Créer une collection de cartes dans le contrat principal
  const tx = await mainContract.createCollection('Base', 'base1', cardIds, 102)
  await tx.wait()

  // Obtenir une instance du contrat BoosterMarket
  const boosterContract = await hre.ethers.getContractAt(
    'BoosterNft',
    BoosterNft.address,
    deployer
  )

  // Ajouter des boosters à la vente dans BoosterMarket (utilisation de addBoosterForSale)
  let boosterTx = await boosterContract.addBoosterForSale(
    'Silver',
    hre.ethers.utils.parseEther('0.1'), // Prix en ETH
    [5, 4, 6] // Cartes contenues dans le booster
  )
  await boosterTx.wait()

  boosterTx = await boosterContract.addBoosterForSale(
    'Gold',
    hre.ethers.utils.parseEther('0.2'), // Prix en ETH
    [7, 8, 9] // Cartes contenues dans le booster
  )
  await boosterTx.wait()

  
  
}



export default deployer
