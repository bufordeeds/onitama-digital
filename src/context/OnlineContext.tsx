import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode
} from 'react';
import { GameState, User, GameRoom } from '../types';
import { initializeGame } from '../logic/gameState';
import { User as FirebaseUser } from 'firebase/auth';
import * as AuthService from '../services/auth';
import * as FirestoreService from '../services/firestore';
import * as RealtimeService from '../services/realtime';

// Define the context value type
interface OnlineContextValue {
	// Authentication
	currentUser: User | null;
	firebaseUser: FirebaseUser | null;
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
	joinRoomWithCode: (joinCode: string) => Promise<void>;

	// Game state
	updateGameState: (gameState: GameState) => Promise<void>;
	updateGameStateField: (field: string, value: any) => Promise<void>;
}

// Create the context
const OnlineContext = createContext<OnlineContextValue | undefined>(undefined);

// Provider component
interface OnlineProviderProps {
	children: ReactNode;
}

export const OnlineProvider: React.FC<OnlineProviderProps> = ({ children }) => {
	// Authentication state
	const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Game rooms state
	const [rooms, setRooms] = useState<GameRoom[]>([]);
	const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);

	// Subscriptions cleanup
	const [unsubscribeGameState, setUnsubscribeGameState] = useState<
		(() => void) | null
	>(null);

	// Authentication functions using Firebase
	const signIn = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			await AuthService.signIn(email, password);
			// User state will be updated by the auth state listener
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
			// Create the user account
			const userCredential = await AuthService.signUp(email, password);

			if (userCredential.user) {
				// Create a user profile in Firestore
				const newUser: User = {
					id: userCredential.user.uid,
					displayName,
					stats: {
						wins: 0,
						losses: 0,
						draws: 0
					}
				};

				await FirestoreService.saveUserProfile(newUser);
			}
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
			// If in a room, leave it first
			if (currentRoom) {
				await leaveRoom();
			}

			// Sign out from Firebase
			await AuthService.signOut();

			// Clear local state
			setCurrentUser(null);
			setIsAuthenticated(false);
		} catch (error) {
			console.error('Sign out error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Room functions using Firestore
	const createRoom = async (name: string, isPrivate: boolean) => {
		if (!currentUser) {
			throw new Error('User must be authenticated to create a room');
		}

		try {
			// Create a new game state
			const initialGameState = initializeGame();

			// Create the room in Firestore
			const roomRef = await FirestoreService.createGameRoom(
				currentUser.id,
				name,
				isPrivate,
				initialGameState
			);

			// Join the room as the blue player
			await FirestoreService.joinGameRoom(
				roomRef.id,
				currentUser,
				'blue'
			);

			// Initialize the game state in the realtime database
			await RealtimeService.updateGameState(roomRef.id, initialGameState);

			// Get the created room
			const room = await FirestoreService.getGameRoom(roomRef.id);

			if (room) {
				setCurrentRoom(room);

				// Subscribe to game state changes
				const unsubscribe = RealtimeService.subscribeToGameState(
					room.id,
					(gameState) => {
						setCurrentRoom((prevRoom) => {
							if (prevRoom && prevRoom.id === room.id) {
								return { ...prevRoom, gameState };
							}
							return prevRoom;
						});
					}
				);

				setUnsubscribeGameState(() => unsubscribe);
			}

			return roomRef.id;
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
			// Get the room from Firestore
			const room = await FirestoreService.getGameRoom(roomId);

			if (!room) {
				throw new Error('Room not found');
			}

			// Check if it's a private room and validate join code
			if (room.isPrivate && room.joinCode !== joinCode) {
				throw new Error('Invalid join code');
			}

			// Determine which color to join as
			let color: 'blue' | 'red';

			if (room.players.blue?.id === currentUser.id) {
				// Already joined as blue
				color = 'blue';
			} else if (room.players.red?.id === currentUser.id) {
				// Already joined as red
				color = 'red';
			} else if (!room.players.blue) {
				// Join as blue if available
				color = 'blue';
			} else if (!room.players.red) {
				// Join as red if available
				color = 'red';
			} else {
				throw new Error('Room is full');
			}

			// Join the room in Firestore
			if (
				room.players.blue?.id !== currentUser.id &&
				room.players.red?.id !== currentUser.id
			) {
				await FirestoreService.joinGameRoom(roomId, currentUser, color);
			}

			// If both players are now in the room, update the status to playing
			if (
				(color === 'blue' && room.players.red) ||
				(color === 'red' && room.players.blue)
			) {
				await FirestoreService.updateRoomStatus(roomId, 'playing');
			}

			// Get the updated room
			const updatedRoom = await FirestoreService.getGameRoom(roomId);

			if (updatedRoom) {
				setCurrentRoom(updatedRoom);

				// Subscribe to game state changes
				const unsubscribe = RealtimeService.subscribeToGameState(
					updatedRoom.id,
					(gameState) => {
						setCurrentRoom((prevRoom) => {
							if (prevRoom && prevRoom.id === updatedRoom.id) {
								return { ...prevRoom, gameState };
							}
							return prevRoom;
						});
					}
				);

				setUnsubscribeGameState(() => unsubscribe);

				// Update player presence
				RealtimeService.updatePlayerPresence(
					roomId,
					currentUser.id,
					true
				);
			}
		} catch (error) {
			console.error('Join room error:', error);
			throw error;
		}
	};

	const joinRoomWithCode = async (joinCode: string) => {
		if (!currentUser) {
			throw new Error('User must be authenticated to join a room');
		}

		try {
			// Find the room by join code
			const room = await FirestoreService.getGameRoomByJoinCode(joinCode);

			if (!room) {
				throw new Error('Room not found');
			}

			// Join the room
			await joinRoom(room.id, joinCode);
		} catch (error) {
			console.error('Join room with code error:', error);
			throw error;
		}
	};

	const leaveRoom = async () => {
		if (!currentUser || !currentRoom) {
			return;
		}

		try {
			// Unsubscribe from game state changes
			if (unsubscribeGameState) {
				unsubscribeGameState();
				setUnsubscribeGameState(null);
			}

			// Update player presence
			await RealtimeService.updatePlayerPresence(
				currentRoom.id,
				currentUser.id,
				false
			);

			// Leave the room in Firestore
			await FirestoreService.leaveGameRoom(
				currentRoom.id,
				currentUser.id
			);

			// Check if the user is the last player
			const isBluePlayer =
				currentRoom.players.blue?.id === currentUser.id;
			const isRedPlayer = currentRoom.players.red?.id === currentUser.id;

			if (
				(isBluePlayer && !currentRoom.players.red) ||
				(isRedPlayer && !currentRoom.players.blue)
			) {
				// Clean up the room data in the realtime database
				await RealtimeService.cleanupRoom(currentRoom.id);
			}

			// Clear the current room
			setCurrentRoom(null);
		} catch (error) {
			console.error('Leave room error:', error);
			throw error;
		}
	};

	// Game state functions using Realtime Database
	const updateGameState = async (gameState: GameState) => {
		if (!currentRoom) {
			throw new Error('Not in a room');
		}

		try {
			// Update the game state in the realtime database
			await RealtimeService.updateGameState(currentRoom.id, gameState);

			// Update the last move time in Firestore
			await FirestoreService.updateGameState(currentRoom.id, gameState);
		} catch (error) {
			console.error('Update game state error:', error);
			throw error;
		}
	};

	const updateGameStateField = async (field: string, value: any) => {
		if (!currentRoom) {
			throw new Error('Not in a room');
		}

		try {
			// Update a specific field in the game state
			await RealtimeService.updateGameStateField(
				currentRoom.id,
				field,
				value
			);
		} catch (error) {
			console.error('Update game state field error:', error);
			throw error;
		}
	};

	// Subscribe to auth state changes
	useEffect(() => {
		const unsubscribe = AuthService.subscribeToAuthChanges(async (user) => {
			setIsLoading(true);
			setFirebaseUser(user);

			if (user) {
				try {
					// Get or create the user profile
					let userProfile = await FirestoreService.getUserProfile(
						user.uid
					);

					if (!userProfile) {
						// Create a new user profile if it doesn't exist
						const newUser: User = {
							id: user.uid,
							displayName:
								user.displayName ||
								user.email?.split('@')[0] ||
								'User',
							stats: {
								wins: 0,
								losses: 0,
								draws: 0
							}
						};

						await FirestoreService.saveUserProfile(newUser);
						userProfile = newUser;
					}

					setCurrentUser(userProfile);
					setIsAuthenticated(true);

					// Load public rooms
					const publicRooms =
						await FirestoreService.getPublicGameRooms();
					setRooms(publicRooms);
				} catch (error) {
					console.error('Error loading user profile:', error);
				}
			} else {
				setCurrentUser(null);
				setIsAuthenticated(false);
				setRooms([]);
				setCurrentRoom(null);
			}

			setIsLoading(false);
		});

		return () => unsubscribe();
	}, []);

	// Cleanup subscriptions when component unmounts
	useEffect(() => {
		return () => {
			if (unsubscribeGameState) {
				unsubscribeGameState();
			}
		};
	}, [unsubscribeGameState]);

	// Create the context value
	const contextValue: OnlineContextValue = {
		currentUser,
		firebaseUser,
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
		joinRoomWithCode,
		updateGameState,
		updateGameStateField
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
