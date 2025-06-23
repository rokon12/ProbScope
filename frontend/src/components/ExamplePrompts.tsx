import { FC } from 'react'
import { Box, Chip, Typography } from '@mui/material'
import { EXAMPLE_PROMPTS } from '../types/types'

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void
  disabled?: boolean
}

export const ExamplePrompts: FC<ExamplePromptsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
        Quick examples:
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1,
        maxHeight: '120px',
        overflowY: 'auto'
      }}>
        {EXAMPLE_PROMPTS.map((prompt, index) => (
          <Chip
            key={index}
            label={prompt}
            onClick={() => onSelectPrompt(prompt)}
            variant="outlined"
            disabled={disabled}
            sx={{
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: disabled ? 'transparent' : 'action.hover',
                borderColor: disabled ? 'divider' : 'primary.main',
              },
              fontSize: '0.875rem',
            }}
          />
        ))}
      </Box>
    </Box>
  )
}