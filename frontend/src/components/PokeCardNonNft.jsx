import { useState } from 'react'
import { Box, CircularProgress } from '@mui/material'

export default function PokeCardNonNft({ image }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  return (
    <div
      className="card"
      style={{
        position: 'relative',
        height: '300px',
        transform: isFlipped ? 'rotateY(180deg)' : '',
        transition: 'all 0.5s',
        cursor: 'pointer',
      }}
      onClick={() => {
        if (imageLoaded) {
          setTimeout(() => setIsFlipped(!isFlipped), 500)
        }
      }}
    >
      <img
        src={image}
        onLoad={handleImageLoad}
        style={{
          opacity: imageLoaded ? 1 : 0,
          height: '100%',
          width: '100%',
        }}
        alt="Card image"
      />
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
            background: 'rgba(0,0,0,0.7)',
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </div>
  )
}
