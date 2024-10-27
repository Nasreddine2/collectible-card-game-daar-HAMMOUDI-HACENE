const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const axios = require('axios')
const fs = require('fs').promises
const path = require('path')
require('dotenv').config()

const PORT = 3000
const BASE_SETS_URL = 'https://api.pokemontcg.io/v2/sets'
const BASE_CARDS_URL = 'https://api.pokemontcg.io/v2/cards'

// boosters
const boosterData = [
  {
    id: 1,
    name: 'Silver',
    cardCount: 3,
  },
  {
    id: 2,
    name: 'Gold',
    cardCount: 3,
  },
  {
    id: 3,
    name: 'Platinium',
    cardCount: 3,
  },
]

// manual cache
const sets = {}
const cardsForSets = {}
const cards = {}
const set = {}

const app = express()
app.use(cors())
app.use(morgan('dev'))

// API Key
const apiKey = process.env.POKEMON_API_KEY

if (!apiKey) {
  console.error("La clé API Pokémon n'est pas définie dans .env")
  process.exit(1)
}

// Helper function to load JSON from a file
const loadLocalJson = async filePath => {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    console.log(`File loaded successfully from ${filePath}`) // Logging file load success
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading file from ${filePath}:`, error)
    return null
  }
}

// Function to find cards locally from the 'cards/en' directory
const findCardsLocally = async setId => {
  const filePath = path.join(__dirname, 'db', 'cards', 'en', `${setId}.json`)
  console.log(`Looking for cards in ${filePath}`) // Logging path to file

  try {
    const cardsData = await loadLocalJson(filePath)
    if (cardsData) {
      console.log(`Cards found: ${cardsData.length} cards from ${setId}`) // Log how many cards were found
    } else {
      console.log(`No data found in ${filePath}.`)
    }
    return cardsData || []
  } catch (error) {
    console.error(`Error loading cards for set ${setId}:`, error)
    return []
  }
}

// Function to find a set locally
const findSetLocally = async setId => {
  const filePath = path.join(__dirname, 'db', 'sets', 'en.json')
  console.log(`Looking for set in ${filePath}`)

  try {
    const setsData = await loadLocalJson(filePath)
    if (setsData) {
      // Look for the specific set by its setId
      const foundSet = setsData.find(set => set.id === setId)
      if (foundSet) {
        console.log(`Set ${setId} found locally.`)
        return foundSet
      } else {
        console.log(`Set ${setId} not found locally.`)
      }
    }
    return null
  } catch (error) {
    console.error(`Error loading set for id ${setId}:`, error)
    return null
  }
}
const findSetsLocally = async () => {
  const filePath = path.join(__dirname, 'db', 'sets', 'en.json')
  console.log(`Looking for set in ${filePath}`)

  try {
    const setsData = await loadLocalJson(filePath)
    if (setsData) {
      console.log(`Sets found locally.`)
      return setsData
    } else {
      console.log(`Sets not found locally.`)
    }
    return null
  } catch (error) {
    console.error(`Error loading set for id :`, error)
    return null
  }
}

//
const findDeckLocally = async setId => {
  const filePath = path.join(__dirname, 'db', 'decks', 'en', `${setId}.json`)
  console.log(`Looking for decks in ${filePath}`) // Logging path to file

  try {
    const decksData = await loadLocalJson(filePath)
    if (decksData) {
      console.log(`decks found: ${decksData.length} decks from ${setId}`) // Log how many cards were found
    } else {
      console.log(`No data found in ${filePath}.`)
    }
    return decksData || []
  } catch (error) {
    console.error(`Error loading cards for set ${setId}:`, error)
    return []
  }
}
//

// Routes

app.get('/api/sets/', async (req, res) => {
  let set = await findSetsLocally()

  if (set) {
    return res.json(set)
  }
})
app.get('/api/sets/:setId', async (req, res) => {
  const setId = req.params.setId

  // First, look for the set locally
  let set = await findSetLocally(setId)

  if (set) {
    // If the set is found locally, return it
    return res.json(set)
  }

  // If not found locally, make an API request
  axios
    .get(`${BASE_SETS_URL}/${setId}`, {
      headers: {
        'X-Api-Key': apiKey, // assuming you're using an API key
      },
    })
    .then(response => {
      sets[setId] = response.data // Optionally cache the result
      return res.json(response.data) // Return data from the API
    })
    .catch(error => {
      console.error(`Error fetching set from API for ${setId}:`, error.message)
      return res.status(500).json({ error: error.message })
    })
})

// Function to get card details from the `cards/en` folder
const getCardsDetailsFromDeck = async deckList => {
  const cardDetails = []

  // Vérifie que deckList est un tableau de decks
  if (!Array.isArray(deckList)) {
    console.error('Error: deckList is not an array:', deckList)
    return []
  }

  // Choisir un deck aléatoire
  const randomDeckIndex = Math.floor(Math.random() * deckList.length)
  const deck = deckList[randomDeckIndex] // Sélectionner un deck aléatoire
  console.log('Selected Deck:', deck)

  // Vérifie que le deck sélectionné contient bien des cartes
  if (!deck || !Array.isArray(deck.cards)) {
    console.error('Error: deck.cards is not an array:', deck.cards)
    return []
  }

  // Boucler sur les cartes du deck
  for (const card of deck.cards) {
    const cardId = card.id

    // Trouver le setId à partir de l'ID de la carte
    const setId = cardId.split('-')[0]
    console.log(`Looking for card details for ${cardId} in set ${setId}`)

    const cardFilePath = path.join(
      __dirname,
      'db',
      'cards',
      'en',
      `${setId}.json`
    )

    // Charger les données de la carte pour le set
    const setCards = await loadLocalJson(cardFilePath)

    if (setCards) {
      const cardDetail = setCards.find(c => c.id === cardId)
      if (cardDetail) {
        cardDetails.push({ ...card, details: cardDetail })
      }
    }
  }

  return { deck, cardDetails } // Retourner à la fois le deck et les détails des cartes
}

const findRandomDeckInCollection = async collectionId => {
  const decksFolderPath = path.join(__dirname, 'db', 'decks', 'en')
  try {
    const files = await fs.readdir(decksFolderPath)

    const decksForCollection = files.filter(
      file => file.startsWith(collectionId) && file.endsWith('.json')
    )

    if (decksForCollection.length === 0) {
      console.log(`No decks found for collection ${collectionId}`)
      return null
    }

    // Choose a random deck from the available decks
    const randomDeckFile =
      decksForCollection[Math.floor(Math.random() * decksForCollection.length)]
    const randomDeckFilePath = path.join(decksFolderPath, randomDeckFile)

    // Load the deck data from the JSON file
    return await loadLocalJson(randomDeckFilePath)
  } catch (error) {
    console.error(`Error loading decks for collection ${collectionId}:`, error)
    return null
  }
}

app.get('/api/collections/:collectionId/deck', async (req, res) => {
  const collectionId = req.params.collectionId

  try {
    // Fetch a list of decks for this collection
    const deckList = await findRandomDeckInCollection(collectionId)

    if (!deckList) {
      return res
        .status(404)
        .json({ error: 'No decks found for this collection.' })
    }

    // Fetch card details for a random deck
    const { deck, cardDetails } = await getCardsDetailsFromDeck(deckList)

    // Return the deck in the desired format
    return res.json({
      deck: {
        id: deck.id,
        name: deck.name,
        types: deck.types,
        cards: cardDetails, // Détails des cartes
      },
    })
  } catch (error) {
    console.error('Error fetching deck:', error)
    return res.status(500).json({ error: 'Server error fetching the deck.' })
  }
})

// Route to retrieve all cards from a specific collection
app.get('/api/collections/:collectionId/cards', async (req, res) => {
  const collectionId = req.params.collectionId

  try {
    const cardsInCollection = await findCardsLocally(collectionId)

    if (!cardsInCollection || cardsInCollection.length === 0) {
      console.log(`No cards found for collection ${collectionId}`)
      return res
        .status(404)
        .json({ error: 'No cards found for this collection.' })
    }

    return res.json(cardsInCollection)
  } catch (error) {
    console.error('Error retrieving cards for the collection:', error)
    return res.status(500).json({ error: 'Server error retrieving cards.' })
  }
})

// Route to retrieve a specific card
app.get('/api/cards/:cardId', async (req, res) => {
  const cardId = req.params.cardId

  // Search first in the manual cache
  let card = cards[cardId]
  if (!card) {
    // If the card is not in cache, fetch it from the API
    try {
      const response = await axios.get(`${BASE_CARDS_URL}/${cardId}`, {
        headers: {
          'X-Api-Key': apiKey,
        },
      })
      card = response.data
      cards[cardId] = card // Add to cache
    } catch (error) {
      return res.status(500).json({
        error: 'Error fetching card from the API.',
      })
    }
  }

  return res.json(card)
})

app.get('/api/boosters/', (req, res) => {
  return res.json(boosterData)
})

app.get('/api/boosters/:boosterId', (req, res) => {
  return res.json(boosterData[req.params.boosterId])
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
