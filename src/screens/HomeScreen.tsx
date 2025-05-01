import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
	Modal,
	TextInput,
	Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useOnline } from '../context/OnlineContext';

// Import the RootStackParamList from AppNavigator
import { RootStackParamList } from '../navigation/AppNavigator';

// Define the navigation prop type
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
	const navigation = useNavigation<HomeScreenNavigationProp>();
	const { isAuthenticated, signIn, signUp } = useOnline();

	// State for modals
	const [loginModalVisible, setLoginModalVisible] = useState(false);
	const [signupModalVisible, setSignupModalVisible] = useState(false);
	const [joinRoomModalVisible, setJoinRoomModalVisible] = useState(false);

	// State for form inputs
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [roomCode, setRoomCode] = useState('');

	// Handle local game button press
	const handleLocalGamePress = () => {
		navigation.navigate('Game');
	};

	// Handle online lobby button press
	const handleOnlineLobbyPress = () => {
		if (isAuthenticated) {
			navigation.navigate('OnlineLobby');
		} else {
			setLoginModalVisible(true);
		}
	};

	// Handle join room button press
	const handleJoinRoomPress = () => {
		if (isAuthenticated) {
			setJoinRoomModalVisible(true);
		} else {
			setLoginModalVisible(true);
		}
	};

	// Handle how to play button press
	const handleHowToPlayPress = () => {
		navigation.navigate('HowToPlay');
	};

	// Handle login form submission
	const handleLogin = async () => {
		try {
			await signIn(email, password);
			setLoginModalVisible(false);
			setEmail('');
			setPassword('');
		} catch (error) {
			Alert.alert('Login Error', 'Failed to login. Please try again.');
		}
	};

	// Handle signup form submission
	const handleSignup = async () => {
		try {
			await signUp(email, password, displayName);
			setSignupModalVisible(false);
			setEmail('');
			setPassword('');
			setDisplayName('');
		} catch (error) {
			Alert.alert(
				'Signup Error',
				'Failed to create account. Please try again.'
			);
		}
	};

	// Handle join room form submission
	const handleJoinRoom = () => {
		if (roomCode.trim() === '') {
			Alert.alert('Error', 'Please enter a room code');
			return;
		}

		navigation.navigate('OnlineGame', { roomId: roomCode });
		setJoinRoomModalVisible(false);
		setRoomCode('');
	};

	// Render login modal
	const renderLoginModal = () => (
		<Modal
			animationType='slide'
			transparent={true}
			visible={loginModalVisible}
			onRequestClose={() => setLoginModalVisible(false)}
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalContent}>
					<Text style={styles.modalTitle}>Login</Text>

					<TextInput
						style={styles.input}
						placeholder='Email'
						value={email}
						onChangeText={setEmail}
						autoCapitalize='none'
						keyboardType='email-address'
					/>

					<TextInput
						style={styles.input}
						placeholder='Password'
						value={password}
						onChangeText={setPassword}
						secureTextEntry
					/>

					<View style={styles.modalButtonsRow}>
						<TouchableOpacity
							style={[styles.modalButton, styles.cancelButton]}
							onPress={() => setLoginModalVisible(false)}
						>
							<Text style={styles.modalButtonText}>Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.modalButton, styles.confirmButton]}
							onPress={handleLogin}
						>
							<Text style={styles.modalButtonText}>Login</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						onPress={() => {
							setLoginModalVisible(false);
							setSignupModalVisible(true);
						}}
					>
						<Text style={styles.switchModalText}>
							Don't have an account? Sign up
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);

	// Render signup modal
	const renderSignupModal = () => (
		<Modal
			animationType='slide'
			transparent={true}
			visible={signupModalVisible}
			onRequestClose={() => setSignupModalVisible(false)}
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalContent}>
					<Text style={styles.modalTitle}>Create Account</Text>

					<TextInput
						style={styles.input}
						placeholder='Display Name'
						value={displayName}
						onChangeText={setDisplayName}
					/>

					<TextInput
						style={styles.input}
						placeholder='Email'
						value={email}
						onChangeText={setEmail}
						autoCapitalize='none'
						keyboardType='email-address'
					/>

					<TextInput
						style={styles.input}
						placeholder='Password'
						value={password}
						onChangeText={setPassword}
						secureTextEntry
					/>

					<View style={styles.modalButtonsRow}>
						<TouchableOpacity
							style={[styles.modalButton, styles.cancelButton]}
							onPress={() => setSignupModalVisible(false)}
						>
							<Text style={styles.modalButtonText}>Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.modalButton, styles.confirmButton]}
							onPress={handleSignup}
						>
							<Text style={styles.modalButtonText}>Sign Up</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						onPress={() => {
							setSignupModalVisible(false);
							setLoginModalVisible(true);
						}}
					>
						<Text style={styles.switchModalText}>
							Already have an account? Login
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);

	// Render join room modal
	const renderJoinRoomModal = () => (
		<Modal
			animationType='slide'
			transparent={true}
			visible={joinRoomModalVisible}
			onRequestClose={() => setJoinRoomModalVisible(false)}
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalContent}>
					<Text style={styles.modalTitle}>Join Room</Text>

					<TextInput
						style={styles.input}
						placeholder='Room Code'
						value={roomCode}
						onChangeText={setRoomCode}
						autoCapitalize='characters'
					/>

					<View style={styles.modalButtonsRow}>
						<TouchableOpacity
							style={[styles.modalButton, styles.cancelButton]}
							onPress={() => setJoinRoomModalVisible(false)}
						>
							<Text style={styles.modalButtonText}>Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.modalButton, styles.confirmButton]}
							onPress={handleJoinRoom}
						>
							<Text style={styles.modalButtonText}>Join</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Onitama</Text>
				<Text style={styles.subtitle}>Digital Edition</Text>
			</View>

			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={styles.button}
					onPress={handleLocalGamePress}
				>
					<Text style={styles.buttonText}>Local Game</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.button}
					onPress={handleOnlineLobbyPress}
				>
					<Text style={styles.buttonText}>Online Lobby</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.button}
					onPress={handleJoinRoomPress}
				>
					<Text style={styles.buttonText}>Join Room</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.button, styles.howToPlayButton]}
					onPress={handleHowToPlayPress}
				>
					<Text style={styles.buttonText}>How to Play</Text>
				</TouchableOpacity>
			</View>

			{renderLoginModal()}
			{renderSignupModal()}
			{renderJoinRoomModal()}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
		padding: 20
	},
	header: {
		alignItems: 'center',
		marginBottom: 50
	},
	title: {
		fontSize: 48,
		fontWeight: 'bold',
		color: '#333',
		textAlign: 'center'
	},
	subtitle: {
		fontSize: 24,
		color: '#666',
		textAlign: 'center'
	},
	buttonContainer: {
		width: '100%',
		maxWidth: 300
	},
	button: {
		backgroundColor: '#3498db',
		padding: 15,
		borderRadius: 10,
		marginVertical: 10,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 3
	},
	buttonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold'
	},
	howToPlayButton: {
		backgroundColor: '#2ecc71'
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)'
	},
	modalContent: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 20,
		width: '80%',
		maxWidth: 400,
		alignItems: 'center'
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20
	},
	input: {
		width: '100%',
		height: 50,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		marginBottom: 15,
		paddingHorizontal: 10
	},
	modalButtonsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginTop: 10
	},
	modalButton: {
		padding: 12,
		borderRadius: 5,
		alignItems: 'center',
		flex: 1,
		marginHorizontal: 5
	},
	cancelButton: {
		backgroundColor: '#e74c3c'
	},
	confirmButton: {
		backgroundColor: '#2ecc71'
	},
	modalButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16
	},
	switchModalText: {
		marginTop: 20,
		color: '#3498db',
		textDecorationLine: 'underline'
	}
});

export default HomeScreen;
