import { AppBar } from '@/components/AppBar'
import SideBar from '@/components/SideBar'
import UserSideBar from '@/components/UserSideBar'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Snackbar,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useWalletStore } from '@/store/walletStore'
import axios from 'axios'
import PokeCard from '@/components/PokeCard'
import PokeCardListing from '@/components/PokeCardMarket'
import { Typography } from '@mui/material'
import { Grid } from '@mui/material'

// Pages
const UserPages = {
  MY_CARDS: 'My Cards',
  MARKETPLACE: 'MarketPlace',
  BOOSTERS: 'Boosters',
}

export const UserLayout = () => {
  const walletStore = useWalletStore()

  const [isSnackBarOpen, setIsSnackbarOpen] = useState(false)
  const [snackBarData, setSnackBarData] = useState({
    message: '',
    severity: 'success',
  })
  const [cardNfts, setCardNfts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [marketListings, setMarketListings] = useState([])
  const [activePage, setActivePage] = useState(UserPages.MY_CARDS)
  const [affichage, setAffichage] = useState('accueil')

  const getCards = async () => {
    const cards = await walletStore.nftContract?.getTokensForOwner(
      walletStore.details?.account ?? ''
    )
    console.log('cards:', cards)
    if (!cards) {
      setCardNfts([])
      return
    }

    // Récupère tous les tokenIds listés sur le marketplace
    const listedTokens = marketListings
      .filter(listing => !listing.isSold)
      .map(listing => listing.tokenId)

    console.log('listedTokens:', listedTokens)
    // Filtre les cartes de l'utilisateur pour exclure celles qui sont listées sur le marketplace
    const filteredCards = cards.filter(
      cardId => !listedTokens.includes(Number(cardId))
    )

    console.log('filteredCards:', filteredCards)
    setCardNfts(filteredCards)
  }

  const loadMarketPlace = async () => {
    const offers = await walletStore.getMarketplaceOffers()

    const filteredOffers = offers.filter(async offer => {
      const isSold = await walletStore.marketContract?.isNFTSold(offer.tokenId)

      // On ne garde que les cartes qui ne sont pas encore vendues
      return !isSold
    })

    setMarketListings(filteredOffers)
  }

  useEffect(() => {
    const init = async () => {
      await walletStore.updateWallet()
      await getCards() // Initialiser les cartes de l'utilisateur
      await loadMarketPlace() // Initialiser les annonces de marché
    }

    init()
  }, [])

  const refresh = async () => {
    await walletStore.updateWallet()
    await getCards()
    await loadMarketPlace()
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar />
      <UserSideBar
        updateNfts={getCards}
        setActivePage={page => {
          setAffichage(page === UserPages.MY_CARDS ? 'mycards' : 'marketplace')
        }}
        cardCount={cardNfts.length}
        cardMarketCount={
          marketListings.filter(listing => !listing.isSold).length
        }
        loadMarketPlace={loadMarketPlace}
        setAffichage={setAffichage}
        affichage={affichage}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ marginTop: '3rem' }}>
          {/* Affichage de l'accueil */}

          {affichage === 'accueil' && (
            <Box component="main" sx={{ flexGrow: 1, p: 3 }} className="pt-5">
              {/* Bannière d'accueil */}
              <Box
                sx={{
                  backgroundImage: 'url("../../public/banner-bg.jpg")', // URL de l'image de fond de la bannière
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  padding: '3rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: 'white',
                  mb: 4,
                }}
              >
                <Typography
                  variant="h3"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  Bienvenue, Collectionneur !
                </Typography>
                <Typography variant="h5" mt={2} color="inherit">
                  Explorez le marché, achetez et collectionnez des cartes
                  Pokémon rares, et gérez vos propres cartes en toute sécurité.
                </Typography>
              </Box>

              {/* Sections des fonctionnalités */}
              <Grid container spacing={4} justifyContent="center">
                {/* Section Collections */}
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{
                      padding: '2rem',
                      backgroundColor: '#266899',
                      color: 'white',
                      borderRadius: '12px',
                      textAlign: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      ':hover': {
                        transform: 'scale(1.05)',
                        transition: '0.3s ease',
                      },
                    }}
                  >
                    <img
                      src="../../public/trading.png"
                      alt="Collections"
                      width="80"
                      height="80"
                      style={{ marginBottom: '1rem' }}
                    />
                    <Typography variant="h5" fontWeight="bold" mt={2}>
                      Collections
                    </Typography>
                    <Typography variant="body1" mt={1} mb={2}>
                      Visualisez et gérez vos collections de cartes Pokémon.
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#9b4e9d',
                        color: 'white',
                        padding: '0.8rem 2rem',
                        fontWeight: 'bold',
                        ':hover': { backgroundColor: '#7a3d7e' },
                      }}
                      onClick={() => setAffichage('mycards')}
                    >
                      Accéder à votre collection
                    </Button>
                  </Box>
                </Grid>

                {/* Section Marché */}
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{
                      padding: '2rem',
                      backgroundColor: '#3C9EE7',
                      color: 'white',
                      borderRadius: '12px',
                      textAlign: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      ':hover': {
                        transform: 'scale(1.05)',
                        transition: '0.3s ease',
                      },
                    }}
                  >
                    <img
                      src="../../public/store.png"
                      alt="Marché"
                      width="80"
                      height="80"
                      style={{ marginBottom: '1rem' }}
                    />
                    <Typography variant="h5" fontWeight="bold" mt={2}>
                      Marché
                    </Typography>
                    <Typography variant="body1" mt={1} mb={2}>
                      Parcourez le marché pour acheter des cartes Pokémon rares
                      en toute sécurité.
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#9b4e9d',
                        color: 'white',
                        padding: '0.8rem 2rem',
                        fontWeight: 'bold',
                        ':hover': { backgroundColor: '#7a3d7e' },
                      }}
                      onClick={() => setAffichage('marketplace')}
                    >
                      Accéder au Marché
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Affichage des cartes de l'utilisateur */}
          {affichage === 'mycards' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {cardNfts.map((ntf, index) => (
                <PokeCard nftId={ntf} key={index} refresh={refresh} />
              ))}
            </Box>
          )}

          {/* Affichage du marché */}
          {affichage === 'marketplace' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {marketListings
                .filter(listing => !listing.isSold)
                .map((listing, index) => (
                  <PokeCardListing
                    listing={listing}
                    index={index}
                    key={index}
                    refresh={refresh}
                  />
                ))}
            </Box>
          )}

          {/* Loader */}
          {isLoading && (
            <Backdrop sx={{ color: '#fff', zIndex: 10 }} open={isLoading}>
              <CircularProgress color="inherit" />
            </Backdrop>
          )}
        </Box>
      </Box>

      {/* Notifications */}
      <Snackbar
        open={isSnackBarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        message={snackBarData.message}
      />
      {isSnackBarOpen && (
        <Alert severity={snackBarData.severity}>{snackBarData.message}</Alert>
      )}
    </Box>
  )
}
