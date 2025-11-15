import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './types';
import { RankingScreen } from './screens/RankingScreen';
import { DetailScreen } from './screens/DetailScreen';
import { SearchScreen } from './screens/SearchScreen';
import { lightTheme } from './constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={lightTheme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Ranking"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Ranking" component={RankingScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </QueryClientProvider>
  );
}
