# LLM Token Flow Visualizer

An interactive visualization tool that demonstrates how Large Language Models generate text token by token in real-time. This educational tool helps users understand the token generation process through visual representations and interactive controls.

## Features

### Core Visualization
- Real-time token generation visualization
- Probability distribution graph for next tokens
- Token highlighting with probability scores
- Smooth animations and transitions

### Interactive Controls
- Temperature adjustment (0.1 to 2.0)
- Top-K and Top-P parameter controls
- Play/Pause functionality
- Speed control (slow/medium/fast)

### Educational Features
- Learn Mode with step-by-step explanations
- Interactive tooltips
- Example prompts
- Alternative timeline visualization

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd token-flow-visualizer/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── visualization/
│   │   │   ├── TokenFlow.tsx
│   │   │   ├── ProbabilityGraph.tsx
│   │   │   └── TokenHighlight.tsx
│   │   ├── controls/
│   │   │   ├── TemperatureSlider.tsx
│   │   │   ├── TopKPControls.tsx
│   │   │   └── PlaybackControls.tsx
│   │   └── educational/
│   │       ├── Tooltips.tsx
│   │       └── LearnMode.tsx
│   ├── hooks/
│   │   └── useTokenGeneration.ts
│   ├── store/
│   │   └── store.ts
│   ├── types/
│   │   └── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── theme.ts
├── .env.example
├── .eslintrc.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Environment Variables
See `.env.example` for available configuration options.

## Technical Details

### State Management
- Uses Zustand for global state management
- Implements mock token generation for demonstration
- Handles real-time updates and animations

### Visualization
- D3.js for probability distribution graphs
- Framer Motion for smooth animations
- Material-UI for consistent styling

### Performance Considerations
- Optimized rendering with React.memo where needed
- Efficient state updates using Zustand
- Debounced controls for better performance

## Known Limitations
- Uses mock data for token probabilities
- Limited to client-side visualization
- May have performance issues with very long sequences

## Contributing
Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.