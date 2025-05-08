import { GameState, Piece, Position, PlayerColor, Card } from '../types';
import { dealCards, getValidMovesForCard } from './cards';

/**
 * Constants for the game board
 */
export const BOARD_SIZE = 5;
export const TEMPLE_POSITIONS = {
	blue: { x: 2, y: 4 },
	red: { x: 2, y: 0 }
};

/**
 * Creates the initial pieces for a player
 * @param player The player color
 * @returns Array of pieces for the player
 */
const createInitialPieces = (player: PlayerColor): Piece[] => {
	const y = player === 'blue' ? 4 : 0;
	const pieces: Piece[] = [];

	// Create the master piece in the center
	pieces.push({
		id: `${player}-master`,
		type: 'master',
		player,
		position: { x: 2, y }
	});

	// Create the student pieces
	for (let x = 0; x < BOARD_SIZE; x++) {
		// Skip the center position (already has the master)
		if (x === 2) continue;

		pieces.push({
			id: `${player}-student-${x}`,
			type: 'student',
			player,
			position: { x, y }
		});
	}

	return pieces;
};

/**
 * Creates a 2D board array from the pieces
 * @param bluePieces Blue player's pieces
 * @param redPieces Red player's pieces
 * @returns 2D array representing the board
 */
const createBoard = (
	bluePieces: Piece[],
	redPieces: Piece[]
): (Piece | null)[][] => {
	// Create empty board
	const board: (Piece | null)[][] = Array(BOARD_SIZE)
		.fill(null)
		.map(() => Array(BOARD_SIZE).fill(null));

	// Place blue pieces
	bluePieces.forEach((piece) => {
		board[piece.position.y][piece.position.x] = piece;
	});

	// Place red pieces
	redPieces.forEach((piece) => {
		board[piece.position.y][piece.position.x] = piece;
	});

	return board;
};

/**
 * Initializes a new game state
 * @returns A new game state
 */
export const initializeGame = (): GameState => {
	// Create initial pieces
	const bluePieces = createInitialPieces('blue');
	const redPieces = createInitialPieces('red');

	// Deal cards
	const { blueCards, redCards, centerCard } = dealCards();

	// Create the board
	const board = createBoard(bluePieces, redPieces);

	// Return the initial game state
	return {
		board,
		currentPlayer: 'blue', // Blue goes first
		blueCards,
		redCards,
		centerCard,
		selectedPiece: null,
		selectedCard: null,
		validMoves: [],
		gameStatus: 'playing'
	};
};

/**
 * Checks if a position is within the board boundaries
 * @param position The position to check
 * @returns True if the position is valid
 */
export const isValidPosition = (position: Position): boolean => {
	const { x, y } = position;
	return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
};

/**
 * Gets all valid moves for a piece using a specific card
 * @param gameState The current game state
 * @param piece The piece to move
 * @param card The card to use
 * @returns Array of valid positions the piece can move to
 */
export const getValidMoves = (
	gameState: GameState,
	piece: Piece,
	card: Card
): Position[] => {
	const isRedPlayer = piece.player === 'red';

	// Get all possible moves based on the card
	const possibleMoves = getValidMovesForCard(piece, card, isRedPlayer);

	// Filter out invalid moves
	return possibleMoves.filter((position) => {
		// Check if the position is within the board
		if (!isValidPosition(position)) {
			return false;
		}

		// Get the piece at the target position
		const targetPiece = gameState.board[position.y][position.x];

		// Can't move to a position occupied by own piece
		if (targetPiece && targetPiece.player === piece.player) {
			return false;
		}

		return true;
	});
};

/**
 * Selects a piece and calculates valid moves
 * @param gameState The current game state
 * @param piece The piece to select
 * @param card The card to use
 * @returns Updated game state
 */
export const selectPiece = (
	gameState: GameState,
	piece: Piece,
	card: Card
): GameState => {
	// Ensure it's the player's turn
	if (piece.player !== gameState.currentPlayer) {
		return gameState;
	}

	// Calculate valid moves
	const validMoves = getValidMoves(gameState, piece, card);

	// Return updated game state
	return {
		...gameState,
		selectedPiece: piece,
		selectedCard: card,
		validMoves
	};
};

/**
 * Moves a piece to a new position
 * @param gameState The current game state
 * @param targetPosition The position to move to
 * @returns Updated game state or null if the move is invalid
 */
export const movePiece = (
	gameState: GameState,
	targetPosition: Position
): GameState | null => {
	const { selectedPiece, selectedCard, validMoves, currentPlayer } =
		gameState;

	// Ensure a piece and card are selected
	if (!selectedPiece || !selectedCard) {
		return null;
	}

	// Check if the target position is valid
	const isValidMove = validMoves.some(
		(pos) => pos.x === targetPosition.x && pos.y === targetPosition.y
	);

	if (!isValidMove) {
		return null;
	}

	// Check if we're capturing an opponent's master BEFORE updating the board
	let gameStatus: 'playing' | 'blue_won' | 'red_won' = 'playing';
	const targetPiece = gameState.board[targetPosition.y][targetPosition.x];
	if (
		targetPiece &&
		targetPiece.player !== currentPlayer &&
		targetPiece.type === 'master'
	) {
		// Master captured, set game status
		gameStatus = currentPlayer === 'blue' ? 'blue_won' : 'red_won';
	}

	// Create a deep copy of the board
	const newBoard = gameState.board.map((row) => [...row]);

	// Remove the piece from its current position
	newBoard[selectedPiece.position.y][selectedPiece.position.x] = null;

	// Update the piece's position
	const updatedPiece = {
		...selectedPiece,
		position: { ...targetPosition }
	};

	// Place the piece at the new position (capturing any opponent piece)
	newBoard[targetPosition.y][targetPosition.x] = updatedPiece;

	// Swap the used card with the center card
	const { blueCards, redCards, centerCard } = gameState;
	let newBlueCards = [...blueCards];
	let newRedCards = [...redCards];
	let newCenterCard = centerCard;

	if (currentPlayer === 'blue') {
		const cardIndex = blueCards.findIndex(
			(card) => card.id === selectedCard.id
		);
		newBlueCards = [...blueCards];
		newBlueCards[cardIndex] = centerCard;
		newCenterCard = selectedCard;
	} else {
		const cardIndex = redCards.findIndex(
			(card) => card.id === selectedCard.id
		);
		newRedCards = [...redCards];
		newRedCards[cardIndex] = centerCard;
		newCenterCard = selectedCard;
	}

	// If we haven't already won by capturing a master, check for temple win condition
	if (gameStatus === 'playing') {
		const templeWin = checkWinCondition(
			newBoard,
			updatedPiece,
			targetPosition,
			currentPlayer
		);
		gameStatus = templeWin;
	}

	// Switch to the other player's turn
	const nextPlayer = currentPlayer === 'blue' ? 'red' : 'blue';

	// Return the updated game state
	return {
		...gameState,
		board: newBoard,
		currentPlayer: gameStatus === 'playing' ? nextPlayer : currentPlayer,
		blueCards: newBlueCards,
		redCards: newRedCards,
		centerCard: newCenterCard,
		selectedPiece: null,
		selectedCard: null,
		validMoves: [],
		gameStatus
	};
};

/**
 * Checks if the game has been won by moving a master to the opponent's temple
 * @param board The current board state
 * @param movedPiece The piece that was just moved
 * @param targetPosition The position the piece moved to
 * @param currentPlayer The current player
 * @returns The updated game status
 */
export const checkWinCondition = (
	board: (Piece | null)[][],
	movedPiece: Piece,
	targetPosition: Position,
	currentPlayer: PlayerColor
): 'playing' | 'blue_won' | 'red_won' => {
	// Win condition: Move master to opponent's temple
	if (movedPiece.type === 'master') {
		const opponentTemple =
			currentPlayer === 'blue'
				? TEMPLE_POSITIONS.red
				: TEMPLE_POSITIONS.blue;

		if (
			targetPosition.x === opponentTemple.x &&
			targetPosition.y === opponentTemple.y
		) {
			return currentPlayer === 'blue' ? 'blue_won' : 'red_won';
		}
	}

	return 'playing';
};

/**
 * Checks if a player can make any valid moves
 * @param gameState The current game state
 * @returns True if the current player can make a move
 */
export const canMakeMove = (gameState: GameState): boolean => {
	const { board, currentPlayer, blueCards, redCards } = gameState;
	const cards = currentPlayer === 'blue' ? blueCards : redCards;

	// Find all pieces of the current player
	const pieces: Piece[] = [];
	for (let y = 0; y < BOARD_SIZE; y++) {
		for (let x = 0; x < BOARD_SIZE; x++) {
			const piece = board[y][x];
			if (piece && piece.player === currentPlayer) {
				pieces.push(piece);
			}
		}
	}

	// Check if any piece can make a valid move with any card
	for (const piece of pieces) {
		for (const card of cards) {
			const moves = getValidMoves(gameState, piece, card);
			if (moves.length > 0) {
				return true;
			}
		}
	}

	return false;
};
