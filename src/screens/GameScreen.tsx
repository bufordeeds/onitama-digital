import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView
} from 'react-native';
import {
	useGame,
	getCurrentPlayerCards,
	getPlayerColorName
} from '../context/GameContext';
import Board from '../components/Board';
import Card from '../components/Card';
import { Piece, Card as CardType } from '../types';

const GameScreen: React.FC = () => {
	const { gameState, winResult, selectPieceAndCard, startNewGame } =
		useGame();
	const { currentPlayer, blueCards, redCards, centerCard, selectedCard } =
		gameState;

	// Local state for the selected piece
	const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

	// Handle piece selection
	const handlePieceSelect = (piece: Piece) => {
		// Only allow selecting pieces of the current player
		if (piece.player === currentPlayer) {
			setSelectedPiece(piece);
		}
	};

	// Handle card selection
	const handleCardSelect = (card: CardType) => {
		if (selectedPiece) {
			selectPieceAndCard(selectedPiece, card);
		}
	};

	// Render player's cards
	const renderPlayerCards = () => {
		const playerCards = currentPlayer === 'blue' ? blueCards : redCards;

		return (
			<View style={styles.cardsContainer}>
				{playerCards.map((card) => (
					<Card
						key={card.id}
						card={card}
						isSelected={selectedCard?.id === card.id}
						onPress={() => handleCardSelect(card)}
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
		if (winResult.isWin) {
			const winner = winResult.winner === 'blue' ? 'Blue' : 'Red';
			return (
				<View style={styles.gameStatusContainer}>
					<Text style={styles.gameStatusText}>
						{winner} Player Wins!
					</Text>
					<TouchableOpacity
						style={styles.newGameButton}
						onPress={startNewGame}
					>
						<Text style={styles.newGameButtonText}>New Game</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return (
			<View style={styles.gameStatusContainer}>
				<Text style={styles.gameStatusText}>
					{getPlayerColorName(currentPlayer)}'s Turn
				</Text>
			</View>
		);
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<View style={styles.container}>
				{renderGameStatus()}

				{renderOpponentCards()}

				<View style={styles.boardContainer}>
					<Board onPieceSelect={handlePieceSelect} />
				</View>

				{renderPlayerCards()}

				{renderCenterCard()}
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
		alignItems: 'center'
	},
	gameStatusText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff'
	},
	newGameButton: {
		marginTop: 10,
		padding: 10,
		backgroundColor: '#4CAF50',
		borderRadius: 5
	},
	newGameButtonText: {
		color: '#fff',
		fontWeight: 'bold'
	}
});

export default GameScreen;
