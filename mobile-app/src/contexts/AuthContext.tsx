import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockAuthCredentials } from '@/data/mockData';

interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app start
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Mock authentication - check against mock credentials
      if (email === mockAuthCredentials.email && password === mockAuthCredentials.password) {
        const user = mockAuthCredentials.user;
        setUser(user);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        throw new Error('Invalid credentials. Use test@test.com / password123');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    try {
      // Mock registration - create a new user
      const newUser: User = {
        uid: 'user-' + Date.now(),
        email: email,
        displayName: userData?.displayName || email.split('@')[0],
      };
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (profile: any) => {
    // TODO: Implement profile update
    // TODO: Implement actual profile update logic
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}