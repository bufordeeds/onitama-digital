# Onitama Digital Development Roadmap

## Project Overview

This roadmap outlines the development plan for the Onitama digital game, a React Native implementation of the popular board game using Expo and TypeScript. The game will support both local play on a single device and online multiplayer functionality.

## Project Structure

```
onitama-digital/
├── app.json                 # Expo configuration
├── App.tsx                  # Entry point
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
├── assets/                  # Images, fonts, sounds
├── src/
│   ├── components/          # UI components
│   │   ├── Board.tsx        # Game board grid
│   │   ├── Piece.tsx        # Game pieces (students/masters)
│   │   ├── Card.tsx         # Movement cards
│   │   ├── MoveHighlight.tsx # Valid move indicators
│   │   └── ...
│   ├── screens/             # App screens
│   │   ├── GameScreen.tsx   # Main gameplay screen
│   │   ├── HomeScreen.tsx   # Start screen
│   │   ├── LobbyScreen.tsx  # Online game lobby
│   │   ├── RoomScreen.tsx   # Online game room
│   │   └── ...
│   ├── logic/               # Game logic
│   │   ├── gameState.ts     # Core game state
│   │   ├── moveValidation.ts # Move validation logic
│   │   ├── winConditions.ts # Win detection
│   │   └── cards.ts         # Card definitions and dealing
│   ├── context/             # React Context for state
│   │   ├── GameContext.tsx  # Game state context
│   │   └── OnlineContext.tsx # Online multiplayer context
│   ├── services/            # Backend services
│   │   ├── auth.ts          # Authentication service
│   │   ├── firestore.ts     # Firestore database service
│   │   └── realtime.ts      # Realtime database for game state
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Game-related types
│   └── utils/               # Helper functions
│       └── ...
└── docs/                    # Documentation
    ├── PRD.md               # Product Requirements Document
    └── ROADMAP.md           # This development roadmap
```

## Core Data Structures

```typescript
// Key TypeScript interfaces

interface Position {
	x: number;
	y: number;
}

interface Move {
	dx: number;
	dy: number;
}

interface Card {
	id: string;
	name: string;
	moves: Move[];
	color: string;
	description: string;
}

interface Piece {
	id: string;
	type: 'student' | 'master';
	player: 'blue' | 'red';
	position: Position;
}

interface GameState {
	board: (Piece | null)[][];
	currentPlayer: 'blue' | 'red';
	blueCards: Card[];
	redCards: Card[];
	centerCard: Card;
	selectedPiece: Piece | null;
	selectedCard: Card | null;
	validMoves: Position[];
	gameStatus: 'playing' | 'blue_won' | 'red_won';
}

interface User {
	id: string;
	displayName: string;
	photoURL?: string;
	stats?: {
		wins: number;
		losses: number;
		draws: number;
	};
}

interface GameRoom {
	id: string;
	name: string;
	createdBy: string;
	isPrivate: boolean;
	joinCode?: string;
	players: {
		blue?: User;
		red?: User;
	};
	gameState: GameState;
	status: 'waiting' | 'playing' | 'completed';
	lastMoveTime: number;
}
```

## Development Timeline

### Week 1: Core Logic Implementation

#### Day 1-2: Project Setup

-   Initialize project structure
-   Install dependencies:
    -   `react-native-svg` for game graphics
    -   `react-native-gesture-handler` for touch interactions
    -   `@react-native-async-storage/async-storage` for local storage
    -   `firebase` for authentication and database
    -   `@react-navigation/native` and related packages for navigation

#### Day 3-4: Game Logic

-   Implement card definitions (all 16 movement patterns)
-   Create initial game state setup
-   Build move validation logic
-   Develop win condition detection

#### Day 5: Testing Core Logic

-   Write unit tests for game logic
-   Create test scenarios for different game situations
-   Debug and refine core mechanics

### Week 2: UI Implementation & Firebase Setup

#### Day 1-2: Basic UI Components

-   Design and implement the game board (5x5 grid)
-   Create piece components with proper styling
-   Build card display components

#### Day 3-4: Game Flow UI & Firebase Integration

-   Connect UI to game logic
-   Implement turn-based gameplay
-   Add player indicators and game status display
-   Implement move highlighting system
-   Set up Firebase project
-   Configure authentication (email, Google, Apple)
-   Design Firestore database schema

#### Day 5: Initial Playtest

-   Conduct internal playtesting
-   Fix critical bugs
-   Refine UI based on feedback

### Week 3: Online Multiplayer & Interactions

#### Day 1-2: Online Game Infrastructure

-   Implement user authentication flow
-   Create game room creation/joining functionality
-   Build private/public room system with join codes
-   Develop real-time game state synchronization

#### Day 3-4: Touch Controls & Animations

-   Implement piece selection
-   Add card selection
-   Create move execution via touch
-   Build gesture handling for smooth interactions
-   Add animations for piece movement
-   Implement card rotation animations
-   Create win/lose feedback screens

#### Day 5: Online Play Testing

-   Test multiplayer functionality
-   Fix synchronization issues
-   Ensure smooth online experience
-   Implement basic error handling for network issues

### Week 4: Polish & Testing

#### Day 1-2: UI Polish & Lobby System

-   Refine visual design
-   Implement game lobby with active games list
-   Add friend invitations via share codes
-   Ensure responsive layout for different devices

#### Day 3-4: Testing & Optimization

-   Conduct thorough testing on multiple devices
-   Fix bugs and edge cases
-   Optimize performance
-   Implement accessibility features
-   Add high-contrast mode

#### Day 5: Documentation & Release Prep

-   Finalize documentation
-   Create app store assets
-   Prepare beta release notes
-   Submit to TestFlight/Play Store beta

## Technical Considerations

### Bug Fixes & Improvements

-   [x] Fix piece capturing functionality in Board.tsx
-   [ ] Improve move highlighting for better visibility
-   [ ] Enhance animation feedback for captures
-   [ ] Optimize touch response for smoother gameplay

### State Management

-   Use React Context for local game state
-   Use Firebase Realtime Database for online game state synchronization

### Authentication & Security

-   Implement Firebase Authentication
-   Set up security rules for Firestore
-   Create user profiles and basic stats tracking

### Performance Optimization

-   Use React.memo for pure components
-   Implement useMemo/useCallback for expensive calculations
-   Optimize SVG rendering for piece and card animations
-   Minimize network calls for online play

### Gesture Handling

-   Use react-native-gesture-handler for smooth interactions
-   Implement proper touch feedback

### Accessibility

-   Support VoiceOver/TalkBack
-   Implement high-contrast mode
-   Add haptic feedback

## Future Enhancements (Post-MVP)

### Phase 2: Enhanced Online Features

-   Add spectator mode for games
-   Implement game replays
-   Create tournaments and matchmaking
-   Add global and friend leaderboards

### Phase 3: AI Opponent

-   Develop AI logic for single-player mode
-   Implement difficulty levels
-   Add practice mode with AI

### Phase 4: Customization

-   Add multiple themes
-   Implement custom piece designs
-   Create offline stats tracking
-   Add achievements system
