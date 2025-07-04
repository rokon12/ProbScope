# ProbScope

**Peer inside AI language models** - An interactive visualization tool that reveals how Large Language Models complete sentences token by token in real-time. ProbScope shows you the probability distributions and alternative choices at each step, making AI decision-making transparent and educational.

The interface looks like this:

![screenshot.png](images/screenshot.png)

## Features

### Core Visualization
- **Sentence Completion**: Enter incomplete text, see how AI finishes it
- **Real-time Streaming**: Watch tokens appear one by one with realistic timing
- **Probability Distributions**: See the actual alternatives the AI considered
- **Interactive Analysis**: Click any token to view its probability breakdown
- **Authentic Data**: Uses OpenAI's logprobs for real model confidence scores

### Interactive Controls
- Temperature adjustment (0.1 to 2.0)
- Top-K and Top-P parameter controls
- Play/Pause functionality
- Speed control (slow/medium/fast)

### Educational Features
- **Clickable Examples**: Pre-built prompts for instant testing
- **Speed Controls**: Slow down to study each decision carefully
- **Visual Clarity**: Color-coded tokens show selection vs analysis states
- **Hover Details**: Detailed probability breakdowns on hover

## Prerequisites

- Java 21 or higher
- Node.js 16.x or higher
- npm 7.x or higher
- OpenAI API key

## Setup

### Backend Setup

1. Copy the example properties file:
```bash
cd src/main/resources
cp application.properties.example application.properties
```

2. Edit `application.properties` and add your OpenAI API key:
```properties
openai.api-key=your-api-key-here
```

3. Build the backend:
```bash
./mvnw clean install
```

4. Run the backend:
```bash
./mvnw spring-boot:run
```

The backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
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

The frontend will be available at `http://localhost:3000`


## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a prompt in the input field
3. Adjust the generation parameters:
   - Temperature: Controls randomness (0.1-2.0)
   - Top-K: Limits token selection to K most likely tokens
   - Top-P: Controls cumulative probability threshold
4. Click the Play button to start generation
5. Use the speed controls to adjust the visualization pace
6. Click Learn Mode for step-by-step explanations

## API Documentation

### Token Generation Endpoints

#### Generate Tokens
```http
POST /api/tokens
Content-Type: application/json

{
  "prompt": "string",
  "temperature": number,
  "topK": number,
  "topP": number
}
```

#### Stream Tokens
```http
POST /api/tokens/stream
Content-Type: application/json
Accept: text/event-stream

{
  "prompt": "string",
  "temperature": number,
  "topK": number,
  "topP": number
}
```

## Development

### Project Structure
```
├── src/                    # Backend source files
│   ├── main/
│   │   ├── java/          # Java source code
│   │   └── resources/     # Configuration files
│   └── test/              # Test files
├── frontend/              # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── store/        # State management
│   │   └── types/        # TypeScript types
│   └── public/           # Static files
└── README.md
```

### Available Scripts

Backend:
- `./mvnw spring-boot:run`: Start the backend server
- `./mvnw test`: Run backend tests

Frontend:
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.