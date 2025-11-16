import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  firstName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = '@local_user';
const USERS_DB_KEY = '@users_db';

export const LocalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string) => {
    try {
      // Get existing users
      const usersData = await AsyncStorage.getItem(USERS_DB_KEY);
      const users = usersData ? JSON.parse(usersData) : {};

      // Check if user exists
      if (users[email]) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        firstName,
      };

      // Save to users DB
      users[email] = { ...newUser, password };
      await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

      // Set as current user
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } catch (error: any) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Get existing users
      const usersData = await AsyncStorage.getItem(USERS_DB_KEY);
      const users = usersData ? JSON.parse(usersData) : {};

      // Check credentials
      const userData = users[email];
      if (!userData || userData.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Set as current user
      const { password: _, ...userWithoutPassword } = userData;
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within LocalAuthProvider');
  }
  return context;
};

// Export helper function to get token (for API interceptor)
export const getToken = async (): Promise<string | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      // For local auth, we'll use the user ID as a simple token
      // In production, this would be a real JWT token
      return user.id;
    }
    return null;
  } catch (error) {
    return null;
  }
};
