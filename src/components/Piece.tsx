import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Piece as PieceType } from '../types';

interface PieceProps {
	piece: PieceType;
	size?: number;
}

const Piece: React.FC<PieceProps> = ({ piece, size = 40 }) => {
	const { player, type } = piece;

	// Determine the color based on the player
	const backgroundColor = player === 'blue' ? '#3498db' : '#e74c3c';

	// Determine the symbol based on the piece type
	const symbol = type === 'master' ? '👑' : '⚔️';

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor,
					width: size,
					height: size,
					borderRadius: size / 2
				}
			]}
		>
			<Text style={styles.symbol}>{symbol}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#333',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 3
	},
	symbol: {
		fontSize: 18,
		color: '#fff'
	}
});

export default Piece;
