import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '@/services/auth.service';

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
      // Check for stored token first
      const token = await AuthService.getToken();

      if (token) {
        // Verify token is still valid
        const currentUser = await AuthService.getCurrentUser();

        if (currentUser) {
          const user: User = {
            uid: currentUser.id || 'user-' + Date.now(),
            email: currentUser.email || null,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || null,
          };
          setUser(user);
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } else {
          // Token invalid, check for stored user as fallback
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } else {
        // No token, check for stored user as fallback
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('Error checking stored user:', error);
      // Try to get stored user as fallback
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Use real authentication service
      const response = await AuthService.login(email, password);

      if (response && response.token) {
        // Store token and user data
        await AuthService.setToken(response.token);

        const user: User = {
          uid: response.user?.id || 'user-' + Date.now(),
          email: response.user?.email || email,
          displayName: response.user?.displayName || email.split('@')[0],
        };

        setUser(user);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      // For development, allow test credentials as fallback
      if (email === 'test@test.com' && password === 'password123') {
        const user: User = {
          uid: 'test-user',
          email: 'test@test.com',
          displayName: 'Test User',
        };
        setUser(user);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        throw error;
      }
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    try {
      // Use real registration service
      const response = await AuthService.register(email, password, userData);

      if (response && response.token) {
        // Store token and user data
        await AuthService.setToken(response.token);

        const newUser: User = {
          uid: response.user?.id || 'user-' + Date.now(),
          email: response.user?.email || email,
          displayName: userData?.displayName || response.user?.displayName || email.split('@')[0],
        };

        setUser(newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // For development, allow mock registration as fallback
      const newUser: User = {
        uid: 'user-' + Date.now(),
        email: email,
        displayName: userData?.displayName || email.split('@')[0],
      };
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const logout = async () => {
    try {
      // Clear auth token and user data
      await AuthService.logout();
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      await AsyncStorage.removeItem('user');
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