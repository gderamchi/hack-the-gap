import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './types';
import { CleanSimpleScreen } from './screens/CleanSimpleScreen';
import { CleanDetailScreen } from './screens/CleanDetailScreen';
import { SearchScreen } from './screens/SearchScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { lightTheme } from './constants/theme';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';

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
      <SimpleAuthProvider>
        <PaperProvider theme={lightTheme}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName="Ranking"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Ranking" component={CleanSimpleScreen} />
              <Stack.Screen name="Detail" component={CleanDetailScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}
