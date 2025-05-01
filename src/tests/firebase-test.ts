import { initializeApp } from 'firebase/app';
import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	deleteUser
} from 'firebase/auth';
import {
	getFirestore,
	collection,
	doc,
	setDoc,
	addDoc,
	query,
	where,
	getDocs,
	deleteDoc
} from 'firebase/firestore';
import { getDatabase, ref, set, remove } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyCH-Ttb4BcS7lA-_9t7JNpCVESP-YLzAgw',
	authDomain: 'onitama-digital.firebaseapp.com',
	databaseURL: 'https://onitama-digital-default-rtdb.firebaseio.com',
	projectId: 'onitama-digital',
	storageBucket: 'onitama-digital.firebasestorage.app',
	messagingSenderId: '1075496089760',
	appId: '1:1075496089760:web:449489a032f82f7f02f1c5',
	measurementId: 'G-F6RLQCFVPF'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

// Test user credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123!';
const TEST_DISPLAY_NAME = 'Test User';

// Test game room
const TEST_ROOM_NAME = 'Test Room';

/**
 * Run the Firebase test
 */
async function runTest() {
	console.log('Starting Firebase test...');

	try {
		// Step 1: Create a test user
		console.log('Step 1: Creating test user...');
		let userCredential;
		try {
			userCredential = await createUserWithEmailAndPassword(
				auth,
				TEST_EMAIL,
				TEST_PASSWORD
			);
			console.log('Test user created successfully');
		} catch (error: any) {
			if (error.code === 'auth/email-already-in-use') {
				console.log('Test user already exists, signing in...');
				userCredential = await signInWithEmailAndPassword(
					auth,
					TEST_EMAIL,
					TEST_PASSWORD
				);
			} else {
				throw error;
			}
		}

		const userId = userCredential.user.uid;
		console.log('User ID:', userId);

		// Step 2: Create a user profile in Firestore
		console.log('Step 2: Creating user profile in Firestore...');
		const userRef = doc(firestore, 'users', userId);
		await setDoc(userRef, {
			id: userId,
			displayName: TEST_DISPLAY_NAME,
			stats: {
				wins: 0,
				losses: 0,
				draws: 0
			}
		});
		console.log('User profile created successfully');

		// Step 3: Create a game room
		console.log('Step 3: Creating game room...');
		const roomsRef = collection(firestore, 'gameRooms');
		const roomDoc = await addDoc(roomsRef, {
			name: TEST_ROOM_NAME,
			createdBy: userId,
			isPrivate: false,
			players: {
				blue: {
					id: userId,
					displayName: TEST_DISPLAY_NAME
				}
			},
			status: 'waiting',
			lastMoveTime: Date.now()
		});
		console.log('Game room created successfully with ID:', roomDoc.id);

		// Step 4: Initialize game state in Realtime Database
		console.log('Step 4: Initializing game state in Realtime Database...');
		const gameStateRef = ref(database, `gameStates/${roomDoc.id}`);
		await set(gameStateRef, {
			board: Array(5)
				.fill(null)
				.map(() => Array(5).fill(null)),
			currentPlayer: 'blue',
			gameStatus: 'playing'
		});
		console.log('Game state initialized successfully');

		// Step 5: Verify that the game room was created
		console.log('Step 5: Verifying game room...');
		const roomsQuery = query(roomsRef, where('createdBy', '==', userId));
		const querySnapshot = await getDocs(roomsQuery);

		if (!querySnapshot.empty) {
			console.log('Game room verification successful');

			// Clean up - delete the game room
			console.log('Cleaning up - deleting game room...');
			for (const doc of querySnapshot.docs) {
				await deleteDoc(doc.ref);

				// Delete the game state
				const gameStateRef = ref(database, `gameStates/${doc.id}`);
				await remove(gameStateRef);
			}
			console.log('Game room and state deleted successfully');
		} else {
			console.error('Game room verification failed - room not found');
		}

		// Clean up - delete the test user
		console.log('Cleaning up - deleting test user...');
		await deleteUser(userCredential.user);
		console.log('Test user deleted successfully');

		console.log('Firebase test completed successfully!');
	} catch (error) {
		console.error('Firebase test failed:', error);
	}
}

// Run the test
runTest();
