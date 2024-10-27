import { Toolbar, Typography, AppBar as MuiAppBar } from '@mui/material'
import { Link } from 'react-router-dom'
export const AppBar = () => {
  return (
    <MuiAppBar
      position="fixed"
      sx={{
        zIndex: theme => theme.zIndex.drawer + 1,
        backgroundColor: '#cc960c',
      }}
    >
      <Toolbar>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <img
            src="../public/title-image.png"
            alt="Pokémon Card"
            style={{ width: '100px', height: '50px', marginRight: '10px' }}
          />
          <Typography variant="h6" noWrap component="div">
            Pokémon
          </Typography>
        </Link>
      </Toolbar>
    </MuiAppBar>
  )
}
