import { firestore } from './firebaseConfig';
import {
	collection,
	addDoc,
	doc,
	getDoc,
	getDocs,
	updateDoc,
	query,
	where,
	serverTimestamp,
	DocumentReference
} from 'firebase/firestore';
import { GameRoom, User, GameState } from '../types';

const roomsCollection = collection(firestore, 'gameRooms');
const usersCollection = collection(firestore, 'users');

// Generate a random 6-character join code
const generateJoinCode = (): string => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < 6; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

// Create a new game room
export const createGameRoom = async (
	createdBy: string,
	name: string,
	isPrivate: boolean,
	initialGameState: GameState
): Promise<DocumentReference> => {
	const newRoom: Partial<GameRoom> = {
		name,
		createdBy,
		isPrivate,
		joinCode: isPrivate ? generateJoinCode() : undefined,
		players: {},
		status: 'waiting',
		gameState: initialGameState,
		lastMoveTime: Date.now()
	};

	return addDoc(roomsCollection, newRoom);
};

// Get a game room by ID
export const getGameRoom = async (roomId: string): Promise<GameRoom | null> => {
	const roomRef = doc(firestore, 'gameRooms', roomId);
	const roomSnap = await getDoc(roomRef);

	if (roomSnap.exists()) {
		return { id: roomSnap.id, ...roomSnap.data() } as GameRoom;
	}

	return null;
};

// Get a game room by join code
export const getGameRoomByJoinCode = async (
	joinCode: string
): Promise<GameRoom | null> => {
	const q = query(roomsCollection, where('joinCode', '==', joinCode));
	const querySnapshot = await getDocs(q);

	if (!querySnapshot.empty) {
		const doc = querySnapshot.docs[0];
		return { id: doc.id, ...doc.data() } as GameRoom;
	}

	return null;
};

// Get all public game rooms
export const getPublicGameRooms = async (): Promise<GameRoom[]> => {
	const q = query(
		roomsCollection,
		where('isPrivate', '==', false),
		where('status', '==', 'waiting')
	);

	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data()
	})) as GameRoom[];
};

// Join a game room
export const joinGameRoom = async (
	roomId: string,
	user: User,
	color: 'blue' | 'red'
): Promise<void> => {
	const roomRef = doc(firestore, 'gameRooms', roomId);
	const roomSnap = await getDoc(roomRef);

	if (!roomSnap.exists()) {
		throw new Error('Game room not found');
	}

	const room = roomSnap.data() as GameRoom;

	// Check if the color is already taken
	if (room.players[color]) {
		throw new Error(`The ${color} player position is already taken`);
	}

	// Update the room with the new player
	return updateDoc(roomRef, {
		[`players.${color}`]: user,
		lastMoveTime: Date.now()
	});
};

// Update game state
export const updateGameState = async (
	roomId: string,
	gameState: GameState
): Promise<void> => {
	const roomRef = doc(firestore, 'gameRooms', roomId);

	return updateDoc(roomRef, {
		gameState,
		lastMoveTime: Date.now()
	});
};

// Update room status
export const updateRoomStatus = async (
	roomId: string,
	status: 'waiting' | 'playing' | 'completed'
): Promise<void> => {
	const roomRef = doc(firestore, 'gameRooms', roomId);

	return updateDoc(roomRef, {
		status,
		lastMoveTime: Date.now()
	});
};

// Leave a game room
export const leaveGameRoom = async (
	roomId: string,
	userId: string
): Promise<void> => {
	const roomRef = doc(firestore, 'gameRooms', roomId);
	const roomSnap = await getDoc(roomRef);

	if (!roomSnap.exists()) {
		throw new Error('Game room not found');
	}

	const room = roomSnap.data() as GameRoom;

	// Determine which color the user is
	let colorToRemove: 'blue' | 'red' | null = null;

	if (room.players.blue?.id === userId) {
		colorToRemove = 'blue';
	} else if (room.players.red?.id === userId) {
		colorToRemove = 'red';
	}

	if (!colorToRemove) {
		throw new Error('User is not in this game room');
	}

	// Update the room to remove the player
	return updateDoc(roomRef, {
		[`players.${colorToRemove}`]: null,
		lastMoveTime: Date.now()
	});
};

// Create or update user profile
export const saveUserProfile = async (user: User): Promise<void> => {
	const userRef = doc(firestore, 'users', user.id);
	const userSnap = await getDoc(userRef);

	if (userSnap.exists()) {
		// Update existing user
		return updateDoc(userRef, { ...user });
	} else {
		// Create new user with default stats
		const newUser = {
			...user,
			stats: {
				wins: 0,
				losses: 0,
				draws: 0
			}
		};

		return updateDoc(userRef, newUser);
	}
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<User | null> => {
	const userRef = doc(firestore, 'users', userId);
	const userSnap = await getDoc(userRef);

	if (userSnap.exists()) {
		return { id: userSnap.id, ...userSnap.data() } as User;
	}

	return null;
};

// Update user stats
export const updateUserStats = async (
	userId: string,
	result: 'win' | 'loss' | 'draw'
): Promise<void> => {
	const userRef = doc(firestore, 'users', userId);
	const userSnap = await getDoc(userRef);

	if (!userSnap.exists()) {
		throw new Error('User not found');
	}

	const user = userSnap.data() as User;
	const stats = user.stats || { wins: 0, losses: 0, draws: 0 };

	if (result === 'win') {
		stats.wins += 1;
	} else if (result === 'loss') {
		stats.losses += 1;
	} else {
		stats.draws += 1;
	}

	return updateDoc(userRef, { stats });
};
