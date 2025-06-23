import { Box, Paper, Typography, Button } from '@mui/material';
import { useStore } from '../store/store';
import { TokenInfo } from '../types/types';

export const DebugPanel = () => {
  const store = useStore();
  
  const addTestToken = () => {
    const testToken: TokenInfo = {
      text: `Token${Date.now()}`,
      probability: Math.random(),
      alternatives: [
        { text: 'alt1', probability: 0.3 },
        { text: 'alt2', probability: 0.2 }
      ],
      timestamp: Date.now()
    };
    
    // Directly manipulate store
    useStore.setState(state => ({
      generatedTokens: [...state.generatedTokens, testToken],
      currentToken: testToken
    }));
  };
  
  const clearTokens = () => {
    useStore.setState({ generatedTokens: [], currentToken: null });
  };
  
  return (
    <Paper sx={{ p: 2, m: 2, bgcolor: 'grey.900' }}>
      <Typography variant="h6">Debug Panel</Typography>
      <Box sx={{ my: 1 }}>
        <Typography variant="body2">
          Tokens: {store.generatedTokens.length} | 
          Loading: {String(store.isLoading)} | 
          Playing: {String(store.isPlaying)} |
          Error: {store.error || 'none'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size="small" variant="contained" onClick={addTestToken}>
          Add Test Token
        </Button>
        <Button size="small" variant="outlined" onClick={clearTokens}>
          Clear
        </Button>
      </Box>
      <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
        {store.generatedTokens.map((token, idx) => (
          <Typography key={idx} variant="caption" display="block">
            {idx}: {token.text} (p={token.probability.toFixed(2)})
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};