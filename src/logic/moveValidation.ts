import { GameState, Piece, Position, Card } from '../types';
import { BOARD_SIZE, isValidPosition } from './gameState';
import { flipMove } from './cards';

/**
 * Validates if a move is legal based on the game rules
 * @param gameState Current game state
 * @param piece The piece to move
 * @param card The card being used
 * @param targetPosition The target position to move to
 * @returns True if the move is valid
 */
export const isValidMove = (
	gameState: GameState,
	piece: Piece,
	card: Card,
	targetPosition: Position
): boolean => {
	// Check if it's the player's turn
	if (piece.player !== gameState.currentPlayer) {
		return false;
	}

	// Check if the target position is within the board
	if (!isValidPosition(targetPosition)) {
		return false;
	}

	// Check if the target position is occupied by a friendly piece
	const targetPiece = gameState.board[targetPosition.y][targetPosition.x];
	if (targetPiece && targetPiece.player === piece.player) {
		return false;
	}

	// Check if the move is valid according to the card
	const isRedPlayer = piece.player === 'red';
	const validMoves = getValidMovesFromCard(piece, card, isRedPlayer);

	// Check if the target position is in the list of valid moves
	return validMoves.some(
		(pos) => pos.x === targetPosition.x && pos.y === targetPosition.y
	);
};

/**
 * Gets all valid moves for a piece using a specific card
 * @param piece The piece to move
 * @param card The card to use
 * @param isRedPlayer Whether the current player is red
 * @returns Array of valid positions the piece can move to
 */
export const getValidMovesFromCard = (
	piece: Piece,
	card: Card,
	isRedPlayer: boolean
): Position[] => {
	return card.moves
		.map((move) => {
			// If red player, flip the move
			const actualMove = isRedPlayer ? flipMove(move) : move;

			return {
				x: piece.position.x + actualMove.dx,
				y: piece.position.y + actualMove.dy
			};
		})
		.filter(isValidPosition); // Filter out moves that are off the board
};

/**
 * Gets all valid moves for a piece considering the current game state
 * @param gameState The current game state
 * @param piece The piece to move
 * @param card The card to use
 * @returns Array of valid positions the piece can move to
 */
export const getValidMovesWithGameState = (
	gameState: GameState,
	piece: Piece,
	card: Card
): Position[] => {
	const isRedPlayer = piece.player === 'red';

	// Get all possible moves based on the card
	const possibleMoves = getValidMovesFromCard(piece, card, isRedPlayer);

	// Filter out invalid moves based on the game state
	return possibleMoves.filter((position) => {
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
 * Checks if a player has any valid moves
 * @param gameState The current game state
 * @returns True if the current player can make a move
 */
export const hasValidMoves = (gameState: GameState): boolean => {
	const { board, currentPlayer, blueCards, redCards } = gameState;
	const cards = currentPlayer === 'blue' ? blueCards : redCards;

	// Find all pieces of the current player
	for (let y = 0; y < BOARD_SIZE; y++) {
		for (let x = 0; x < BOARD_SIZE; x++) {
			const piece = board[y][x];
			if (piece && piece.player === currentPlayer) {
				// Check if this piece can make a valid move with any card
				for (const card of cards) {
					const moves = getValidMovesWithGameState(
						gameState,
						piece,
						card
					);
					if (moves.length > 0) {
						return true;
					}
				}
			}
		}
	}

	return false;
};

/**
 * Checks if a move would result in a win
 * @param gameState The current game state
 * @param piece The piece to move
 * @param targetPosition The target position
 * @returns True if the move would result in a win
 */
export const isWinningMove = (
	gameState: GameState,
	piece: Piece,
	targetPosition: Position
): boolean => {
	// Win condition 1: Capture opponent's master
	const targetPiece = gameState.board[targetPosition.y][targetPosition.x];
	if (
		targetPiece &&
		targetPiece.player !== piece.player &&
		targetPiece.type === 'master'
	) {
		return true;
	}

	// Win condition 2: Move master to opponent's temple
	if (piece.type === 'master') {
		const opponentTempleY = piece.player === 'blue' ? 0 : 4;
		const opponentTempleX = 2;

		if (
			targetPosition.x === opponentTempleX &&
			targetPosition.y === opponentTempleY
		) {
			return true;
		}
	}

	return false;
};

/**
 * Highlights the best move for a player (for tutorial or hint system)
 * @param gameState The current game state
 * @returns The best move or null if no moves are available
 */
export const suggestMove = (
	gameState: GameState
): { piece: Piece; card: Card; targetPosition: Position } | null => {
	const { board, currentPlayer, blueCards, redCards } = gameState;
	const cards = currentPlayer === 'blue' ? blueCards : redCards;

	// First, look for winning moves
	for (let y = 0; y < BOARD_SIZE; y++) {
		for (let x = 0; x < BOARD_SIZE; x++) {
			const piece = board[y][x];
			if (piece && piece.player === currentPlayer) {
				for (const card of cards) {
					const moves = getValidMovesWithGameState(
						gameState,
						piece,
						card
					);

					for (const targetPosition of moves) {
						if (isWinningMove(gameState, piece, targetPosition)) {
							return { piece, card, targetPosition };
						}
					}
				}
			}
		}
	}

	// If no winning moves, look for capturing moves
	for (let y = 0; y < BOARD_SIZE; y++) {
		for (let x = 0; x < BOARD_SIZE; x++) {
			const piece = board[y][x];
			if (piece && piece.player === currentPlayer) {
				for (const card of cards) {
					const moves = getValidMovesWithGameState(
						gameState,
						piece,
						card
					);

					for (const targetPosition of moves) {
						const targetPiece =
							board[targetPosition.y][targetPosition.x];
						if (
							targetPiece &&
							targetPiece.player !== currentPlayer
						) {
							return { piece, card, targetPosition };
						}
					}
				}
			}
		}
	}

	// If no capturing moves, just return the first valid move
	for (let y = 0; y < BOARD_SIZE; y++) {
		for (let x = 0; x < BOARD_SIZE; x++) {
			const piece = board[y][x];
			if (piece && piece.player === currentPlayer) {
				for (const card of cards) {
					const moves = getValidMovesWithGameState(
						gameState,
						piece,
						card
					);

					if (moves.length > 0) {
						return { piece, card, targetPosition: moves[0] };
					}
				}
			}
		}
	}

	// No valid moves
	return null;
};
