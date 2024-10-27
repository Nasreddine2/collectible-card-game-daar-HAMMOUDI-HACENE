import { ThemeProvider, createTheme } from '@mui/material'
import { AdminLayout } from './layouts/Layout'
import { UserLayout } from './layouts/UserLayout'
import { Home } from './layouts/Home' // Assurez-vous du bon chemin d'import
import { useWalletStore } from './store/walletStore'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'

export const App = () => {
  const theme = createTheme()
  const walletStore = useWalletStore()

  useEffect(() => {
    const init = async () => {
      await walletStore.updateWallet()
    }

    useWalletStore.subscribe((newState, oldState) => {
      if (!oldState.details?.account) {
        return
      }

      if (newState.details?.account !== oldState.details?.account) {
        window.location.reload()
      }
    })

    init()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<Home />} />

          {/* Layout Admin et Utilisateur basés sur le statut de l'utilisateur */}
          {walletStore.details && walletStore.isAdmin() ? (
            <Route path="/admin/*" element={<AdminLayout />} />
          ) : (
            <Route path="/user/*" element={<UserLayout />} />
          )}

          {/* Redirection vers la page d'accueil si aucune route ne correspond */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
