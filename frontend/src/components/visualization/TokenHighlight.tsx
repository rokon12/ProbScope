import { FC, useState } from 'react'
import { Box, Paper, Popper, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { TokenInfo, TokenAlternative } from '../../types/types'

interface TokenHighlightProps {
  token: TokenInfo
  isSelected?: boolean
  onClick?: (token: TokenInfo) => void
  isSelectedForProbability?: boolean
}

export const TokenHighlight: FC<TokenHighlightProps> = ({
  token,
  isSelected = false,
  onClick,
  isSelectedForProbability = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMouseLeave = () => {
    setAnchorEl(null)
  }

  const handleClick = () => {
    if (onClick) {
      onClick(token)
    }
  }

  const probabilityColor = `rgba(76, 175, 80, ${token.probability})`
  const selectedForProbabilityColor = `rgba(33, 150, 243, ${token.probability})`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      <Box
        component="span"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        sx={{
          display: 'inline-block',
          padding: '4px 8px',
          margin: '2px',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: isSelectedForProbability ? selectedForProbabilityColor : 
                         isSelected ? probabilityColor : 'transparent',
          border: `2px solid ${isSelectedForProbability ? selectedForProbabilityColor : probabilityColor}`,
          borderWidth: isSelectedForProbability ? '3px' : '2px',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            backgroundColor: isSelectedForProbability ? 
              `rgba(33, 150, 243, ${token.probability * 0.7})` :
              `rgba(76, 175, 80, ${token.probability * 0.5})`,
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
            Probability: {token.probability >= 0.001 
              ? `${(token.probability * 100).toFixed(1)}%`
              : `${(token.probability * 100).toFixed(3)}%`
            }
          </Typography>
          {isSelectedForProbability && (
            <Typography variant="caption" display="block" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              📊 Analyzing this token's alternatives
            </Typography>
          )}
          <Typography variant="caption" display="block" gutterBottom>
            {isSelectedForProbability ? 'Click another token to analyze it instead' : 'Click to analyze alternatives in right panel'}
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
                {alt.probability >= 0.001 
                  ? `${(alt.probability * 100).toFixed(1)}%`
                  : `${(alt.probability * 100).toFixed(3)}%`
                }
              </Typography>
            </Box>
          ))}
        </Paper>
      </Popper>
    </motion.div>
  )
}
