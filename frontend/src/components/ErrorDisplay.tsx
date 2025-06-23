import { FC } from 'react';
import { Alert, Button, Box } from '@mui/material';
import { useStore } from '../store/store';

export const ErrorDisplay: FC = () => {
  const { error, hasTimedOut, clearError, retryGeneration } = useStore();

  if (!error) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="error"
        action={
          hasTimedOut ? (
            <Button
              color="inherit"
              size="small"
              onClick={retryGeneration}
            >
              Retry
            </Button>
          ) : (
            <Button
              color="inherit"
              size="small"
              onClick={clearError}
            >
              Dismiss
            </Button>
          )
        }
      >
        {hasTimedOut
          ? "Token generation timed out. The server took too long to respond."
          : error}
      </Alert>
    </Box>
  );
};