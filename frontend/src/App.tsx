import { useState } from 'react'
import { ThemeProvider, CssBaseline, Box, Container, TextField, Grid, Typography, CircularProgress, Button } from '@mui/material'
import { ErrorDisplay } from './components/ErrorDisplay'
import { theme } from './theme'
import { TokenFlow } from './components/visualization/TokenFlow'
import { ProbabilityGraph } from './components/visualization/ProbabilityGraph'
import { TemperatureSlider } from './components/controls/TemperatureSlider'
import { TopKPControls } from './components/controls/TopKPControls'
import { PlaybackControls } from './components/controls/PlaybackControls'
import { LearnMode } from './components/educational/LearnMode'
import { useStore } from './store/store'
import { useTokenGeneration } from './hooks/useTokenGeneration'
import { EXAMPLE_PROMPTS } from './types/types'

const App = () => {
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null)
  const {
    prompt,
    isPlaying,
    speed,
    temperature,
    topK,
    topP,
    generatedTokens,
    isLoading,
    currentToken,
    setPrompt,
    setIsPlaying,
    setSpeed,
    setTemperature,
    setTopK,
    setTopP,
  } = useStore()

  // Initialize token generation
  useTokenGeneration()

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value)
  }
  
  const testStream = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tokens/test-stream');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) return;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        console.log('Test stream received:', text);
      }
    } catch (error) {
      console.error('Test stream error:', error);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ 
          minHeight: '100vh',
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              LLM Token Flow Visualizer
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={testStream} variant="outlined" size="small">
                Test Stream
              </Button>
              <LearnMode onHighlight={setHighlightedElement} />
            </Box>
          </Box>

          <Box component="main" sx={{ flex: 1 }}>
            <ErrorDisplay />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    id="prompt-input"
                    fullWidth
                    label="Enter your prompt"
                    variant="outlined"
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder={EXAMPLE_PROMPTS[0]}
                    disabled={isLoading}
                    sx={{ 
                      bgcolor: highlightedElement === 'prompt-input' ? 'action.selected' : 'transparent',
                    }}
                  />
                  {isLoading && (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        marginTop: '-12px',
                      }}
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box id="token-flow" sx={{ 
                  bgcolor: highlightedElement === 'token-flow' ? 'action.selected' : 'transparent',
                }}>
                  <TokenFlow />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box id="probability-graph" sx={{ 
                  bgcolor: highlightedElement === 'probability-graph' ? 'action.selected' : 'transparent',
                }}>
                  <ProbabilityGraph
                    currentToken={currentToken || (generatedTokens.length > 0 ? generatedTokens[generatedTokens.length - 1] : null)}
                    isLoading={isLoading}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box id="temperature-slider" sx={{ 
                    bgcolor: highlightedElement === 'temperature-slider' ? 'action.selected' : 'transparent',
                  }}>
                    <TemperatureSlider
                      value={temperature}
                      onChange={setTemperature}
                      disabled={isLoading}
                    />
                  </Box>

                  <Box id="sampling-controls" sx={{ 
                    bgcolor: highlightedElement === 'sampling-controls' ? 'action.selected' : 'transparent',
                  }}>
                    <TopKPControls
                      topK={topK}
                      topP={topP}
                      onTopKChange={setTopK}
                      onTopPChange={setTopP}
                      disabled={isLoading}
                    />
                  </Box>

                  <PlaybackControls
                    isPlaying={isPlaying}
                    speed={speed}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onSpeedChange={setSpeed}
                    disabled={isLoading}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
