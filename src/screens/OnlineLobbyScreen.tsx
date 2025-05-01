import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	Modal,
	TextInput,
	Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useOnline } from '../context/OnlineContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type OnlineLobbyScreenNavigationProp = StackNavigationProp<
	RootStackParamList,
	'OnlineLobby'
>;

const OnlineLobbyScreen: React.FC = () => {
	const navigation = useNavigation<OnlineLobbyScreenNavigationProp>();
	const { rooms, currentUser, createRoom, joinRoom, signOut } = useOnline();

	// State for create room modal
	const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
	const [roomName, setRoomName] = useState('');
	const [isPrivate, setIsPrivate] = useState(false);

	// Handle create room button press
	const handleCreateRoomPress = () => {
		setCreateRoomModalVisible(true);
	};

	// Handle create room form submission
	const handleCreateRoom = async () => {
		if (roomName.trim() === '') {
			Alert.alert('Error', 'Please enter a room name');
			return;
		}

		try {
			const roomId = await createRoom(roomName, isPrivate);
			setCreateRoomModalVisible(false);
			setRoomName('');
			setIsPrivate(false);
			navigation.navigate('OnlineGame', { roomId });
		} catch (error) {
			Alert.alert('Error', 'Failed to create room. Please try again.');
		}
	};

	// Handle join room
	const handleJoinRoom = async (roomId: string) => {
		try {
			await joinRoom(roomId);
			navigation.navigate('OnlineGame', { roomId });
		} catch (error) {
			Alert.alert('Error', 'Failed to join room. Please try again.');
		}
	};

	// Handle sign out
	const handleSignOut = async () => {
		try {
			await signOut();
			navigation.navigate('Home');
		} catch (error) {
			Alert.alert('Error', 'Failed to sign out. Please try again.');
		}
	};

	// Render create room modal
	const renderCreateRoomModal = () => (
		<Modal
			animationType='slide'
			transparent={true}
			visible={createRoomModalVisible}
			onRequestClose={() => setCreateRoomModalVisible(false)}
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalContent}>
					<Text style={styles.modalTitle}>Create Room</Text>

					<TextInput
						style={styles.input}
						placeholder='Room Name'
						value={roomName}
						onChangeText={setRoomName}
					/>

					<View style={styles.checkboxContainer}>
						<TouchableOpacity
							style={[
								styles.checkbox,
								isPrivate && styles.checkboxChecked
							]}
							onPress={() => setIsPrivate(!isPrivate)}
						/>
						<Text style={styles.checkboxLabel}>Private Room</Text>
					</View>

					<View style={styles.modalButtonsRow}>
						<TouchableOpacity
							style={[styles.modalButton, styles.cancelButton]}
							onPress={() => setCreateRoomModalVisible(false)}
						>
							<Text style={styles.modalButtonText}>Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.modalButton, styles.confirmButton]}
							onPress={handleCreateRoom}
						>
							<Text style={styles.modalButtonText}>Create</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);

	// Render room item
	const renderRoomItem = ({ item }: { item: any }) => {
		const isCreator = item.createdBy === currentUser?.id;
		const isFull = item.players.blue && item.players.red;
		const canJoin = !isCreator && !isFull && !item.isPrivate;

		return (
			<View style={styles.roomItem}>
				<View style={styles.roomInfo}>
					<Text style={styles.roomName}>{item.name}</Text>
					<Text style={styles.roomStatus}>
						{item.status === 'waiting'
							? 'Waiting for players'
							: 'Game in progress'}
					</Text>
					<Text style={styles.roomPlayers}>
						Players: {item.players.blue ? 1 : 0}/2
					</Text>
				</View>

				<View style={styles.roomActions}>
					{isCreator ? (
						<TouchableOpacity
							style={[styles.roomButton, styles.continueButton]}
							onPress={() =>
								navigation.navigate('OnlineGame', {
									roomId: item.id
								})
							}
						>
							<Text style={styles.roomButtonText}>Continue</Text>
						</TouchableOpacity>
					) : canJoin ? (
						<TouchableOpacity
							style={[styles.roomButton, styles.joinButton]}
							onPress={() => handleJoinRoom(item.id)}
						>
							<Text style={styles.roomButtonText}>Join</Text>
						</TouchableOpacity>
					) : (
						<View
							style={[styles.roomButton, styles.disabledButton]}
						>
							<Text style={styles.roomButtonText}>
								{isFull ? 'Full' : 'Private'}
							</Text>
						</View>
					)}
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.welcomeText}>
					Welcome, {currentUser?.displayName || 'Player'}
				</Text>
				<TouchableOpacity
					style={styles.signOutButton}
					onPress={handleSignOut}
				>
					<Text style={styles.signOutButtonText}>Sign Out</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.roomsContainer}>
				<Text style={styles.sectionTitle}>Available Rooms</Text>

				{rooms.length > 0 ? (
					<FlatList
						data={rooms}
						renderItem={renderRoomItem}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.roomsList}
					/>
				) : (
					<Text style={styles.noRoomsText}>No rooms available</Text>
				)}
			</View>

			<TouchableOpacity
				style={styles.createRoomButton}
				onPress={handleCreateRoomPress}
			>
				<Text style={styles.createRoomButtonText}>Create Room</Text>
			</TouchableOpacity>

			{renderCreateRoomModal()}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#f0f0f0'
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20
	},
	welcomeText: {
		fontSize: 18,
		fontWeight: 'bold'
	},
	signOutButton: {
		padding: 8,
		backgroundColor: '#e74c3c',
		borderRadius: 5
	},
	signOutButtonText: {
		color: '#fff',
		fontWeight: 'bold'
	},
	roomsContainer: {
		flex: 1
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10
	},
	roomsList: {
		paddingBottom: 20
	},
	noRoomsText: {
		textAlign: 'center',
		marginTop: 20,
		fontSize: 16,
		color: '#666'
	},
	roomItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 15,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2
	},
	roomInfo: {
		flex: 1
	},
	roomName: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 5
	},
	roomStatus: {
		fontSize: 14,
		color: '#666',
		marginBottom: 3
	},
	roomPlayers: {
		fontSize: 14,
		color: '#666'
	},
	roomActions: {
		marginLeft: 10
	},
	roomButton: {
		padding: 8,
		borderRadius: 5,
		minWidth: 80,
		alignItems: 'center'
	},
	joinButton: {
		backgroundColor: '#2ecc71'
	},
	continueButton: {
		backgroundColor: '#3498db'
	},
	disabledButton: {
		backgroundColor: '#95a5a6'
	},
	roomButtonText: {
		color: '#fff',
		fontWeight: 'bold'
	},
	createRoomButton: {
		backgroundColor: '#3498db',
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 3
	},
	createRoomButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold'
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
	checkboxContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
		alignSelf: 'flex-start'
	},
	checkbox: {
		width: 24,
		height: 24,
		borderWidth: 2,
		borderColor: '#3498db',
		borderRadius: 4,
		marginRight: 10
	},
	checkboxChecked: {
		backgroundColor: '#3498db'
	},
	checkboxLabel: {
		fontSize: 16
	},
	modalButtonsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%'
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
	}
});

export default OnlineLobbyScreen;
