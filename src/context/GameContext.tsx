import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, Piece, Position, Card, PlayerColor } from '../types';
import { initializeGame, movePiece, selectPiece } from '../logic/gameState';
import { checkWinConditions, WinResult } from '../logic/winConditions';

// Define the actions that can be performed on the game state
type GameAction =
	| { type: 'NEW_GAME' }
	| { type: 'SELECT_PIECE'; piece: Piece; card: Card }
	| { type: 'MOVE_PIECE'; position: Position }
	| { type: 'RESET_SELECTION' };

// Define the context value type
interface GameContextValue {
	gameState: GameState;
	winResult: WinResult;
	dispatch: React.Dispatch<GameAction>;
	selectPieceAndCard: (piece: Piece, card: Card) => void;
	movePieceToPosition: (position: Position) => void;
	resetSelection: () => void;
	startNewGame: () => void;
}

// Create the context
const GameContext = createContext<GameContextValue | undefined>(undefined);

// Game reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case 'NEW_GAME':
			return initializeGame();

		case 'SELECT_PIECE':
			return selectPiece(state, action.piece, action.card);

		case 'MOVE_PIECE': {
			const newState = movePiece(state, action.position);
			return newState || state; // Return original state if move is invalid
		}

		case 'RESET_SELECTION':
			return {
				...state,
				selectedPiece: null,
				selectedCard: null,
				validMoves: []
			};

		default:
			return state;
	}
};

// Provider component
interface GameProviderProps {
	children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
	// Initialize the game state with the reducer
	const [gameState, dispatch] = useReducer(gameReducer, null, initializeGame);

	// Check for win conditions
	const winResult = checkWinConditions(gameState);

	// Helper functions for common actions
	const selectPieceAndCard = (piece: Piece, card: Card) => {
		// Only allow selection if it's the player's turn and the game is still in progress
		if (
			piece.player === gameState.currentPlayer &&
			gameState.gameStatus === 'playing'
		) {
			dispatch({ type: 'SELECT_PIECE', piece, card });
		}
	};

	const movePieceToPosition = (position: Position) => {
		// Only allow moves if a piece and card are selected and the game is still in progress
		if (
			gameState.selectedPiece &&
			gameState.selectedCard &&
			gameState.gameStatus === 'playing'
		) {
			dispatch({ type: 'MOVE_PIECE', position });
		}
	};

	const resetSelection = () => {
		dispatch({ type: 'RESET_SELECTION' });
	};

	const startNewGame = () => {
		dispatch({ type: 'NEW_GAME' });
	};

	// Create the context value
	const contextValue: GameContextValue = {
		gameState,
		winResult,
		dispatch,
		selectPieceAndCard,
		movePieceToPosition,
		resetSelection,
		startNewGame
	};

	return (
		<GameContext.Provider value={contextValue}>
			{children}
		</GameContext.Provider>
	);
};

// Custom hook for using the game context
export const useGame = (): GameContextValue => {
	const context = useContext(GameContext);

	if (context === undefined) {
		throw new Error('useGame must be used within a GameProvider');
	}

	return context;
};

// Helper function to get the current player's cards
export const getCurrentPlayerCards = (gameState: GameState): Card[] => {
	return gameState.currentPlayer === 'blue'
		? gameState.blueCards
		: gameState.redCards;
};

// Helper function to get the opponent's cards
export const getOpponentCards = (gameState: GameState): Card[] => {
	return gameState.currentPlayer === 'blue'
		? gameState.redCards
		: gameState.blueCards;
};

// Helper function to get the player's color name
export const getPlayerColorName = (color: PlayerColor): string => {
	return color === 'blue' ? 'Blue' : 'Red';
};

// Helper function to check if a position has a valid move
export const isValidMovePosition = (
	gameState: GameState,
	position: Position
): boolean => {
	return gameState.validMoves.some(
		(move) => move.x === position.x && move.y === position.y
	);
};

// Helper function to check if a piece is selected
export const isPieceSelected = (
	gameState: GameState,
	piece: Piece
): boolean => {
	return (
		gameState.selectedPiece !== null &&
		gameState.selectedPiece.id === piece.id
	);
};

// Helper function to check if a card is selected
export const isCardSelected = (gameState: GameState, card: Card): boolean => {
	return (
		gameState.selectedCard !== null && gameState.selectedCard.id === card.id
	);
};
