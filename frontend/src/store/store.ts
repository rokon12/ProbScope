import { create } from 'zustand'
import { 
  VisualizationState, 
  DEFAULT_PARAMS,
} from '../types/types'
import { streamTokens, TokenGenerationRequest, TokenGenerationError } from '../api/tokenApi'

interface VisualizationStore extends VisualizationState {
  setPrompt: (prompt: string) => void
  setIsPlaying: (isPlaying: boolean) => void
  setSpeed: (speed: 'slow' | 'medium' | 'fast') => void
  setTemperature: (temperature: number) => void
  setTopK: (topK: number) => void
  setTopP: (topP: number) => void
  generateTokens: () => (() => void) | void
  reset: () => void
  setError: (error: string | null) => void
  clearError: () => void
  retryGeneration: () => void
  currentToken: TokenInfo | null
  setCurrentToken: (token: TokenInfo | null) => void
}

export const useStore = create<VisualizationStore>((set, get) => ({
  // VisualizationState
  prompt: '',
  generatedTokens: [],
  isPlaying: false,
  speed: 'medium' as const,
  temperature: DEFAULT_PARAMS.temperature,
  topK: DEFAULT_PARAMS.topK,
  topP: DEFAULT_PARAMS.topP,
  currentTokenIndex: 0,
  error: null,
  isLoading: false,
  hasTimedOut: false,
  currentToken: null,

  // Store methods

  setPrompt: (prompt) => set({ prompt, generatedTokens: [], currentTokenIndex: 0, error: null }),

  setIsPlaying: (isPlaying) => {
    set({ isPlaying })
  },

  setSpeed: (speed) => set({ speed }),

  setTemperature: (temperature) => set({ temperature }),

  setTopK: (topK) => set({ topK }),

  setTopP: (topP) => set({ topP }),

  setError: (error) => set({ 
    error,
    hasTimedOut: error?.includes('timed out') ?? false
  }),

  clearError: () => set({ error: null, hasTimedOut: false }),

  retryGeneration: () => {
    const state = get();
    set({ error: null, hasTimedOut: false, isLoading: true });
    state.generateTokens();
  },
  
  setCurrentToken: (token) => set({ currentToken: token }),

  generateTokens: (): (() => void) | void => {
    const state = get()
    
    if (!state.prompt) {
      set({ error: 'Please enter a prompt', isPlaying: false })
      return
    }

    // Clear tokens when starting new generation
    set({ 
      isLoading: true, 
      error: null, 
      hasTimedOut: false,
      generatedTokens: [],
      currentTokenIndex: 0
    })

    const request: TokenGenerationRequest = {
      prompt: state.prompt,
      temperature: state.temperature,
      topK: state.topK,
      topP: state.topP,
    }

    try {
      const cleanup = streamTokens(
        request,
        (token) => {
          // Immediately add token to the list and show it as current
          set((state) => ({
            ...state,
            generatedTokens: [...state.generatedTokens, token],
            currentTokenIndex: state.currentTokenIndex + 1,
            currentToken: token,
          }));
          
          // Clear current token after a delay
          const speedDelay = {
            slow: 1500,
            medium: 800,
            fast: 300
          };
          
          setTimeout(() => {
            set({ currentToken: null });
          }, speedDelay[get().speed]);
        },
        (error) => {
          const isTimeout = error.message.includes('timed out')
          set({ 
            error: error.message,
            isPlaying: false,
            isLoading: false,
            hasTimedOut: isTimeout,
          })
        },
        () => {
          set({ 
            isPlaying: false,
            isLoading: false,
          })
        }
      )

      return () => {
        cleanup()
        set({ isLoading: false })
      }
    } catch (error) {
      const message = error instanceof TokenGenerationError 
        ? error.message 
        : 'An unexpected error occurred'

      set({ 
        error: message,
        isPlaying: false,
        isLoading: false,
      })
    }
  },

  reset: () => set({
    generatedTokens: [],
    currentTokenIndex: 0,
    isPlaying: false,
    temperature: DEFAULT_PARAMS.temperature,
    topK: DEFAULT_PARAMS.topK,
    topP: DEFAULT_PARAMS.topP,
    error: null,
    isLoading: false,
    hasTimedOut: false,
  }),
}))
