/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_DEFAULT_SPEED: string
  readonly VITE_DEFAULT_TEMPERATURE: string
  readonly VITE_DEFAULT_TOP_K: string
  readonly VITE_DEFAULT_TOP_P: string
  readonly VITE_ANIMATION_DURATION: string
  readonly VITE_SLOW_SPEED: string
  readonly VITE_MEDIUM_SPEED: string
  readonly VITE_FAST_SPEED: string
  readonly VITE_ENABLE_LEARN_MODE: string
  readonly VITE_ENABLE_ALTERNATIVE_TIMELINES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}