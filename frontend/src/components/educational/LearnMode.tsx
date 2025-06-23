import { FC, useState } from 'react'
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { TOOLTIPS } from './Tooltips'

const LEARN_STEPS = [
  {
    title: 'Welcome to Token Flow Visualizer',
    content: 'This tool helps you understand how language models generate text one token at a time. Let\'s explore the key features together.',
    highlight: null,
  },
  {
    title: 'Enter Your Prompt',
    content: 'Start by entering a text prompt. The model will generate tokens based on this input.',
    highlight: 'prompt-input',
  },
  {
    title: 'Temperature Control',
    content: TOOLTIPS.temperature.description,
    highlight: 'temperature-slider',
  },
  {
    title: 'Top-K and Top-P Sampling',
    content: `${TOOLTIPS.topK.description}\n\n${TOOLTIPS.topP.description}`,
    highlight: 'sampling-controls',
  },
  {
    title: 'Token Generation',
    content: 'Watch as the model generates tokens one by one. Each token is chosen based on its probability distribution.',
    highlight: 'token-flow',
  },
  {
    title: 'Probability Distribution',
    content: 'The graph shows the probability of each possible next token. Higher bars mean the token is more likely to be chosen.',
    highlight: 'probability-graph',
  },
  {
    title: 'Alternative Tokens',
    content: TOOLTIPS.alternatives.description,
    highlight: 'token-alternatives',
  },
]

interface LearnModeProps {
  onHighlight: (elementId: string | null) => void
}

export const LearnMode: FC<LearnModeProps> = ({ onHighlight }) => {
  const [open, setOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const handleOpen = () => {
    setOpen(true)
    setActiveStep(0)
  }

  const handleClose = () => {
    setOpen(false)
    onHighlight(null)
  }

  const handleNext = () => {
    const nextStep = activeStep + 1
    setActiveStep(nextStep)
    onHighlight(LEARN_STEPS[nextStep]?.highlight || null)
  }

  const handleBack = () => {
    const prevStep = activeStep - 1
    setActiveStep(prevStep)
    onHighlight(LEARN_STEPS[prevStep]?.highlight || null)
  }

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleOpen}
        startIcon={<span>📚</span>}
      >
        Learn Mode
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Learn Token Flow Visualization
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {LEARN_STEPS.map((step, index) => (
                <Step key={step.title}>
                  <StepLabel>
                    <Typography variant="subtitle1">
                      {step.title}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography>{step.content}</Typography>
                        </Paper>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ mr: 1 }}
                          >
                            {index === LEARN_STEPS.length - 1 ? 'Finish' : 'Continue'}
                          </Button>
                          {index > 0 && (
                            <Button
                              onClick={handleBack}
                              sx={{ mr: 1 }}
                            >
                              Back
                            </Button>
                          )}
                        </Box>
                      </motion.div>
                    </AnimatePresence>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}