import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import AppsIcon from '@mui/icons-material/Apps'
import {
  Button,
  Chip,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'
import { useState } from 'react'

const drawerWidth = 240

const NavMenuItem = ({ item, level, isActive, onClick }) => {
  return (
    <ListItemButton
      sx={{
        mb: 0.5,
        alignItems: 'center',
        backgroundColor: isActive ? '#18517a' : 'inherit',
        py: 1.25,
        pl: `${level * 24}px`,
        borderRadius: '8px',
        '&:hover': {
          backgroundColor: '#1f6692',
        },
      }}
      onClick={onClick}
    >
      <Chip
        color="default"
        variant="filled"
        size="small"
        label={item.count}
        sx={{
          px: '8px',
          backgroundColor: isActive ? '#3C9EE7' : '#3C8AE7',
          color: 'white',
          fontWeight: 'bold',
          marginRight: '10px',
        }}
      />
      <ListItemText
        primary={
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              fontWeight: isActive ? 'bold' : 'normal',
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

export default function UserSideBar({
  cardCount,
  cardMarketCount,
  updateNfts,
  setActivePage,
  loadMarketPlace,
  setAffichage,
  affichage,
}) {
  const drawerWidth = 240

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
          paddingTop: '10px',
        },
      }}
    >
      <Toolbar />
      <Box
        sx={{ overflow: 'auto', backgroundColor: '#266899', paddingX: '10px' }}
      >
        <List>
          {/* Accueil Button */}
          <ListItemButton
            sx={{
              mb: 1.5,
              py: 1.25,
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: '#18517a',
              '&:hover': {
                backgroundColor: '#1f6692',
              },
            }}
            onClick={() => setAffichage('accueil')}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              ACCUEIL
            </Typography>
          </ListItemButton>

          {/* My Collection NavMenuItem */}
          <NavMenuItem
            item={{
              title: 'Ma collection',
              count: cardCount,
            }}
            level={1}
            onClick={async () => {
              setActivePage('My Cards')
              await updateNfts()
              setAffichage('mycards')
            }}
            isActive={affichage === 'mycards'}
          />

          {/* MarketPlace NavMenuItem */}
          <NavMenuItem
            item={{
              title: 'Marché',
              count: cardMarketCount,
            }}
            level={1}
            onClick={async () => {
              setActivePage('MarketPlace')
              await loadMarketPlace()
              setAffichage('marketplace')
            }}
            isActive={affichage === 'marketplace'}
          />
        </List>
      </Box>
    </Drawer>
  )
}
