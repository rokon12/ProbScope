import { FC, useState } from 'react'
import { Box, Paper, Popper, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { TokenInfo, TokenAlternative } from '../../types/types'

interface TokenHighlightProps {
  token: TokenInfo
  isSelected?: boolean
}

export const TokenHighlight: FC<TokenHighlightProps> = ({
  token,
  isSelected = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMouseLeave = () => {
    setAnchorEl(null)
  }

  const probabilityColor = `rgba(76, 175, 80, ${token.probability})`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.9 }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ scale: 1.02 }}
    >
      <Box
        component="span"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          display: 'inline-block',
          padding: '4px 8px',
          margin: '2px',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: isSelected ? probabilityColor : 'transparent',
          border: `2px solid ${probabilityColor}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `rgba(76, 175, 80, ${token.probability * 0.5})`,
            transform: 'scale(1.05)',
          },
        }}
      >
        <Typography variant="body1">
          {token.text || '⬚'}
        </Typography>
      </Box>

      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="top"
        transition
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: 'background.paper',
            maxWidth: 300,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Probability: {(token.probability * 100).toFixed(1)}%
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Alternative tokens:
          </Typography>
          {token.alternatives.slice(0, 5).map((alt: TokenAlternative, i: number) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <Typography variant="caption">
                {alt.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(alt.probability * 100).toFixed(1)}%
              </Typography>
            </Box>
          ))}
        </Paper>
      </Popper>
    </motion.div>
  )
}
