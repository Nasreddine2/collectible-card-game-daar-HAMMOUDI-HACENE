import { useMemo, useState, useEffect } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import { useWalletStore } from '@/store/walletStore'
import axios from 'axios'
import { ethers } from 'ethers'

export default function PokeCardListing({ listing, index, refresh }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cardInfo, setCardInfo] = useState()
  const [isFlipped, setIsFlipped] = useState(false)
  const walletStore = useWalletStore()

  const isOwner = useMemo(
    () => listing.seller === walletStore.details?.account,
    [walletStore.details, listing]
  )

  const getInfo = async () => {
    setIsLoading(true)
    try {
      const reqUri = await walletStore.nftContract?.tokenURI(listing.tokenId)
      if (reqUri) {
        const { data } = await axios.get(reqUri)
        setCardInfo(data.data)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  useEffect(() => {
    getInfo()
  }, [])

  const buyCard = async () => {
    const tx = await walletStore.marketContract?.buyNFT(index, {
      value: ethers.utils.parseEther(listing.price.toString()),
    })
    await tx?.wait()
    await refresh()
  }

  return (
    <Box
      sx={{
        width: '200px', // Ajustez la largeur de la carte selon vos besoins
        margin: '10px',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        transition: 'transform 0.5s',
        transform: isFlipped ? 'rotateY(180deg)' : 'none',
      }}
      onClick={() => {
        if (imageLoaded) {
          setTimeout(() => setIsFlipped(!isFlipped), 500)
        }
      }}
    >
      {!isFlipped ? (
        <>
          {cardInfo && (
            <>
              <img
                src={cardInfo.images?.small}
                onLoad={handleImageLoad}
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  width: '100%',
                  height: '280px', // Hauteur ajustée pour un bon rendu
                  objectFit: 'cover',
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                }}
                alt={cardInfo.name || 'Card image'}
              />
            </>
          )}

          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              <CircularProgress color="inherit" />
            </Box>
          )}
        </>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '250px',
            color: 'white',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: '#4A90E2',
            borderRadius: '12px',
          }}
        >
          <Typography variant="h6">Propriétés :</Typography>
          <Typography variant="body2">Nom : {cardInfo?.name}</Typography>
          {cardInfo?.level && (
            <Typography variant="body2">Niveau : {cardInfo?.level}</Typography>
          )}
          {cardInfo?.hp && (
            <Typography variant="body2">Santé : {cardInfo?.hp}</Typography>
          )}
        </Box>
      )}
      {isFlipped ? (
        <Box
          sx={{
            padding: '10px',
            textAlign: 'center',
            transform: 'rotateY(180deg)',
          }}
        >
          <Typography variant="h6" color="textPrimary">
            {listing.price} ETH
          </Typography>

          {!listing.isSold && (
            <Button
              variant="contained"
              color="primary"
              onClick={buyCard}
              sx={{
                marginTop: '10px',
                width: '100%',
                fontWeight: 'bold',
                borderRadius: '8px',
              }}
            >
              Acheter
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            padding: '10px',
            textAlign: 'center',
            transform: '',
          }}
        >
          <Typography variant="h6" color="textPrimary">
            {listing.price} ETH
          </Typography>

          {!listing.isSold && (
            <Button
              variant="contained"
              color="primary"
              onClick={buyCard}
              sx={{
                marginTop: '10px',
                width: '100%',
                fontWeight: 'bold',
                borderRadius: '8px',
              }}
            >
              Acheter
            </Button>
          )}
        </Box>
      )}
    </Box>
  )
}
