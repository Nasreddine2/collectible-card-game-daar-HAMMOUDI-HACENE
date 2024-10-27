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
  TextField,
  Typography,
} from '@mui/material'
import { useWalletStore } from '@/store/walletStore'
import axios from 'axios'
import { ethers } from 'ethers'
import { contracts } from '@/contracts.json'

const cardCache = new Map()

export default function PokeCard({ nftId }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardInfo, setCardInfo] = useState(null)
  const [owner, setOwner] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isForSaleOpen, setIsForSaleOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const walletStore = useWalletStore()

  const isOwner = useMemo(
    () => owner === walletStore.details?.account,
    [walletStore.details, owner]
  )

  const transferNft = async address => {
    if (!isOwner || !owner) return

    const isValid = ethers.utils.isAddress(address)
    if (!isValid) {
      console.error('Invalid address:', address)
      return
    }

    if (!walletStore.nftContract) {
      console.error('Contract not found')
      return
    }

    try {
      const tx = await walletStore.nftContract.transferFrom(
        owner,
        address,
        nftId
      )
      await tx.wait()
      setIsDialogOpen(false)

      const newOwner = await walletStore.nftContract.ownerOf(nftId)
      if (newOwner) setOwner(newOwner)
      await refresh()

      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error during NFT transfer:', error)
    }
  }

  const getInfo = async () => {
    setIsLoading(true)
    try {
      let cachedData = cardCache.get(nftId)
      if (cachedData) setCardInfo(cachedData)

      const owner = await walletStore.nftContract?.ownerOf(nftId)
      if (owner) setOwner(owner)

      if (!cachedData) {
        const reqUri = await walletStore.nftContract?.tokenURI(nftId)
        if (reqUri) {
          const { data } = await axios.get(reqUri)
          if (data.data) {
            cardCache.set(nftId, data.data)
            setCardInfo(data.data)
          }
        }
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
    if (!cardInfo) {
      getInfo()
    }
  }, [cardInfo])

  const setForSale = async v => {
    if (!isOwner) {
      console.error('You are not the owner of this card')
      return
    }

    const { nftContract, marketContract, details } = walletStore
    const userAddress = details?.account
    const marketContractAddress = contracts.CardMarket.address

    if (!nftContract || !marketContract || !userAddress) {
      console.error(
        'NFT contract, Market contract, or user address not initialized'
      )
      return
    }

    const isApproved =
      (await nftContract.getApproved(nftId)) === marketContractAddress ||
      (await nftContract.isApprovedForAll(userAddress, marketContractAddress))

    if (!isApproved) {
      const approveTx = await nftContract.approve(marketContractAddress, nftId)
      await approveTx.wait()
    }

    const tx = await marketContract.listNFT(nftId, v)
    await tx.wait()
    await refresh()
    setIsForSaleOpen(false)
  }

  const refresh = async () => {
    await walletStore.updateWallet()
    await getInfo()
  }

  return (
    <div
      className="card"
      style={{
        position: 'relative',
        height: '300px',
        width: '200px', // Assure une largeur fixe pour la carte
        transform: isFlipped ? 'rotateY(180deg)' : '',
        transition: 'all 0.5s',
        cursor: 'pointer',
        borderRadius: '12px', // Coins arrondis
        overflow: 'hidden', // Évite le débordement
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Ajout d'une ombre pour un effet de carte en relief
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
            <img
              src={
                imageLoaded ? cardInfo.images.small : '../public/card-back.jpg'
              } // image de fallback
              onLoad={handleImageLoad}
              onError={e => {
                e.target.src = '../public/card-back.jpg' // Remplace l'image par une image de fallback en cas d'erreur
              }}
              style={{
                opacity: imageLoaded ? 1 : 0,
                height: '100%',
                width: '100%',
                objectFit: 'cover', // Assure que l'image remplit bien la carte
              }}
              alt={cardInfo?.name || 'Card image'}
            />
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
                background: 'rgba(0,0,0,0.5)',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            color: 'white',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px',
            bgcolor: '#4A90E2', // Couleur de fond ajustée pour un meilleur contraste
          }}
        >
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              Propriétés :
            </Typography>
            <Typography variant="body2">Nom : {cardInfo?.name}</Typography>
            {cardInfo?.level && (
              <Typography variant="body2">
                Niveau : {cardInfo?.level}
              </Typography>
            )}
            {cardInfo?.hp && (
              <Typography variant="body2">Santé : {cardInfo?.hp}</Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px', // Espace entre le badge et les boutons
            }}
          >
            <Chip
              label={isOwner ? 'Carte possédée' : 'Non possédée'}
              variant="filled"
              sx={{
                backgroundColor: isOwner ? 'green' : 'red',
                color: 'white',
                fontWeight: 'bold',
                width: '90%', // Ajuste la largeur pour rester bien centré
                textAlign: 'center',
                fontSize: '0.75rem', // Réduit la taille du texte pour éviter le débordement
              }}
            />
            {isOwner && (
              <Box sx={{ display: 'flex', gap: '10px', width: '100%' }}>
                <Button
                  color="error"
                  variant="contained"
                  fullWidth
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.7rem', // Réduit la taille pour plus de compacité
                    padding: '6px 0',
                    maxWidth: '80px', // Limite la taille du bouton pour qu'il ne dépasse pas
                  }}
                  onClick={() => setIsDialogOpen(true)}
                >
                  TRANSFÉRER
                </Button>
                <Button
                  color="error"
                  variant="contained"
                  fullWidth
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.7rem', // Réduit la taille pour plus de compacité
                    padding: '6px 0',
                    maxWidth: '80px', // Limite la taille du bouton pour qu'il ne dépasse pas
                  }}
                  onClick={() => setIsForSaleOpen(true)}
                >
                  VENDRE
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}
      <TransferCardDialog
        isOpen={isDialogOpen}
        name={cardInfo?.name}
        setIsOpen={setIsDialogOpen}
        transferNft={transferNft}
      />
      <SetForSaleDialog
        isOpen={isForSaleOpen}
        name={cardInfo?.name}
        setIsOpen={setIsForSaleOpen}
        setForSale={setForSale}
      />
    </div>
  )
}
const TransferCardDialog = ({ isOpen, setIsOpen, name, transferNft }) => {
  const [address, setAddress] = useState('')

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
        Transférer le NFT
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: '1rem' }}>
          Pour transférer <strong>{name}</strong>, entrez l'adresse du
          destinataire.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Adresse du destinataire"
          fullWidth
          variant="outlined"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: '#ff4d4d' }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#4caf50',
            color: 'white',
            ':hover': { backgroundColor: '#45a049' },
          }}
          onClick={() => transferNft(address)}
        >
          Envoyer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const SetForSaleDialog = ({ isOpen, setIsOpen, name, setForSale }) => {
  const [price, setPrice] = useState(1)

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
        Mettre en vente le NFT
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: '1rem' }}>
          Pour mettre en vente <strong>{name}</strong>, entrez le prix souhaité
          en ETH.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Prix (ETH)"
          type="number"
          fullWidth
          variant="outlined"
          value={price}
          onChange={e => setPrice(Number(e.target.value))}
          inputProps={{ min: 1 }} // Définit la valeur minimale
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: '#ff4d4d' }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#4caf50',
            color: 'white',
            ':hover': { backgroundColor: '#45a049' },
          }}
          onClick={() => setForSale(price)}
        >
          Définir le prix
        </Button>
      </DialogActions>
    </Dialog>
  )
}
