import { FC } from 'react'
import { Box, Slider, Typography, Tooltip, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'

interface TopKPControlsProps {
  topK: number
  topP: number
  onTopKChange: (value: number) => void
  onTopPChange: (value: number) => void
  disabled?: boolean
}

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.secondary.main,
  height: 8,
  '&.Mui-disabled': {
    color: theme.palette.action.disabled,
  },
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    backgroundColor: theme.palette.secondary.main,
  },
}))

const topKMarks = [
  { value: 1, label: '1' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
]

const topPMarks = [
  { value: 0, label: '0' },
  { value: 0.5, label: '0.5' },
  { value: 1, label: '1.0' },
]

export const TopKPControls: FC<TopKPControlsProps> = ({
  topK,
  topP,
  onTopKChange,
  onTopPChange,
  disabled = false,
}) => {
  return (
    <Box sx={{ width: '100%', px: 3, py: 2 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              Top-K
            </Typography>
            <Tooltip 
              title="Limits the cumulative probability distribution to the K most likely next tokens. Lower values make the output more focused." 
              arrow
            >
              <Typography color="text.secondary" sx={{ cursor: 'help' }}>
                ℹ️
              </Typography>
            </Tooltip>
          </Box>
          <StyledSlider
            value={topK}
            onChange={(_, newValue) => onTopKChange(newValue as number)}
            min={1}
            max={100}
            step={1}
            marks={topKMarks}
            valueLabelDisplay="auto"
            aria-label="Top-K"
            disabled={disabled}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current: {topK}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              Top-P
            </Typography>
            <Tooltip 
              title="Nucleus sampling: Only consider tokens whose cumulative probability exceeds P. Controls diversity of output." 
              arrow
            >
              <Typography color="text.secondary" sx={{ cursor: 'help' }}>
                ℹ️
              </Typography>
            </Tooltip>
          </Box>
          <StyledSlider
            value={topP}
            onChange={(_, newValue) => onTopPChange(newValue as number)}
            min={0}
            max={1}
            step={0.05}
            marks={topPMarks}
            valueLabelDisplay="auto"
            aria-label="Top-P"
            disabled={disabled}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current: {topP.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}
