import { auth } from './firebaseConfig';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	User
} from 'firebase/auth';

export const signUp = (email: string, password: string) => {
	return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string) => {
	return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
	return firebaseSignOut(auth);
};

export const subscribeToAuthChanges = (
	callback: (user: User | null) => void
) => {
	return onAuthStateChanged(auth, callback);
};
