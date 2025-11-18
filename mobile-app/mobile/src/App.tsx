import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './types';
import { EnhancedRankingScreen } from './screens/EnhancedRankingScreen';
import { EnhancedDetailScreen } from './screens/EnhancedDetailScreen';
import { SearchScreen } from './screens/SearchScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { lightTheme } from './constants/theme';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';

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
      <SupabaseAuthProvider>
        <PaperProvider theme={lightTheme}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName="Ranking"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Ranking" component={EnhancedRankingScreen} />
              <Stack.Screen name="Detail" component={EnhancedDetailScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
              <Stack.Screen name="UserProfile" component={UserProfileScreen} />
              <Stack.Screen name="Achievements" component={AchievementsScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}
