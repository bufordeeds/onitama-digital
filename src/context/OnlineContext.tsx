import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode
} from 'react';
import { GameState, User, GameRoom } from '../types';
import { initializeGame } from '../logic/gameState';

// Define the context value type
interface OnlineContextValue {
	// Authentication
	currentUser: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (
		email: string,
		password: string,
		displayName: string
	) => Promise<void>;
	signOut: () => Promise<void>;

	// Game rooms
	rooms: GameRoom[];
	currentRoom: GameRoom | null;
	createRoom: (name: string, isPrivate: boolean) => Promise<string>;
	joinRoom: (roomId: string, joinCode?: string) => Promise<void>;
	leaveRoom: () => Promise<void>;

	// Game state
	updateGameState: (gameState: GameState) => Promise<void>;
}

// Create the context
const OnlineContext = createContext<OnlineContextValue | undefined>(undefined);

// Provider component
interface OnlineProviderProps {
	children: ReactNode;
}

export const OnlineProvider: React.FC<OnlineProviderProps> = ({ children }) => {
	// Authentication state
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Game rooms state
	const [rooms, setRooms] = useState<GameRoom[]>([]);
	const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);

	// Mock authentication functions (to be replaced with Firebase)
	const signIn = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			// Mock authentication - in a real app, this would use Firebase Auth
			const mockUser: User = {
				id: 'user-123',
				displayName: email.split('@')[0],
				stats: {
					wins: 0,
					losses: 0,
					draws: 0
				}
			};

			setCurrentUser(mockUser);
			setIsAuthenticated(true);
		} catch (error) {
			console.error('Sign in error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signUp = async (
		email: string,
		password: string,
		displayName: string
	) => {
		setIsLoading(true);
		try {
			// Mock sign up - in a real app, this would use Firebase Auth
			const mockUser: User = {
				id: 'user-' + Math.floor(Math.random() * 1000),
				displayName,
				stats: {
					wins: 0,
					losses: 0,
					draws: 0
				}
			};

			setCurrentUser(mockUser);
			setIsAuthenticated(true);
		} catch (error) {
			console.error('Sign up error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signOut = async () => {
		setIsLoading(true);
		try {
			// Mock sign out - in a real app, this would use Firebase Auth
			setCurrentUser(null);
			setIsAuthenticated(false);
			setCurrentRoom(null);
		} catch (error) {
			console.error('Sign out error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Mock room functions (to be replaced with Firebase)
	const createRoom = async (name: string, isPrivate: boolean) => {
		if (!currentUser) {
			throw new Error('User must be authenticated to create a room');
		}

		try {
			// Generate a random join code for private rooms
			const joinCode = isPrivate
				? Math.random().toString(36).substring(2, 8).toUpperCase()
				: undefined;

			// Create a new room
			const roomId = 'room-' + Math.floor(Math.random() * 10000);
			const newRoom: GameRoom = {
				id: roomId,
				name,
				createdBy: currentUser.id,
				isPrivate,
				joinCode,
				players: {
					blue: currentUser
				},
				gameState: initializeGame(),
				status: 'waiting',
				lastMoveTime: Date.now()
			};

			// In a real app, this would save to Firebase
			setRooms([...rooms, newRoom]);
			setCurrentRoom(newRoom);

			return roomId;
		} catch (error) {
			console.error('Create room error:', error);
			throw error;
		}
	};

	const joinRoom = async (roomId: string, joinCode?: string) => {
		if (!currentUser) {
			throw new Error('User must be authenticated to join a room');
		}

		try {
			// Find the room
			const room = rooms.find((r) => r.id === roomId);

			if (!room) {
				throw new Error('Room not found');
			}

			// Check if it's a private room and validate join code
			if (room.isPrivate && room.joinCode !== joinCode) {
				throw new Error('Invalid join code');
			}

			// Check if the room is full
			if (room.players.blue && room.players.red) {
				throw new Error('Room is full');
			}

			// Join as the available color
			const updatedRoom: GameRoom = {
				...room,
				players: {
					...room.players,
					red: room.players.blue ? currentUser : room.players.red,
					blue: room.players.blue || currentUser
				},
				status: room.players.blue ? 'playing' : 'waiting'
			};

			// In a real app, this would update Firebase
			setRooms(rooms.map((r) => (r.id === roomId ? updatedRoom : r)));
			setCurrentRoom(updatedRoom);
		} catch (error) {
			console.error('Join room error:', error);
			throw error;
		}
	};

	const leaveRoom = async () => {
		if (!currentUser || !currentRoom) {
			return;
		}

		try {
			// Check if the user is in the room
			const isBluePlayer =
				currentRoom.players.blue?.id === currentUser.id;
			const isRedPlayer = currentRoom.players.red?.id === currentUser.id;

			if (!isBluePlayer && !isRedPlayer) {
				return;
			}

			// If the user is the only player, delete the room
			if (
				(isBluePlayer && !currentRoom.players.red) ||
				(isRedPlayer && !currentRoom.players.blue)
			) {
				// In a real app, this would delete from Firebase
				setRooms(rooms.filter((r) => r.id !== currentRoom.id));
				setCurrentRoom(null);
				return;
			}

			// Otherwise, remove the player from the room
			const updatedRoom: GameRoom = {
				...currentRoom,
				players: {
					blue: isBluePlayer ? undefined : currentRoom.players.blue,
					red: isRedPlayer ? undefined : currentRoom.players.red
				},
				status: 'waiting'
			};

			// In a real app, this would update Firebase
			setRooms(
				rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r))
			);
			setCurrentRoom(null);
		} catch (error) {
			console.error('Leave room error:', error);
			throw error;
		}
	};

	// Game state functions
	const updateGameState = async (gameState: GameState) => {
		if (!currentRoom) {
			throw new Error('Not in a room');
		}

		try {
			// Update the room's game state
			const updatedRoom: GameRoom = {
				...currentRoom,
				gameState,
				lastMoveTime: Date.now()
			};

			// In a real app, this would update Firebase
			setRooms(
				rooms.map((r) => (r.id === currentRoom.id ? updatedRoom : r))
			);
			setCurrentRoom(updatedRoom);
		} catch (error) {
			console.error('Update game state error:', error);
			throw error;
		}
	};

	// Simulate loading user from storage on mount
	useEffect(() => {
		const loadUser = async () => {
			setIsLoading(true);
			try {
				// In a real app, this would check Firebase Auth state
				// For now, just set loading to false
				setIsLoading(false);
			} catch (error) {
				console.error('Load user error:', error);
				setIsLoading(false);
			}
		};

		loadUser();
	}, []);

	// Create the context value
	const contextValue: OnlineContextValue = {
		currentUser,
		isAuthenticated,
		isLoading,
		signIn,
		signUp,
		signOut,
		rooms,
		currentRoom,
		createRoom,
		joinRoom,
		leaveRoom,
		updateGameState
	};

	return (
		<OnlineContext.Provider value={contextValue}>
			{children}
		</OnlineContext.Provider>
	);
};

// Custom hook for using the online context
export const useOnline = (): OnlineContextValue => {
	const context = useContext(OnlineContext);

	if (context === undefined) {
		throw new Error('useOnline must be used within an OnlineProvider');
	}

	return context;
};

// Helper function to check if the current user is the blue player
export const isBluePlayer = (
	currentUser: User | null,
	room: GameRoom | null
): boolean => {
	if (!currentUser || !room || !room.players.blue) {
		return false;
	}

	return room.players.blue.id === currentUser.id;
};

// Helper function to check if the current user is the red player
export const isRedPlayer = (
	currentUser: User | null,
	room: GameRoom | null
): boolean => {
	if (!currentUser || !room || !room.players.red) {
		return false;
	}

	return room.players.red.id === currentUser.id;
};

// Helper function to check if it's the current user's turn
export const isCurrentUserTurn = (
	currentUser: User | null,
	room: GameRoom | null
): boolean => {
	if (!currentUser || !room) {
		return false;
	}

	const isBlue = isBluePlayer(currentUser, room);
	const isRed = isRedPlayer(currentUser, room);

	return (
		(isBlue && room.gameState.currentPlayer === 'blue') ||
		(isRed && room.gameState.currentPlayer === 'red')
	);
};

// Helper function to get the current player's display name
export const getCurrentPlayerName = (room: GameRoom | null): string => {
	if (!room) {
		return '';
	}

	return room.gameState.currentPlayer === 'blue'
		? room.players.blue?.displayName || 'Blue'
		: room.players.red?.displayName || 'Red';
};
