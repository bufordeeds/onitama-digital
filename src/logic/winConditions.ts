import { GameState, Piece, Position, PlayerColor } from '../types';
import { TEMPLE_POSITIONS } from './gameState';

/**
 * Win condition types
 */
export enum WinConditionType {
	MASTER_CAPTURE = 'MASTER_CAPTURE',
	TEMPLE_ARCH = 'TEMPLE_ARCH'
}

/**
 * Result of a win condition check
 */
export interface WinResult {
	isWin: boolean;
	winner: PlayerColor | null;
	type: WinConditionType | null;
}

/**
 * Checks if a player has won by capturing the opponent's master
 * @param board The current board state
 * @returns Win result
 */
export const checkMasterCapture = (board: (Piece | null)[][]): WinResult => {
	// Check if blue master is present
	let blueMasterFound = false;
	let redMasterFound = false;

	// Scan the board for masters
	for (let y = 0; y < board.length; y++) {
		for (let x = 0; x < board[y].length; x++) {
			const piece = board[y][x];
			if (piece && piece.type === 'master') {
				if (piece.player === 'blue') {
					blueMasterFound = true;
				} else {
					redMasterFound = true;
				}
			}
		}
	}

	// If a master is missing, the other player has won
	if (!blueMasterFound) {
		return {
			isWin: true,
			winner: 'red',
			type: WinConditionType.MASTER_CAPTURE
		};
	}

	if (!redMasterFound) {
		return {
			isWin: true,
			winner: 'blue',
			type: WinConditionType.MASTER_CAPTURE
		};
	}

	// No master has been captured
	return {
		isWin: false,
		winner: null,
		type: null
	};
};

/**
 * Checks if a player has won by moving their master to the opponent's temple
 * @param board The current board state
 * @returns Win result
 */
export const checkTempleArch = (board: (Piece | null)[][]): WinResult => {
	// Check blue temple (red's starting position)
	const blueTemple = TEMPLE_POSITIONS.red;
	const pieceAtBlueTemple = board[blueTemple.y][blueTemple.x];

	if (
		pieceAtBlueTemple &&
		pieceAtBlueTemple.type === 'master' &&
		pieceAtBlueTemple.player === 'blue'
	) {
		return {
			isWin: true,
			winner: 'blue',
			type: WinConditionType.TEMPLE_ARCH
		};
	}

	// Check red temple (blue's starting position)
	const redTemple = TEMPLE_POSITIONS.blue;
	const pieceAtRedTemple = board[redTemple.y][redTemple.x];

	if (
		pieceAtRedTemple &&
		pieceAtRedTemple.type === 'master' &&
		pieceAtRedTemple.player === 'red'
	) {
		return {
			isWin: true,
			winner: 'red',
			type: WinConditionType.TEMPLE_ARCH
		};
	}

	// No temple has been reached
	return {
		isWin: false,
		winner: null,
		type: null
	};
};

/**
 * Checks all win conditions
 * @param gameState The current game state
 * @returns Win result
 */
export const checkWinConditions = (gameState: GameState): WinResult => {
	// Check for master capture
	const masterCaptureResult = checkMasterCapture(gameState.board);
	if (masterCaptureResult.isWin) {
		return masterCaptureResult;
	}

	// Check for temple arch
	const templeArchResult = checkTempleArch(gameState.board);
	if (templeArchResult.isWin) {
		return templeArchResult;
	}

	// No win condition met
	return {
		isWin: false,
		winner: null,
		type: null
	};
};

/**
 * Checks if a specific move would result in a win
 * @param gameState The current game state
 * @param piece The piece being moved
 * @param targetPosition The target position
 * @returns Win result
 */
export const checkMoveForWin = (
	gameState: GameState,
	piece: Piece,
	targetPosition: Position
): WinResult => {
	// Create a copy of the board to simulate the move
	const boardCopy = gameState.board.map((row) => [...row]);

	// Remove the piece from its current position
	boardCopy[piece.position.y][piece.position.x] = null;

	// Create an updated piece with the new position
	const updatedPiece = {
		...piece,
		position: targetPosition
	};

	// Place the piece at the new position (potentially capturing an opponent's piece)
	boardCopy[targetPosition.y][targetPosition.x] = updatedPiece;

	// Check win conditions on the simulated board
	// First, check if we captured the opponent's master
	if (
		gameState.board[targetPosition.y][targetPosition.x] &&
		gameState.board[targetPosition.y][targetPosition.x]!.type ===
			'master' &&
		gameState.board[targetPosition.y][targetPosition.x]!.player !==
			piece.player
	) {
		return {
			isWin: true,
			winner: piece.player,
			type: WinConditionType.MASTER_CAPTURE
		};
	}

	// Check if a master reached the opponent's temple
	if (piece.type === 'master') {
		const opponentTemple =
			piece.player === 'blue'
				? TEMPLE_POSITIONS.red
				: TEMPLE_POSITIONS.blue;

		if (
			targetPosition.x === opponentTemple.x &&
			targetPosition.y === opponentTemple.y
		) {
			return {
				isWin: true,
				winner: piece.player,
				type: WinConditionType.TEMPLE_ARCH
			};
		}
	}

	// No win condition met
	return {
		isWin: false,
		winner: null,
		type: null
	};
};

/**
 * Gets a descriptive message for a win condition
 * @param winResult The win result
 * @returns A message describing the win
 */
export const getWinMessage = (winResult: WinResult): string => {
	if (!winResult.isWin || !winResult.winner) {
		return '';
	}

	const playerName = winResult.winner === 'blue' ? 'Blue' : 'Red';

	switch (winResult.type) {
		case WinConditionType.MASTER_CAPTURE:
			return `${playerName} wins by capturing the opponent's Master!`;
		case WinConditionType.TEMPLE_ARCH:
			return `${playerName} wins by moving their Master to the opponent's Temple!`;
		default:
			return `${playerName} wins!`;
	}
};

/**
 * Checks if the game is in a stalemate (current player has no valid moves)
 * @param gameState The current game state
 * @param hasValidMoves Function to check if the player has valid moves
 * @returns True if the game is in a stalemate
 */
export const checkStalemate = (
	gameState: GameState,
	hasValidMoves: (state: GameState) => boolean
): boolean => {
	return !hasValidMoves(gameState);
};
