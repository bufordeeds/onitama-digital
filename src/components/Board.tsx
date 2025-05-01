import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useGame, isValidMovePosition } from '../context/GameContext';
import { BOARD_SIZE } from '../logic/gameState';
import { Piece as PieceType, Position } from '../types';
import Piece from './Piece';

interface BoardProps {
	onPieceSelect?: (piece: PieceType) => void;
	onPositionSelect?: (position: Position) => void;
}

const Board: React.FC<BoardProps> = ({ onPieceSelect, onPositionSelect }) => {
	const { gameState, movePieceToPosition } = useGame();
	const { board, validMoves } = gameState;

	// Create a 2D array of positions for the board
	const positions: Position[][] = Array(BOARD_SIZE)
		.fill(null)
		.map((_, y) =>
			Array(BOARD_SIZE)
				.fill(null)
				.map((_, x) => ({ x, y }))
		);

	// Handle cell press
	const handleCellPress = (position: Position) => {
		const piece = board[position.y][position.x];

		// If there's a piece at this position, select it
		if (piece) {
			onPieceSelect?.(piece);
			return;
		}

		// If this is a valid move position, move the selected piece
		if (isValidMovePosition(gameState, position)) {
			movePieceToPosition(position);
			onPositionSelect?.(position);
			return;
		}
	};

	// Determine if a position is a temple
	const isTemple = (position: Position): boolean => {
		return (
			(position.x === 2 && position.y === 0) || // Red temple
			(position.x === 2 && position.y === 4) // Blue temple
		);
	};

	// Determine the color of a cell
	const getCellColor = (position: Position): string => {
		// Temple cells
		if (isTemple(position)) {
			return position.y === 0 ? '#ffcccc' : '#ccccff'; // Red or Blue temple
		}

		// Valid move highlight
		if (isValidMovePosition(gameState, position)) {
			return '#aaffaa'; // Green highlight for valid moves
		}

		// Checkerboard pattern
		return (position.x + position.y) % 2 === 0 ? '#e8e8e8' : '#d0d0d0';
	};

	return (
		<View style={styles.container}>
			{positions.map((row, y) => (
				<View key={`row-${y}`} style={styles.row}>
					{row.map((position, x) => {
						const piece = board[y][x];
						return (
							<TouchableOpacity
								key={`cell-${x}-${y}`}
								style={[
									styles.cell,
									{ backgroundColor: getCellColor(position) }
								]}
								onPress={() => handleCellPress(position)}
							>
								{isTemple(position) && (
									<Text style={styles.templeText}>
										{y === 0 ? '🏮' : '🏯'}
									</Text>
								)}
								{piece && <Piece piece={piece} />}
							</TouchableOpacity>
						);
					})}
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderWidth: 2,
		borderColor: '#333',
		backgroundColor: '#f0f0f0'
	},
	row: {
		flexDirection: 'row'
	},
	cell: {
		width: 60,
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#999'
	},
	templeText: {
		position: 'absolute',
		fontSize: 20,
		opacity: 0.5
	}
});

export default Board;
