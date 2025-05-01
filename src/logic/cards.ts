import { Card, Move } from '../types';

/**
 * Definitions for all 16 Onitama movement cards
 * Each card has a unique name, color, and set of movement patterns
 *
 * Movement patterns are defined as relative offsets from the current position
 * - dx: horizontal offset (negative = left, positive = right)
 * - dy: vertical offset (negative = up, positive = down)
 *
 * Note: These movements are from the blue player's perspective
 * For the red player, the movements are flipped (multiply by -1)
 */

// Helper function to create a card
const createCard = (
	id: string,
	name: string,
	moves: Move[],
	color: string,
	description: string
): Card => ({
	id,
	name,
	moves,
	color,
	description
});

// The 16 Onitama cards
export const CARDS: Card[] = [
	createCard(
		'tiger',
		'Tiger',
		[
			{ dx: 0, dy: -2 }, // 2 spaces forward
			{ dx: 0, dy: 1 } // 1 space backward
		],
		'#f39c12',
		'Fierce and fast, the Tiger moves with powerful leaps'
	),

	createCard(
		'dragon',
		'Dragon',
		[
			{ dx: -2, dy: 1 }, // Diagonal back-left
			{ dx: 2, dy: 1 }, // Diagonal back-right
			{ dx: -1, dy: -1 }, // Diagonal forward-left
			{ dx: 1, dy: -1 } // Diagonal forward-right
		],
		'#c0392b',
		'The Dragon moves with mythical power and unpredictability'
	),

	createCard(
		'frog',
		'Frog',
		[
			{ dx: -2, dy: 0 }, // 2 spaces left
			{ dx: -1, dy: -1 }, // Diagonal forward-left
			{ dx: 1, dy: 1 } // Diagonal back-right
		],
		'#27ae60',
		'The Frog leaps with surprising agility'
	),

	createCard(
		'rabbit',
		'Rabbit',
		[
			{ dx: 2, dy: 0 }, // 2 spaces right
			{ dx: 1, dy: -1 }, // Diagonal forward-right
			{ dx: -1, dy: 1 } // Diagonal back-left
		],
		'#e74c3c',
		'Quick and unpredictable, the Rabbit hops with precision'
	),

	createCard(
		'crab',
		'Crab',
		[
			{ dx: 0, dy: -1 }, // 1 space forward
			{ dx: -2, dy: 0 }, // 2 spaces left
			{ dx: 2, dy: 0 } // 2 spaces right
		],
		'#3498db',
		'The Crab moves sideways with surprising reach'
	),

	createCard(
		'elephant',
		'Elephant',
		[
			{ dx: -1, dy: 0 }, // 1 space left
			{ dx: 1, dy: 0 }, // 1 space right
			{ dx: -1, dy: -1 }, // Diagonal forward-left
			{ dx: 1, dy: -1 } // Diagonal forward-right
		],
		'#7f8c8d',
		'The Elephant moves with unstoppable force'
	),

	createCard(
		'goose',
		'Goose',
		[
			{ dx: -1, dy: 0 }, // 1 space left
			{ dx: -1, dy: 1 }, // Diagonal back-left
			{ dx: 1, dy: -1 }, // Diagonal forward-right
			{ dx: 1, dy: 0 } // 1 space right
		],
		'#f1c40f',
		'The Goose moves with graceful coordination'
	),

	createCard(
		'rooster',
		'Rooster',
		[
			{ dx: -1, dy: -1 }, // Diagonal forward-left
			{ dx: -1, dy: 0 }, // 1 space left
			{ dx: 1, dy: 0 }, // 1 space right
			{ dx: 1, dy: 1 } // Diagonal back-right
		],
		'#e67e22',
		'The Rooster struts with confident precision'
	),

	createCard(
		'monkey',
		'Monkey',
		[
			{ dx: -1, dy: -1 }, // Diagonal forward-left
			{ dx: 1, dy: -1 }, // Diagonal forward-right
			{ dx: -1, dy: 1 }, // Diagonal back-left
			{ dx: 1, dy: 1 } // Diagonal back-right
		],
		'#8e44ad',
		'The Monkey moves with playful agility'
	),

	createCard(
		'mantis',
		'Mantis',
		[
			{ dx: -1, dy: -1 }, // Diagonal forward-left
			{ dx: 0, dy: 1 }, // 1 space backward
			{ dx: 1, dy: -1 } // Diagonal forward-right
		],
		'#16a085',
		'The Mantis strikes with deadly precision'
	),

	createCard(
		'horse',
		'Horse',
		[
			{ dx: 0, dy: -1 }, // 1 space forward
			{ dx: -1, dy: 0 }, // 1 space left
			{ dx: 0, dy: 1 } // 1 space backward
		],
		'#d35400',
		'The Horse moves with steady reliability'
	),

	createCard(
		'ox',
		'Ox',
		[
			{ dx: 0, dy: -1 }, // 1 space forward
			{ dx: 1, dy: 0 }, // 1 space right
			{ dx: 0, dy: 1 } // 1 space backward
		],
		'#7d3c98',
		'The Ox moves with powerful determination'
	),

	createCard(
		'crane',
		'Crane',
		[
			{ dx: 0, dy: -1 }, // 1 space forward
			{ dx: -1, dy: 1 }, // Diagonal back-left
			{ dx: 1, dy: 1 } // Diagonal back-right
		],
		'#2980b9',
		'The Crane moves with elegant balance'
	),

	createCard(
		'boar',
		'Boar',
		[
			{ dx: -1, dy: 0 }, // 1 space left
			{ dx: 0, dy: -1 }, // 1 space forward
			{ dx: 1, dy: 0 } // 1 space right
		],
		'#a04000',
		'The Boar charges with straightforward power'
	),

	createCard(
		'eel',
		'Eel',
		[
			{ dx: -1, dy: -1 }, // Diagonal forward-left
			{ dx: 1, dy: 0 }, // 1 space right
			{ dx: -1, dy: 1 } // Diagonal back-left
		],
		'#1abc9c',
		'The Eel slithers with deceptive movements'
	),

	createCard(
		'cobra',
		'Cobra',
		[
			{ dx: 1, dy: -1 }, // Diagonal forward-right
			{ dx: -1, dy: 0 }, // 1 space left
			{ dx: 1, dy: 1 } // Diagonal back-right
		],
		'#9b59b6',
		'The Cobra strikes with deadly precision'
	)
];

/**
 * Shuffles the cards and returns a new game set
 * - 2 cards for blue player
 * - 2 cards for red player
 * - 1 card for the center
 *
 * @returns An object containing the dealt cards
 */
export const dealCards = () => {
	// Create a copy of the cards array and shuffle it
	const shuffled = [...CARDS].sort(() => Math.random() - 0.5);

	return {
		blueCards: [shuffled[0], shuffled[1]],
		redCards: [shuffled[2], shuffled[3]],
		centerCard: shuffled[4]
	};
};

/**
 * Flips a move for the opposing player
 * @param move The move to flip
 * @returns The flipped move
 */
export const flipMove = (move: Move): Move => ({
	dx: -move.dx,
	dy: -move.dy
});

/**
 * Gets all valid moves for a piece using a specific card
 * @param piece The piece to move
 * @param card The card to use
 * @param isRedPlayer Whether the current player is red
 * @returns Array of valid positions the piece can move to
 */
export const getValidMovesForCard = (
	piece: { position: { x: number; y: number } },
	card: Card,
	isRedPlayer: boolean
) => {
	return card.moves.map((move) => {
		// If red player, flip the move
		const actualMove = isRedPlayer ? flipMove(move) : move;

		return {
			x: piece.position.x + actualMove.dx,
			y: piece.position.y + actualMove.dy
		};
	});
};
