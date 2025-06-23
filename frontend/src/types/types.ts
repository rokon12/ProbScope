export interface TokenInfo {
  text: string
  probability: number
  alternatives: TokenAlternative[]
  timestamp: number
}

export interface TokenAlternative {
  text: string
  probability: number
}

export interface VisualizationState {
  prompt: string
  generatedTokens: TokenInfo[]
  isPlaying: boolean
  speed: 'slow' | 'medium' | 'fast'
  temperature: number
  topK: number
  topP: number
  currentTokenIndex: number
  error: string | null
  isLoading: boolean
  hasTimedOut: boolean
}

export interface TokenGenerationParams {
  temperature: number
  topK: number
  topP: number
}

export interface TokenProbabilityDistribution {
  token: string
  probability: number
  isSelected: boolean
}

export type GenerationSpeed = 'slow' | 'medium' | 'fast'

export interface LearnModeStep {
  title: string
  description: string
  highlightedElement?: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

export interface Token {
  text: string
  probability: number
  alternatives: TokenAlternative[]
  timestamp: number
}

export interface AlternativeTimeline {
  params: TokenGenerationParams
  tokens: Token[]
  description: string
}

// Constants
export const SPEED_VALUES = {
  slow: 1000,
  medium: 500,
  fast: 200,
} as const

export const DEFAULT_PARAMS: TokenGenerationParams = {
  temperature: 1.0,
  topK: 50,
  topP: 0.9,
}

export const EXAMPLE_PROMPTS = [
  "The weather is",
  "Once upon a time",
  "The quick brown fox",
  "In the distant future",
] as const
