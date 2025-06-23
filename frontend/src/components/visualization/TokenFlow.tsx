import { FC } from 'react'
import { Box, Paper, CircularProgress, Alert, Typography, Backdrop } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/store'
import { TokenHighlight } from './TokenHighlight'
import { CurrentTokenSelection } from './CurrentTokenSelection'

import React from 'react';

export const TokenFlow: FC = React.memo(() => {
  const generatedTokens = useStore((state) => state.generatedTokens);
  const error = useStore((state) => state.error);
  const isLoading = useStore((state) => state.isLoading);
  const currentToken = useStore((state) => state.currentToken);

  return (
    <Box>
      {/* Show current token selection animation */}
      {currentToken && (
        <CurrentTokenSelection currentToken={currentToken} />
      )}
    <Paper 
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1,
        flex: 1,
        alignItems: 'flex-start',
        position: 'relative',
        opacity: isLoading || error ? 0.5 : 1,
        transition: 'all 0.3s ease',
        filter: (isLoading || error) ? 'blur(1px)' : 'none',
        pointerEvents: (isLoading || error) ? 'none' : 'auto',
      }}>
        {/* Debug: Show token count */}
        <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
          Tokens: {generatedTokens?.length || 0}
        </Typography>
        
        <AnimatePresence>
          {generatedTokens && generatedTokens.length > 0 ? (
            generatedTokens.map((token, index) => (
              <TokenHighlight
                key={`${token.timestamp}-${index}`}
                token={token}
                isSelected={true}
              />
            ))
          ) : null}
        </AnimatePresence>

        {generatedTokens.length === 0 && !isLoading && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              width: '100%',
              textAlign: 'center',
              mt: 4 
            }}
          >
            Enter a prompt and click play to start generating tokens
          </Typography>
        )}
      </Box>

      <Backdrop
        open={isLoading}
        sx={{
          position: 'absolute',
          color: 'primary.main',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CircularProgress color="inherit" />
        </motion.div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Typography variant="body2" color="common.white">
            Generating tokens...
          </Typography>
        </motion.div>
      </Backdrop>
    </Paper>
    </Box>
  )
})
