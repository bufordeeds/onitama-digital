import { database } from './firebaseConfig';
import {
	ref,
	set,
	onValue,
	update,
	remove,
	off,
	DataSnapshot
} from 'firebase/database';
import { GameState } from '../types';

/**
 * Update the game state in the realtime database
 */
export const updateGameState = (
	roomId: string,
	gameState: GameState
): Promise<void> => {
	const gameStateRef = ref(database, `gameStates/${roomId}`);
	return set(gameStateRef, gameState);
};

/**
 * Subscribe to game state changes
 * Returns an unsubscribe function
 */
export const subscribeToGameState = (
	roomId: string,
	callback: (gameState: GameState) => void
): (() => void) => {
	const gameStateRef = ref(database, `gameStates/${roomId}`);

	const handleSnapshot = (snapshot: DataSnapshot) => {
		const data = snapshot.val();
		if (data) {
			callback(data as GameState);
		}
	};

	onValue(gameStateRef, handleSnapshot);

	// Return unsubscribe function
	return () => off(gameStateRef, 'value', handleSnapshot);
};

/**
 * Update a specific part of the game state
 */
export const updateGameStateField = (
	roomId: string,
	field: string,
	value: any
): Promise<void> => {
	const gameStateRef = ref(database, `gameStates/${roomId}`);
	const updates: Record<string, any> = {};
	updates[field] = value;

	return update(gameStateRef, updates);
};

/**
 * Record a move in the move history
 */
export const recordMove = (
	roomId: string,
	moveData: {
		player: string;
		piece: string;
		from: { x: number; y: number };
		to: { x: number; y: number };
		card: string;
		timestamp: number;
	}
): Promise<void> => {
	const moveRef = ref(database, `moves/${roomId}/${moveData.timestamp}`);
	return set(moveRef, moveData);
};

/**
 * Subscribe to move history
 * Returns an unsubscribe function
 */
export const subscribeToMoves = (
	roomId: string,
	callback: (moves: Record<string, any>) => void
): (() => void) => {
	const movesRef = ref(database, `moves/${roomId}`);

	const handleSnapshot = (snapshot: DataSnapshot) => {
		const data = snapshot.val();
		if (data) {
			callback(data);
		} else {
			callback({});
		}
	};

	onValue(movesRef, handleSnapshot);

	// Return unsubscribe function
	return () => off(movesRef, 'value', handleSnapshot);
};

/**
 * Update player presence status
 */
export const updatePlayerPresence = (
	roomId: string,
	userId: string,
	isOnline: boolean
): Promise<void> => {
	const presenceRef = ref(database, `presence/${roomId}/${userId}`);

	if (isOnline) {
		return set(presenceRef, {
			online: true,
			lastSeen: Date.now()
		});
	} else {
		return remove(presenceRef);
	}
};

/**
 * Subscribe to player presence changes
 * Returns an unsubscribe function
 */
export const subscribeToPlayerPresence = (
	roomId: string,
	callback: (
		presence: Record<string, { online: boolean; lastSeen: number }>
	) => void
): (() => void) => {
	const presenceRef = ref(database, `presence/${roomId}`);

	const handleSnapshot = (snapshot: DataSnapshot) => {
		const data = snapshot.val();
		if (data) {
			callback(data);
		} else {
			callback({});
		}
	};

	onValue(presenceRef, handleSnapshot);

	// Return unsubscribe function
	return () => off(presenceRef, 'value', handleSnapshot);
};

/**
 * Clean up all subscriptions and data for a room
 */
export const cleanupRoom = (roomId: string): Promise<void> => {
	const gameStateRef = ref(database, `gameStates/${roomId}`);
	const movesRef = ref(database, `moves/${roomId}`);
	const presenceRef = ref(database, `presence/${roomId}`);

	return Promise.all([
		remove(gameStateRef),
		remove(movesRef),
		remove(presenceRef)
	]).then(() => {});
};
