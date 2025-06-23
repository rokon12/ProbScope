import { FC } from 'react'
import { Box, Button, ButtonGroup, IconButton, Tooltip } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import FastForwardIcon from '@mui/icons-material/FastForward'
import FastRewindIcon from '@mui/icons-material/FastRewind'
import SpeedIcon from '@mui/icons-material/Speed'

interface PlaybackControlsProps {
  isPlaying: boolean
  speed: 'slow' | 'medium' | 'fast'
  onPlayPause: () => void
  onSpeedChange: (speed: 'slow' | 'medium' | 'fast') => void
  disabled?: boolean
}


export const PlaybackControls: FC<PlaybackControlsProps> = ({
  isPlaying,
  speed,
  onPlayPause,
  onSpeedChange,
  disabled = false,
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 2,
      p: 2 
    }}>
      <ButtonGroup variant="contained" size="large">
        <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
          <span>
            <IconButton 
              onClick={onPlayPause}
              color="primary"
              size="large"
              disabled={disabled}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </ButtonGroup>

      <ButtonGroup variant="outlined">
        <Tooltip title="Slow Speed">
          <span>
            <Button
              onClick={() => onSpeedChange('slow')}
              variant={speed === 'slow' ? 'contained' : 'outlined'}
              startIcon={<FastRewindIcon />}
              disabled={disabled}
            >
              0.5x
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Normal Speed">
          <span>
            <Button
              onClick={() => onSpeedChange('medium')}
              variant={speed === 'medium' ? 'contained' : 'outlined'}
              startIcon={<SpeedIcon />}
              disabled={disabled}
            >
              1x
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Fast Speed">
          <span>
            <Button
              onClick={() => onSpeedChange('fast')}
              variant={speed === 'fast' ? 'contained' : 'outlined'}
              startIcon={<FastForwardIcon />}
              disabled={disabled}
            >
              2x
            </Button>
          </span>
        </Tooltip>
      </ButtonGroup>
    </Box>
  )
}
