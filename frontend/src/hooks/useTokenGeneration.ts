import { useEffect } from 'react'
import { useStore } from '../store/store'


export const useTokenGeneration = () => {
  const { 
    isPlaying, 
    generateTokens,
  } = useStore()

  useEffect(() => {
    let cleanup: (() => void) | void

    if (isPlaying) {
      cleanup = generateTokens()
    }

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [isPlaying, generateTokens])
}
