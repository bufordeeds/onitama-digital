import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import GameScreen from '../screens/GameScreen';
import OnlineLobbyScreen from '../screens/OnlineLobbyScreen';
import OnlineGameScreen from '../screens/OnlineGameScreen';
import HowToPlayScreen from '../screens/HowToPlayScreen';

// Define the root stack parameter list
export type RootStackParamList = {
	Home: undefined;
	Game: undefined;
	OnlineLobby: undefined;
	OnlineGame: { roomId: string };
	HowToPlay: undefined;
};

// Create the stack navigator
const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName='Home'
				screenOptions={{
					headerStyle: {
						backgroundColor: '#3498db'
					},
					headerTintColor: '#fff',
					headerTitleStyle: {
						fontWeight: 'bold'
					}
				}}
			>
				<Stack.Screen
					name='Home'
					component={HomeScreen}
					options={{ title: 'Onitama' }}
				/>
				<Stack.Screen
					name='Game'
					component={GameScreen}
					options={{ title: 'Local Game' }}
				/>
				<Stack.Screen
					name='OnlineLobby'
					component={OnlineLobbyScreen}
					options={{ title: 'Online Lobby' }}
				/>
				<Stack.Screen
					name='OnlineGame'
					component={OnlineGameScreen}
					options={{ title: 'Online Game' }}
				/>
				<Stack.Screen
					name='HowToPlay'
					component={HowToPlayScreen}
					options={{ title: 'How to Play' }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default AppNavigator;
