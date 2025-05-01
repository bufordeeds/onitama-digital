/**
 * Core data structures for the Onitama game
 */

/**
 * Represents a position on the game board
 */
export interface Position {
	x: number;
	y: number;
}

/**
 * Represents a relative movement offset
 */
export interface Move {
	dx: number;
	dy: number;
}

/**
 * Represents a movement card
 */
export interface Card {
	id: string;
	name: string;
	moves: Move[];
	color: string;
	description: string;
}

/**
 * Player types
 */
export type PlayerColor = 'blue' | 'red';

/**
 * Piece types
 */
export type PieceType = 'student' | 'master';

/**
 * Represents a game piece
 */
export interface Piece {
	id: string;
	type: PieceType;
	player: PlayerColor;
	position: Position;
}

/**
 * Game status types
 */
export type GameStatus = 'playing' | 'blue_won' | 'red_won';

/**
 * Represents the complete game state
 */
export interface GameState {
	board: (Piece | null)[][];
	currentPlayer: PlayerColor;
	blueCards: Card[];
	redCards: Card[];
	centerCard: Card;
	selectedPiece: Piece | null;
	selectedCard: Card | null;
	validMoves: Position[];
	gameStatus: GameStatus;
}

/**
 * Represents a user profile
 */
export interface User {
	id: string;
	displayName: string;
	photoURL?: string;
	stats?: {
		wins: number;
		losses: number;
		draws: number;
	};
}

/**
 * Game room status types
 */
export type RoomStatus = 'waiting' | 'playing' | 'completed';

/**
 * Represents an online game room
 */
export interface GameRoom {
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
	status: RoomStatus;
	lastMoveTime: number;
}
