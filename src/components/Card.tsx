import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card as CardType, Move } from '../types';

interface CardProps {
	card: CardType;
	isSelected?: boolean;
	isOpponent?: boolean;
	onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
	card,
	isSelected = false,
	isOpponent = false,
	onPress
}) => {
	const { name, moves, color, description } = card;

	// Create a 5x5 grid to display the movement pattern
	// Center position is (2,2)
	const renderMovePattern = () => {
		const grid = Array(5)
			.fill(null)
			.map(() => Array(5).fill(false));

		// Mark the center as the starting position
		grid[2][2] = true;

		// Mark the valid moves
		moves.forEach((move) => {
			// If opponent's card, flip the moves
			const dx = isOpponent ? -move.dx : move.dx;
			const dy = isOpponent ? -move.dy : move.dy;

			// Calculate the position on the grid (center is 2,2)
			const x = 2 + dx;
			const y = 2 + dy;

			// Check if the position is within the grid
			if (x >= 0 && x < 5 && y >= 0 && y < 5) {
				grid[y][x] = true;
			}
		});

		// Render the grid
		return (
			<View style={styles.movePattern}>
				{grid.map((row, rowIndex) => (
					<View key={`row-${rowIndex}`} style={styles.moveRow}>
						{row.map((isMove, colIndex) => (
							<View
								key={`cell-${rowIndex}-${colIndex}`}
								style={[
									styles.moveCell,
									isMove && rowIndex === 2 && colIndex === 2
										? styles.startCell
										: isMove
										? styles.validMoveCell
										: null
								]}
							/>
						))}
					</View>
				))}
			</View>
		);
	};

	return (
		<TouchableOpacity
			style={[
				styles.container,
				{ backgroundColor: color },
				isSelected && styles.selected,
				isOpponent && styles.opponent
			]}
			onPress={onPress}
			disabled={isOpponent || !onPress}
		>
			<Text style={styles.name}>{name}</Text>
			{renderMovePattern()}
			<Text style={styles.description} numberOfLines={2}>
				{description}
			</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		width: 150,
		height: 200,
		borderRadius: 10,
		padding: 10,
		margin: 5,
		justifyContent: 'space-between',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#333',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 3
	},
	selected: {
		borderWidth: 3,
		borderColor: '#fff',
		shadowOpacity: 0.5,
		shadowRadius: 4,
		elevation: 5
	},
	opponent: {
		opacity: 0.7,
		transform: [{ rotate: '180deg' }]
	},
	name: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff',
		textAlign: 'center',
		textShadowColor: 'rgba(0, 0, 0, 0.5)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2
	},
	description: {
		fontSize: 12,
		color: '#fff',
		textAlign: 'center',
		textShadowColor: 'rgba(0, 0, 0, 0.5)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2
	},
	movePattern: {
		width: 100,
		height: 100,
		justifyContent: 'center',
		alignItems: 'center'
	},
	moveRow: {
		flexDirection: 'row'
	},
	moveCell: {
		width: 16,
		height: 16,
		margin: 2,
		borderRadius: 2,
		backgroundColor: 'rgba(255, 255, 255, 0.1)'
	},
	startCell: {
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		borderWidth: 1,
		borderColor: '#333'
	},
	validMoveCell: {
		backgroundColor: 'rgba(255, 255, 255, 0.6)',
		borderWidth: 1,
		borderColor: '#333'
	}
});

export default Card;
