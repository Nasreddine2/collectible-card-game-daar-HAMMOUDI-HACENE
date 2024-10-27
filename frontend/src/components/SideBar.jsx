import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import { useEffect, useRef } from 'react'
import Divider from '@mui/material/Divider'
import SearchIcon from '@mui/icons-material/Search'
import {
  Button,
  Chip,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'
import { useState } from 'react'
import { useCollectionsStore } from '@/store/collectionsStore'

const drawerWidth = 240

const NavMenuItem = ({ item, level, isActive, onClick }) => {
  return (
    <ListItemButton
      sx={{
        mb: 0.5,
        alignItems: 'flex-start',
        backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
        py: level > 1 ? 1 : 1.25,
        pl: `${level * 24}px`,
      }}
      onClick={onClick}
    >
      <Chip
        color="default"
        variant="filled"
        size="small"
        label={item.count}
        sx={{
          px: '6px',
          backgroundColor: isActive ? '#3C9EE7' : '#3C8AE7',
          marginTop: '4px',
        }}
      />
      <ListItemText
        primary={
          <Typography
            variant="body1"
            color="inherit"
            margin={0}
            marginTop={0}
            sx={{
              color: 'white',
              height: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
              paddingLeft: '10px',
              alignItems: 'center',
              margin: 0,
              opacity: isActive ? 1 : 0.8,
            }}
          >
            {item.title}
          </Typography>
        }
      />
    </ListItemButton>
  )
}

export default function SideBar({
  onClickAddButton,
  isAdmin,
  setActivePage,
  setaffichage,
  setIsReadyToMint,
}) {
  const collectionStore = useCollectionsStore()
  const [collectionId, setCollectionId] = useState('')
  const inputRef = useRef(null)
  console.log('collectionStore', collectionStore)
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#266899',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', backgroundColor: '#266899' }}>
        <List sx={{ paddingLeft: '10px' }}>
          {/* Bouton Accueil */}
          <ListItem>
            <Button
              variant="text"
              size="small"
              sx={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#18517a',
                marginBottom: '1rem',
                borderRadius: '5px',
                ':hover': { backgroundColor: '#1466b8' },
              }}
              onClick={() => setaffichage('acceuil')}
            >
              Accueil
            </Button>
          </ListItem>
          {/* Champ de recherche */}
          <ListItem>
            {isAdmin && (
              <Box
                display="flex"
                sx={{ borderRadius: '5px' }}
                bgcolor="#18517a"
              >
                <input
                  type="text"
                  value={collectionId}
                  placeholder="Rechercher collections" // Placeholder ajouté
                  style={{
                    backgroundColor: '#18517a',
                    outline: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    paddingTop: '10px',
                    paddingRight: '0px',
                    paddingBottom: '10px',
                    paddingLeft: '10px',
                    color: '#d1cfd4',
                    fontWeight: 700,
                    borderRadius: '5px',
                    width: '85%', // Réduit la largeur de l'input pour plus de place au bouton
                    borderTopRightRadius: '0',
                    borderBottomRightRadius: '0',
                    borderRight: '0.5px solid rgba(255,255,255,0.2)',
                  }}
                  onChange={e => setCollectionId(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && collectionId.trim()) {
                      // Vérification ajoutée
                      // Exécuter la recherche quand on appuie sur "Entrée" seulement si le champ n'est pas vide
                      onClickAddButton(collectionId)
                      setCollectionId('')
                      setaffichage('nonft')
                      setIsReadyToMint(true)
                    }
                  }}
                />
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    color: 'white',
                    fontSize: '0.8rem', // Réduit la taille de la police du bouton
                    fontWeight: 700,
                    width: '15%', // Ajuste la largeur du bouton pour qu’il soit plus petit
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: 0, // Évite d'étendre la taille
                    padding: '0 4px', // Ajuste les marges internes du bouton
                  }}
                  onClick={() => {
                    if (collectionId.trim()) {
                      // Vérification ajoutée
                      onClickAddButton(collectionId)
                      setCollectionId('')
                      setaffichage('nonft')
                      setIsReadyToMint(true)
                    }
                  }}
                >
                  <SearchIcon fontSize="small" />
                </Button>
              </Box>
            )}
          </ListItem>

          {/* Liste des collections */}
          {collectionStore.collections.map(collection => (
            <NavMenuItem
              item={{ title: collection.name, count: collection.cardCount }}
              level={0.5}
              onClick={() => {
                collectionStore.setActiveCollection(collection)
                setActivePage('Cards')
                setaffichage('nft')
                setIsReadyToMint(false)
                setCollectionId('')
              }}
              key={collection.name}
              isActive={
                collection.collectionId ===
                collectionStore.activeCollection?.collectionId
              }
            />
          ))}
        </List>
        <Divider sx={{ mt: 0.25, mb: 1.25 }} />
      </Box>
    </Drawer>
  )
}
