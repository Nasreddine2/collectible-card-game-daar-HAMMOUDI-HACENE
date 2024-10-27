import { AppBar } from '@/components/AppBar'
import SideBar from '@/components/SideBar'
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
import { useWalletStore } from '@/store/walletStore'
import { useCollectionsStore } from '@/store/collectionsStore'
import axios from 'axios'
import PokeCard from '@/components/PokeCard'
import PokeCardNonNft from '@/components/PokeCardNonNft'
import { Typography, Grid } from '@mui/material'

export const AdminLayout = () => {
  const walletStore = useWalletStore()
  const collectionsStore = useCollectionsStore()
  const [activePage, setActivePage] = useState('Cards')
  const [isSnackBarOpen, setIsSnackbarOpen] = useState(false)
  const [snackBarData, setSnackBarData] = useState({
    message: '',
    severity: 'success',
  })
  const [cardsImages, setCardImages] = useState([])
  const [isReadyToMint, setIsReadyToMint] = useState(false)
  const [collectionToMint, setCollectionToMint] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [affichage, setaffichage] = useState('acceuil')
  const [set, setSet] = useState([])
  const [imagesToMint, setImagesToMint] = useState([])

  const onClickAddButton = async collectionId => {
    try {
      setIsLoading(true)
      const { data: rawData } = await axios.get(
        `http://localhost:3000/api/sets/${collectionId}`
      )
      setCollectionToMint(rawData)

      const { data: cardsData } = await axios.get(
        `http://localhost:3000/api/collections/${collectionId}/cards`
      )

      const images = cardsData.map(c => c.images.small)
      setImagesToMint(images.map(image => ({ image })))
      setIsReadyToMint(true)
    } catch (err) {
      setSnackBarData({
        message: 'This set does not exist',
        severity: 'error',
      })
      setIsSnackbarOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const onClickMintButton = async () => {
    try {
      if (!walletStore.mainContract || !collectionToMint) return

      setIsLoading(true)
      const { data: cardsData } = await axios.get(
        `http://localhost:3000/api/collections/${collectionToMint.id}/cards`
      )

      const minting = await walletStore.mainContract.createCollection(
        collectionToMint.name,
        collectionToMint.id,
        cardsData.map(c => c.id),
        collectionToMint.total
      )

      await minting.wait()

      setIsReadyToMint(false)
      await collectionsStore.fetchCollections()

      const activeCollection = collectionsStore.collections.find(
        c => c.collectionId === collectionToMint.id
      )
      if (activeCollection)
        collectionsStore.setActiveCollection(activeCollection)
      setCollectionToMint(null)
      setIsLoading(false)
      setaffichage('accueil')
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const { data: setsData } = await axios.get(
          'http://localhost:3000/api/sets/'
        )
        setSet(setsData)
      } catch (err) {
        console.error('Error fetching sets:', err)
        setSnackBarData({
          message: 'Failed to fetch sets',
          severity: 'error',
        })
        setIsSnackbarOpen(true)
      }
    }
    fetchSets()
  }, [])

  useEffect(() => {
    const unsub = useCollectionsStore.subscribe(async (state, prevState) => {
      if (state.activeCollection == null) return

      const { data: cardsData } = await axios.get(
        `http://localhost:3000/api/collections/${state.activeCollection.collectionId}/cards`
      )

      const images = cardsData.map(c => c.images.small)
      setCardImages(
        images.map((image, idx) => ({
          image,
          nftId: state.activeCollection?.ntfIds[idx] ?? -1,
        }))
      )
      setIsLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    const init = async () => {
      await walletStore.updateWallet()
    }

    init()
  }, [])

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar />
      <SideBar
        onClickAddButton={onClickAddButton}
        isAdmin={walletStore.isAdmin()}
        setActivePage={setActivePage}
        setaffichage={setaffichage}
        setIsReadyToMint={setIsReadyToMint}
      />

      {affichage === 'acceuil' && (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }} className="pt-5">
          {/* Bannière d'accueil */}
          <Box
            sx={{
              backgroundImage: 'url("")', // Remplacez par l'URL de votre image
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: '3rem',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              mb: 4,
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              Bienvenue dans l'interface de gestion Pokémon
            </Typography>
            <Typography variant="h5" mt={2}>
              Gérez vos collections, mettez vos cartes en vente et explorez de
              nouvelles collections
            </Typography>
          </Box>

          {/* Sections des fonctionnalités */}
          <Grid container spacing={4}>
            {/* Section Collections */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  padding: '2rem',
                  backgroundColor: '#266899',
                  color: 'white',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <img
                  src="../../public/trading.png"
                  alt="Collections"
                  width="80"
                  height="80"
                />
                <Typography variant="h5" fontWeight="bold" mt={2}>
                  Collections
                </Typography>
                <Typography variant="body1" mt={1}>
                  Visualisez et gérez vos collections existantes de cartes
                  Pokémon.
                </Typography>
              </Box>
            </Grid>

            {/* Section Mint de nouvelles collections */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  padding: '2rem',
                  backgroundColor: '#3C9EE7',
                  color: 'white',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <img
                  src="../../public/plus.png"
                  alt="Mint Collection"
                  width="80"
                  height="80"
                />
                <Typography variant="h5" fontWeight="bold" mt={2}>
                  Mint de nouvelles collections
                </Typography>
                <Typography variant="body1" mt={1}>
                  Cherchez et mintez de nouvelles collections pour enrichir
                  votre inventaire.
                </Typography>
              </Box>
            </Grid>

            {/* Section Vente et Transfert */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  padding: '2rem',
                  backgroundColor: '#18517a',
                  color: 'white',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <img
                  src="../../public/trade.png"
                  alt="Sell or Transfer"
                  width="80"
                  height="80"
                />
                <Typography variant="h5" fontWeight="bold" mt={2}>
                  Mise en vente et transfert
                </Typography>
                <Typography variant="body1" mt={1}>
                  Mettez vos cartes en vente ou transférez-les à d'autres
                  utilisateurs.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {affichage === 'nonft' && (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ marginTop: '3rem', textAlign: 'center' }}>
            {/* Titre de la collection */}
            <Typography
              variant="h4"
              color="primary"
              fontWeight="bold"
              gutterBottom
            >
              {collectionToMint?.name || 'Nom de la Collection'}
            </Typography>

            {/* Bouton de Mint */}
            {isReadyToMint && (
              <Button
                onClick={onClickMintButton}
                variant="contained"
                sx={{
                  backgroundColor: '#9b4e9d',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  padding: '0.8rem 3rem',
                  marginTop: '1rem',
                  ':hover': { backgroundColor: '#7a3d7e' },
                }}
              >
                Mint Collection
              </Button>
            )}
          </Box>

          {/* Affichage des cartes à mint */}
          {!isLoading ? (
            <Box
              className="cards-container"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                justifyContent: 'center',
                marginTop: '2rem',
              }}
            >
              {isReadyToMint &&
                imagesToMint.map((image, index) => (
                  <PokeCardNonNft image={image.image} key={index} />
                ))}
            </Box>
          ) : (
            <Backdrop sx={{ color: '#fff', zIndex: 10 }} open={isLoading}>
              <CircularProgress color="inherit" />
            </Backdrop>
          )}
        </Box>
      )}

      {affichage === 'nft' && (
        <Box key={affichage} component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ marginTop: '3rem' }}>
            {!isLoading ? (
              <div className="cards-container">
                {!isReadyToMint &&
                  cardsImages.length > 0 &&
                  cardsImages.map((image, index) =>
                    image?.nftId !== -1 && image?.image ? (
                      <PokeCard
                        nftId={image.nftId}
                        key={image.image}
                        refresh={async () => {
                          /* Add your refresh logic here */
                        }}
                      />
                    ) : (
                      <div key={index}>Card not available</div>
                    )
                  )}
              </div>
            ) : (
              <Backdrop sx={{ color: '#fff', zIndex: 10 }} open={isLoading}>
                <CircularProgress color="inherit" />
              </Backdrop>
            )}
          </Box>
        </Box>
      )}

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
