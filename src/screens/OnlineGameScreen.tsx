import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Alert
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useOnline, isCurrentUserTurn } from '../context/OnlineContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Board from '../components/Board';
import Card from '../components/Card';
import { Piece, Card as CardType } from '../types';

type OnlineGameScreenRouteProp = RouteProp<RootStackParamList, 'OnlineGame'>;
type OnlineGameScreenNavigationProp = StackNavigationProp<
	RootStackParamList,
	'OnlineGame'
>;

const OnlineGameScreen: React.FC = () => {
	const navigation = useNavigation<OnlineGameScreenNavigationProp>();
	const route = useRoute<OnlineGameScreenRouteProp>();
	const { roomId } = route.params;

	const { currentRoom, currentUser, updateGameState, leaveRoom, joinRoom } =
		useOnline();

	// Local state for the selected piece
	const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

	// Effect to join the room if not already in it
	useEffect(() => {
		const joinGameRoom = async () => {
			if (!currentRoom || currentRoom.id !== roomId) {
				try {
					await joinRoom(roomId);
				} catch (error) {
					Alert.alert('Error', 'Failed to join the game room.');
					navigation.goBack();
				}
			}
		};

		joinGameRoom();

		// Clean up function to leave the room when unmounting
		return () => {
			if (currentRoom && currentRoom.id === roomId) {
				leaveRoom();
			}
		};
	}, [roomId]);

	// If no current room, show loading
	if (!currentRoom) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.loadingText}>Loading game...</Text>
			</View>
		);
	}

	const { gameState } = currentRoom;
	const {
		board,
		currentPlayer,
		blueCards,
		redCards,
		centerCard,
		selectedCard,
		validMoves,
		gameStatus
	} = gameState;

	// Check if it's the current user's turn
	const isMyTurn = isCurrentUserTurn(currentUser, currentRoom);

	// Handle piece selection
	const handlePieceSelect = (piece: Piece) => {
		// Only allow selecting pieces if it's the user's turn
		if (!isMyTurn) return;

		// Only allow selecting pieces of the current player
		if (piece.player === currentPlayer) {
			setSelectedPiece(piece);
		}
	};

	// Handle card selection
	const handleCardSelect = (card: CardType) => {
		if (!isMyTurn || !selectedPiece) return;

		// Update the game state with the selected piece and card
		const updatedGameState = {
			...gameState,
			selectedPiece,
			selectedCard: card,
			validMoves: getValidMoves(selectedPiece, card)
		};

		updateGameState(updatedGameState);
	};

	// Handle position selection (moving a piece)
	const handlePositionSelect = (position: { x: number; y: number }) => {
		if (!isMyTurn || !gameState.selectedPiece || !gameState.selectedCard)
			return;

		// Check if the position is a valid move
		const isValidMove = gameState.validMoves.some(
			(move) => move.x === position.x && move.y === position.y
		);

		if (!isValidMove) return;

		// Create a deep copy of the board
		const newBoard = gameState.board.map((row) => [...row]);

		// Remove the piece from its current position
		const { selectedPiece } = gameState;
		newBoard[selectedPiece.position.y][selectedPiece.position.x] = null;

		// Update the piece's position
		const updatedPiece = {
			...selectedPiece,
			position: { ...position }
		};

		// Place the piece at the new position (capturing any opponent piece)
		newBoard[position.y][position.x] = updatedPiece;

		// Swap the used card with the center card
		const { blueCards, redCards, centerCard } = gameState;
		let newBlueCards = [...blueCards];
		let newRedCards = [...redCards];
		let newCenterCard = centerCard;

		if (currentPlayer === 'blue') {
			const cardIndex = blueCards.findIndex(
				(card) => card.id === gameState.selectedCard!.id
			);
			newBlueCards[cardIndex] = centerCard;
			newCenterCard = gameState.selectedCard!;
		} else {
			const cardIndex = redCards.findIndex(
				(card) => card.id === gameState.selectedCard!.id
			);
			newRedCards[cardIndex] = centerCard;
			newCenterCard = gameState.selectedCard!;
		}

		// Check for win conditions
		let newGameStatus = gameState.gameStatus;

		// Win condition 1: Capture opponent's master
		const capturedPiece = gameState.board[position.y][position.x];
		if (
			capturedPiece &&
			capturedPiece.type === 'master' &&
			capturedPiece.player !== currentPlayer
		) {
			newGameStatus = currentPlayer === 'blue' ? 'blue_won' : 'red_won';
		}

		// Win condition 2: Move master to opponent's temple
		if (
			selectedPiece.type === 'master' &&
			((currentPlayer === 'blue' &&
				position.y === 0 &&
				position.x === 2) ||
				(currentPlayer === 'red' &&
					position.y === 4 &&
					position.x === 2))
		) {
			newGameStatus = currentPlayer === 'blue' ? 'blue_won' : 'red_won';
		}

		// Update the game state
		const updatedGameState = {
			...gameState,
			board: newBoard,
			currentPlayer:
				newGameStatus === 'playing'
					? currentPlayer === 'blue'
						? 'red'
						: 'blue'
					: currentPlayer,
			blueCards: newBlueCards,
			redCards: newRedCards,
			centerCard: newCenterCard,
			selectedPiece: null,
			selectedCard: null,
			validMoves: [],
			gameStatus: newGameStatus
		};

		// Update the game state in the room
		updateGameState(updatedGameState);
		setSelectedPiece(null);
	};

	// Helper function to get valid moves for a piece and card
	const getValidMoves = (piece: Piece, card: CardType) => {
		const isRedPlayer = piece.player === 'red';

		// Get all possible moves based on the card
		const possibleMoves = card.moves.map((move) => {
			// If red player, flip the moves
			const dx = isRedPlayer ? -move.dx : move.dx;
			const dy = isRedPlayer ? -move.dy : move.dy;

			return {
				x: piece.position.x + dx,
				y: piece.position.y + dy
			};
		});

		// Filter out invalid moves
		return possibleMoves.filter((position) => {
			// Check if the position is within the board
			if (
				position.x < 0 ||
				position.x >= 5 ||
				position.y < 0 ||
				position.y >= 5
			) {
				return false;
			}

			// Get the piece at the target position
			const targetPiece = board[position.y][position.x];

			// Can't move to a position occupied by own piece
			if (targetPiece && targetPiece.player === piece.player) {
				return false;
			}

			return true;
		});
	};

	// Render player's cards
	const renderPlayerCards = () => {
		const playerCards = currentPlayer === 'blue' ? blueCards : redCards;
		const canInteract = isMyTurn;

		return (
			<View style={styles.cardsContainer}>
				{playerCards.map((card) => (
					<Card
						key={card.id}
						card={card}
						isSelected={selectedCard?.id === card.id}
						onPress={
							canInteract
								? () => handleCardSelect(card)
								: undefined
						}
					/>
				))}
			</View>
		);
	};

	// Render opponent's cards
	const renderOpponentCards = () => {
		const opponentCards = currentPlayer === 'blue' ? redCards : blueCards;

		return (
			<View style={styles.cardsContainer}>
				{opponentCards.map((card) => (
					<Card key={card.id} card={card} isOpponent={true} />
				))}
			</View>
		);
	};

	// Render center card
	const renderCenterCard = () => {
		return (
			<View style={styles.centerCardContainer}>
				<Text style={styles.centerCardLabel}>Center Card</Text>
				<Card card={centerCard} />
			</View>
		);
	};

	// Render game status
	const renderGameStatus = () => {
		// Get player names
		const blueName = currentRoom.players.blue?.displayName || 'Blue';
		const redName = currentRoom.players.red?.displayName || 'Red';

		if (gameStatus !== 'playing') {
			const winner = gameStatus === 'blue_won' ? blueName : redName;
			return (
				<View style={styles.gameStatusContainer}>
					<Text style={styles.gameStatusText}>{winner} Wins!</Text>
					<TouchableOpacity
						style={styles.leaveButton}
						onPress={() => {
							leaveRoom();
							navigation.navigate('OnlineLobby');
						}}
					>
						<Text style={styles.leaveButtonText}>Leave Game</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return (
			<View style={styles.gameStatusContainer}>
				<Text style={styles.gameStatusText}>
					{currentPlayer === 'blue' ? blueName : redName}'s Turn
				</Text>
				{!isMyTurn && (
					<Text style={styles.waitingText}>
						Waiting for opponent...
					</Text>
				)}
			</View>
		);
	};

	// Render waiting for opponent message if there's only one player
	const renderWaitingForOpponent = () => {
		if (!currentRoom.players.blue || !currentRoom.players.red) {
			return (
				<View style={styles.waitingOverlay}>
					<View style={styles.waitingCard}>
						<Text style={styles.waitingTitle}>
							Waiting for Opponent
						</Text>
						<Text style={styles.waitingMessage}>
							Share this room code with a friend:
						</Text>
						<Text style={styles.roomCode}>{roomId}</Text>
						<TouchableOpacity
							style={styles.leaveButton}
							onPress={() => {
								leaveRoom();
								navigation.navigate('OnlineLobby');
							}}
						>
							<Text style={styles.leaveButtonText}>
								Leave Game
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		}

		return null;
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<View style={styles.container}>
				{renderGameStatus()}

				{renderOpponentCards()}

				<View style={styles.boardContainer}>
					<Board
						onPieceSelect={handlePieceSelect}
						onPositionSelect={handlePositionSelect}
					/>
				</View>

				{renderPlayerCards()}

				{renderCenterCard()}

				{renderWaitingForOpponent()}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1
	},
	container: {
		flex: 1,
		padding: 10,
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#f0f0f0'
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f0f0f0'
	},
	loadingText: {
		fontSize: 18,
		color: '#333'
	},
	boardContainer: {
		marginVertical: 20
	},
	cardsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		flexWrap: 'wrap',
		marginVertical: 10
	},
	centerCardContainer: {
		alignItems: 'center',
		marginVertical: 10
	},
	centerCardLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 5
	},
	gameStatusContainer: {
		padding: 10,
		borderRadius: 5,
		backgroundColor: '#333',
		marginVertical: 10,
		alignItems: 'center',
		width: '100%'
	},
	gameStatusText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff'
	},
	waitingText: {
		fontSize: 14,
		color: '#ccc',
		marginTop: 5
	},
	waitingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10
	},
	waitingCard: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 20,
		width: '80%',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5
	},
	waitingTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 15
	},
	waitingMessage: {
		fontSize: 16,
		marginBottom: 10,
		textAlign: 'center'
	},
	roomCode: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#3498db',
		marginBottom: 20,
		padding: 10,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		backgroundColor: '#f8f8f8'
	},
	leaveButton: {
		backgroundColor: '#e74c3c',
		padding: 12,
		borderRadius: 5,
		marginTop: 10
	},
	leaveButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16
	}
});

export default OnlineGameScreen;
