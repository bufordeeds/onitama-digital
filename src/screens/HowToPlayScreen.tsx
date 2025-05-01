import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Image,
	Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HowToPlayScreenNavigationProp = StackNavigationProp<
	RootStackParamList,
	'HowToPlay'
>;

// Tutorial steps
const tutorialSteps = [
	{
		id: 'intro',
		title: 'Introduction',
		content: `Onitama is a two-player abstract strategy game inspired by martial arts.

Each player controls a Master and four Students, using movement cards to outmaneuver their opponent.

The game combines chess-like strategy with unique card-based movement mechanics.`
	},
	{
		id: 'setup',
		title: 'Game Setup',
		content: `The game is played on a 5×5 board.

Each player starts with:
• 1 Master piece (in the center of their back row)
• 4 Student pieces (in the remaining positions of their back row)

Blue player starts at the bottom, Red player at the top.

Each player receives 2 movement cards, and a 5th card is placed in the center.`
	},
	{
		id: 'pieces',
		title: 'Pieces & Board',
		content: `Master: Your most important piece. If captured, you lose the game.

Students: Supporting pieces that can capture opponent pieces.

Temple: The starting position of each Master is their Temple. If you move your Master to your opponent's Temple, you win the game.

All pieces move according to the patterns shown on your movement cards.`
	},
	{
		id: 'cards',
		title: 'Movement Cards',
		content: `Each card shows a pattern of possible moves relative to your piece's position.

Blue player's moves are exactly as shown on the cards.

Red player's moves are flipped (multiplied by -1) to account for their perspective from the opposite side of the board.

After using a card to move, it's swapped with the center card.`
	},
	{
		id: 'turns',
		title: 'Taking Turns',
		content: `On your turn:

1. Select one of your pieces
2. Choose one of your two movement cards
3. Move your piece according to the pattern on the card
4. The card you used is swapped with the center card

You must make a move on your turn if possible.`
	},
	{
		id: 'capture',
		title: 'Capturing Pieces',
		content: `You can capture an opponent's piece by moving onto its square.

The captured piece is removed from the board.

If you capture your opponent's Master, you win the game immediately.`
	},
	{
		id: 'winning',
		title: 'Winning the Game',
		content: `There are two ways to win:

1. Way of the Stone: Capture your opponent's Master
2. Way of the Stream: Move your Master to your opponent's Temple (the starting position of their Master)

The game ends immediately when either condition is met.`
	},
	{
		id: 'strategy',
		title: 'Strategy Tips',
		content: `• Pay attention to both your cards and your opponent's cards
• Plan your moves to set up future opportunities
• Remember that cards rotate after use, giving your opponent access to your moves
• Balance offense and defense - protect your Master while creating threats
• Control the center of the board for more mobility
• Sometimes threatening your opponent's Temple can force them to play defensively`
	}
];

const HowToPlayScreen: React.FC = () => {
	const navigation = useNavigation<HowToPlayScreenNavigationProp>();
	const [currentStep, setCurrentStep] = useState(0);
	const windowWidth = Dimensions.get('window').width;

	const goToNextStep = () => {
		if (currentStep < tutorialSteps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const goToPrevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const renderProgressDots = () => {
		return (
			<View style={styles.progressContainer}>
				{tutorialSteps.map((_, index) => (
					<TouchableOpacity
						key={index}
						style={[
							styles.progressDot,
							currentStep === index && styles.activeDot
						]}
						onPress={() => setCurrentStep(index)}
					/>
				))}
			</View>
		);
	};

	const renderCardExample = () => {
		if (currentStep === 3) {
			// Only show card example in the Cards step
			return (
				<View style={styles.exampleContainer}>
					<View style={styles.cardExample}>
						<View style={styles.cardGrid}>
							{/* 3x3 grid to show movement pattern */}
							{Array(9)
								.fill(null)
								.map((_, index) => {
									const row = Math.floor(index / 3);
									const col = index % 3;
									const isCenterPiece =
										row === 1 && col === 1;
									const isMoveTile =
										(row === 0 && col === 1) || // top
										(row === 2 && col === 1); // bottom

									return (
										<View
											key={index}
											style={[
												styles.cardCell,
												isCenterPiece &&
													styles.centerPiece,
												isMoveTile && styles.moveTile
											]}
										>
											{isCenterPiece && (
												<View style={styles.piece} />
											)}
											{isMoveTile && (
												<View
													style={styles.moveIndicator}
												/>
											)}
										</View>
									);
								})}
						</View>
						<Text style={styles.cardName}>Tiger</Text>
					</View>
					<Text style={styles.exampleCaption}>
						Example: The Tiger card allows movement 2 spaces forward
						or 1 space backward
					</Text>
				</View>
			);
		}
		return null;
	};

	const renderWinExample = () => {
		if (currentStep === 6) {
			// Only show win condition examples in the Winning step
			return (
				<View style={styles.exampleContainer}>
					<View style={styles.winExample}>
						<Text style={styles.exampleTitle}>
							Way of the Stone
						</Text>
						<View style={styles.boardMiniExample}>
							{/* Simplified board showing master capture */}
							<View style={styles.miniPiece} />
							<View
								style={[
									styles.miniPiece,
									styles.captureIndicator
								]}
							/>
						</View>
						<Text style={styles.exampleCaption}>
							Capture your opponent's Master
						</Text>
					</View>

					<View style={styles.winExample}>
						<Text style={styles.exampleTitle}>
							Way of the Stream
						</Text>
						<View style={styles.boardMiniExample}>
							{/* Simplified board showing temple win */}
							<View
								style={[
									styles.miniPiece,
									styles.templeIndicator
								]}
							/>
							<View style={styles.miniPiece} />
						</View>
						<Text style={styles.exampleCaption}>
							Move your Master to opponent's Temple
						</Text>
					</View>
				</View>
			);
		}
		return null;
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>How to Play</Text>
				<Text style={styles.stepTitle}>
					{tutorialSteps[currentStep].title}
				</Text>
			</View>

			<ScrollView
				style={styles.contentContainer}
				contentContainerStyle={styles.scrollContent}
			>
				<Text style={styles.contentText}>
					{tutorialSteps[currentStep].content}
				</Text>

				{renderCardExample()}
				{renderWinExample()}
			</ScrollView>

			{renderProgressDots()}

			<View style={styles.navigationContainer}>
				<TouchableOpacity
					style={[
						styles.navButton,
						currentStep === 0 && styles.disabledButton
					]}
					onPress={goToPrevStep}
					disabled={currentStep === 0}
				>
					<Text style={styles.navButtonText}>Previous</Text>
				</TouchableOpacity>

				{currentStep < tutorialSteps.length - 1 ? (
					<TouchableOpacity
						style={styles.navButton}
						onPress={goToNextStep}
					>
						<Text style={styles.navButtonText}>Next</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						style={styles.navButton}
						onPress={() => navigation.goBack()}
					>
						<Text style={styles.navButtonText}>Done</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0'
	},
	header: {
		padding: 20,
		backgroundColor: '#3498db',
		alignItems: 'center'
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 5
	},
	stepTitle: {
		fontSize: 18,
		color: '#fff'
	},
	contentContainer: {
		flex: 1,
		padding: 20
	},
	scrollContent: {
		paddingBottom: 20
	},
	contentText: {
		fontSize: 16,
		lineHeight: 24,
		color: '#333'
	},
	progressContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 10
	},
	progressDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#ccc',
		marginHorizontal: 5
	},
	activeDot: {
		backgroundColor: '#3498db',
		width: 12,
		height: 12
	},
	navigationContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 20,
		borderTopWidth: 1,
		borderTopColor: '#ddd'
	},
	navButton: {
		backgroundColor: '#3498db',
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 5,
		minWidth: 100,
		alignItems: 'center'
	},
	disabledButton: {
		backgroundColor: '#95a5a6'
	},
	navButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16
	},
	exampleContainer: {
		marginTop: 20,
		alignItems: 'center'
	},
	cardExample: {
		width: 150,
		height: 200,
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 15,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 3
	},
	cardGrid: {
		width: 120,
		height: 120,
		flexDirection: 'row',
		flexWrap: 'wrap'
	},
	cardCell: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#eee'
	},
	centerPiece: {
		backgroundColor: '#f0f0f0'
	},
	moveTile: {
		backgroundColor: '#e3f2fd'
	},
	piece: {
		width: 25,
		height: 25,
		borderRadius: 12.5,
		backgroundColor: '#3498db'
	},
	moveIndicator: {
		width: 15,
		height: 15,
		borderRadius: 7.5,
		backgroundColor: '#3498db',
		opacity: 0.5
	},
	cardName: {
		marginTop: 10,
		fontSize: 16,
		fontWeight: 'bold'
	},
	exampleCaption: {
		marginTop: 10,
		fontSize: 14,
		textAlign: 'center',
		color: '#666',
		paddingHorizontal: 20
	},
	winExample: {
		width: 200,
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 15,
		alignItems: 'center',
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 3
	},
	exampleTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 10
	},
	boardMiniExample: {
		width: 150,
		height: 100,
		backgroundColor: '#f5f5f5',
		borderRadius: 5,
		justifyContent: 'space-around',
		alignItems: 'center',
		flexDirection: 'row'
	},
	miniPiece: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: '#3498db'
	},
	captureIndicator: {
		backgroundColor: '#e74c3c',
		borderWidth: 2,
		borderColor: '#c0392b'
	},
	templeIndicator: {
		borderWidth: 2,
		borderColor: '#f39c12',
		backgroundColor: '#3498db'
	}
});

export default HowToPlayScreen;
