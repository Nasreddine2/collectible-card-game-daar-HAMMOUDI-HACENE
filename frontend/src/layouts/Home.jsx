// Home.js
import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useWalletStore } from '../store/walletStore'
import { useEffect } from 'react'

export const Home = () => {
  const navigate = useNavigate()
  const walletStore = useWalletStore()

  // Fonction pour se connecter à MetaMask et vérifier si l'utilisateur est admin
  const connectWallet = async () => {
    try {
      await walletStore.updateWallet()

      // Redirection selon le statut admin ou utilisateur
      if (walletStore.isAdmin()) {
        navigate('/admin')
      } else {
        navigate('/user')
      }
    } catch (error) {
      console.error('Erreur lors de la connexion au portefeuille:', error)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      {/* Image de fond floue */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("../../public/bg1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)', // Applique le flou uniquement au fond
          zIndex: 0,
        }}
      />

      {/* Conteneur central pour le contenu */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fond semi-transparent
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
          }}
        >
          {/* Image du logo au centre */}
          <Box
            component="img"
            src="../../public/logo.png" // Remplacez par le chemin de votre logo
            alt="Logo Pokémon"
            sx={{
              width: '400px', // Ajustez la taille selon vos besoins
              height: 'auto',
              marginBottom: '1rem',
            }}
          />

          <Typography
            variant="h4"
            color="primary"
            fontWeight="bold"
            gutterBottom
          >
            Bienvenue
          </Typography>
          <Typography variant="body1" color="textPrimary" mb={3}>
            Explorez, achetez, vendez et transférez vos cartes Pokémon en toute
            sécurité.
          </Typography>
          <Typography variant="body2" color="textPrimary" mb={3}>
            Veuillez vous connecter avec votre compte MetaMask pour accéder à la
            plateforme.
          </Typography>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#9b4e9d', // Couleur violette pour le bouton
              color: 'white',
              padding: '0.8rem 2rem',
              fontWeight: 'bold',
              ':hover': { backgroundColor: '#7a3d7e' },
            }}
            onClick={connectWallet}
          >
            Commencer
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
