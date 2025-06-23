import { FC } from 'react'
import { Box, Slider, Typography, Tooltip } from '@mui/material'
import { styled } from '@mui/material/styles'

interface TemperatureSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 8,
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
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: theme.palette.primary.main,
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
}))

const temperatureMarks = [
  { value: 0.1, label: '0.1' },
  { value: 1, label: '1.0' },
  { value: 2, label: '2.0' },
]

export const TemperatureSlider: FC<TemperatureSliderProps> = ({ value, onChange, disabled = false }) => {
  return (
    <Box sx={{ width: '100%', px: 3, py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          Temperature
        </Typography>
        <Tooltip title="Controls randomness: Lower values make the output more focused and deterministic, higher values make it more creative and diverse." arrow>
          <Typography color="text.secondary" sx={{ cursor: 'help' }}>
            ℹ️
          </Typography>
        </Tooltip>
      </Box>
      <StyledSlider
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        min={0.1}
        max={2}
        step={0.1}
        marks={temperatureMarks}
        valueLabelDisplay="auto"
        aria-label="Temperature"
        disabled={disabled}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Current: {value.toFixed(1)}
      </Typography>
    </Box>
  )
}
