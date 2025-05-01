import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import Constants from 'expo-constants';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
	authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
	databaseURL: Constants.expoConfig?.extra?.firebaseDatabaseURL,
	projectId: Constants.expoConfig?.extra?.firebaseProjectId,
	storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
	messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
	appId: Constants.expoConfig?.extra?.firebaseAppId,
	measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

export { app, auth, firestore, database };
