import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { app, auth, firestore, database };
