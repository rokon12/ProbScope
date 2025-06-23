import { FC } from 'react'
import { Box, Tooltip, Typography } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

interface TooltipContent {
  title: string
  description: string
}

interface TooltipsProps {
  content: TooltipContent
  children: React.ReactNode
}

const tooltipStyles = {
  tooltip: {
    maxWidth: 300,
    backgroundColor: 'background.paper',
    color: 'text.primary',
    border: '1px solid',
    borderColor: 'divider',
    p: 2,
    borderRadius: 1,
    boxShadow: 3,
  },
}

export const EducationalTooltip: FC<TooltipsProps> = ({ content, children }) => {
  return (
    <Box component="span" display="inline-block">
      <Tooltip
        title={
          <>
            <Typography variant="subtitle2" gutterBottom>
              {content.title}
            </Typography>
            <Typography variant="body2">
              {content.description}
            </Typography>
          </>
        }
        placement="top"
        arrow
        componentsProps={{
          tooltip: {
            sx: tooltipStyles.tooltip,
          },
        }}
      >
        <span>{children}</span>
      </Tooltip>
    </Box>
  )
}

export const HelpTooltip: FC<TooltipsProps> = ({ content }) => {
  return (
    <EducationalTooltip content={content}>
      <HelpOutlineIcon
        sx={{
          fontSize: 'small',
          ml: 1,
          cursor: 'help',
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }}
      />
    </EducationalTooltip>
  )
}

// Predefined tooltips for common elements
export const TOOLTIPS = {
  temperature: {
    title: 'Temperature',
    description: 'Controls randomness in token selection. Lower values make the output more focused and deterministic, while higher values increase creativity and diversity.',
  },
  topK: {
    title: 'Top-K Sampling',
    description: 'Limits token selection to the K most likely tokens. Helps prevent unlikely or nonsensical completions while maintaining diversity.',
  },
  topP: {
    title: 'Top-P (Nucleus) Sampling',
    description: 'Selects from the smallest set of tokens whose cumulative probability exceeds P. Provides a dynamic way to control output diversity.',
  },
  tokenProbability: {
    title: 'Token Probability',
    description: 'Shows how likely the model thinks this token should be the next one in the sequence. Higher probabilities indicate stronger predictions.',
  },
  alternatives: {
    title: 'Alternative Tokens',
    description: 'Other tokens the model considered, along with their probabilities. Helps understand the model\'s decision-making process.',
  },
} as const
