import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider } from './src/context/GameContext';
import { OnlineProvider } from './src/context/OnlineContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
	return (
		<SafeAreaProvider>
			<GameProvider>
				<OnlineProvider>
					<AppNavigator />
					<StatusBar style='auto' />
				</OnlineProvider>
			</GameProvider>
		</SafeAreaProvider>
	);
}
