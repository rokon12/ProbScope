import React, { FC } from 'react';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenInfo } from '../../types/types';

interface CurrentTokenSelectionProps {
  currentToken: TokenInfo | null;
}

export const CurrentTokenSelection: FC<CurrentTokenSelectionProps> = React.memo(({ currentToken }) => {
  if (!currentToken) return null;

  // Get top 10 alternatives including the selected token
  const allTokens = [
    { text: currentToken.text, probability: currentToken.probability, isSelected: true },
    ...currentToken.alternatives.slice(0, 9).map(alt => ({ ...alt, isSelected: false }))
  ].sort((a, b) => b.probability - a.probability);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3,
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
            border: '2px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Selecting Next Token...
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            {allTokens.map((token, index) => (
              <motion.div
                key={`${token.text}-${index}`}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
              >
                <Box 
                  sx={{ 
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: token.isSelected ? 'primary.dark' : 'transparent',
                    border: token.isSelected ? '2px solid' : 'none',
                    borderColor: 'primary.light',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: token.isSelected ? 'bold' : 'normal',
                        color: token.isSelected ? 'primary.light' : 'text.primary'
                      }}
                    >
                      "{token.text}"
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={token.isSelected ? 'primary.light' : 'text.secondary'}
                    >
                      {(token.probability * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={token.probability * 100} 
                    sx={{ 
                      height: 6,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: token.isSelected ? 'primary.light' : 'success.main',
                      }
                    }}
                  />
                </Box>
              </motion.div>
            ))}
          </Box>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
});