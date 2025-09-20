import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/screens/auth/LoginScreen';
import { apiClient } from '@/services/api';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-secure-store');
jest.mock('@/services/api');
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
}));

jest.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

describe('Mobile Auth Flow Integration', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'STUDENT',
    schoolId: 'school_123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Login Flow', () => {
    it('should complete login flow successfully', async () => {
      const mockLoginResponse = {
        success: true,
        data: {
          token: 'jwt-token',
          user: mockUser,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockLoginResponse);

      const TestComponent = () => {
        const { user, login, loading } = useAuth();

        const handleLogin = async () => {
          await login('test@example.com', 'password123');
        };

        return (
          <>
            <Text testID="loading">{loading.toString()}</Text>
            <Text testID="user-email">{user?.email || 'Not logged in'}</Text>
            <Button title="Login" onPress={handleLogin} testID="login-button" />
          </>
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </NavigationContainer>
      );

      // Initial state
      expect(getByTestId('user-email').props.children).toBe('Not logged in');

      // Perform login
      fireEvent.press(getByTestId('login-button'));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Verify token stored securely
      await waitFor(() => {
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'jwt-token');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'user',
          JSON.stringify(mockUser)
        );
      });
    });

    it('should handle login errors', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      const TestComponent = () => {
        const { login, error } = useAuth();
        const [loginError, setLoginError] = React.useState<string | null>(null);

        const handleLogin = async () => {
          try {
            await login('wrong@example.com', 'wrongpassword');
          } catch (err: any) {
            setLoginError(err.message);
          }
        };

        return (
          <>
            <Text testID="error">{loginError || error || 'No error'}</Text>
            <Button title="Login" onPress={handleLogin} testID="login-button" />
          </>
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </NavigationContainer>
      );

      fireEvent.press(getByTestId('login-button'));

      await waitFor(() => {
        expect(getByTestId('error').props.children).toBe('Invalid credentials');
      });

      // Verify no token stored on error
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should show loading state during login', async () => {
      let resolveLogin: any;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      (apiClient.post as jest.Mock).mockReturnValue(loginPromise);

      const TestComponent = () => {
        const { login, loading } = useAuth();
        const [isLoggingIn, setIsLoggingIn] = React.useState(false);

        const handleLogin = async () => {
          setIsLoggingIn(true);
          await login('test@example.com', 'password123');
          setIsLoggingIn(false);
        };

        return (
          <>
            <Text testID="loading">{isLoggingIn.toString()}</Text>
            <Button
              title="Login"
              onPress={handleLogin}
              testID="login-button"
              disabled={isLoggingIn}
            />
          </>
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </NavigationContainer>
      );

      fireEvent.press(getByTestId('login-button'));

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('true');
      });

      // Resolve the login
      resolveLogin({
        success: true,
        data: { token: 'jwt-token', user: mockUser },
      });

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });
    });
  });

  describe('Session Persistence', () => {
    it('should restore session from storage on app launch', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('existing-token');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockUser)
      );

      const TestComponent = () => {
        const { user, loading } = useAuth();

        if (loading) {
          return <Text testID="loading">Loading...</Text>;
        }

        return (
          <Text testID="user-email">{user?.email || 'Not logged in'}</Text>
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByTestId('user-email').props.children).toBe(mockUser.email);
      });
    });

    it('should clear session when token is invalid', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('invalid-token');
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error('Unauthorized')
      );

      const TestComponent = () => {
        const { user, checkAuth } = useAuth();

        React.useEffect(() => {
          checkAuth();
        }, []);

        return (
          <Text testID="user-email">{user?.email || 'Not logged in'}</Text>
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      });

      expect(getByTestId('user-email').props.children).toBe('Not logged in');
    });
  });

  describe('Logout Flow', () => {
    it('should complete logout and clear storage', async () => {
      // Set initial logged-in state
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('jwt-token');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockUser)
      );

      const TestComponent = () => {
        const { user, logout } = useAuth();

        return (
          <>
            <Text testID="user-email">{user?.email || 'Not logged in'}</Text>
            <Button title="Logout" onPress={logout} testID="logout-button" />
          </>
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </NavigationContainer>
      );

      // Wait for initial auth check
      await waitFor(() => {
        expect(getByTestId('user-email').props.children).toBe(mockUser.email);
      });

      // Perform logout
      fireEvent.press(getByTestId('logout-button'));

      await waitFor(() => {
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      });

      expect(getByTestId('user-email').props.children).toBe('Not logged in');
    });
  });

  describe('Registration Flow', () => {
    it('should complete registration successfully', async () => {
      const mockRegisterResponse = {
        success: true,
        data: {
          token: 'new-jwt-token',
          user: {
            ...mockUser,
            email: 'newuser@example.com',
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockRegisterResponse);

      const TestComponent = () => {
        const { user, register } = useAuth();

        const handleRegister = async () => {
          await register(
            'newuser@example.com',
            'password123',
            'New',
            'User'
          );
        };

        return (
          <>
            <Text testID="user-email">{user?.email || 'Not registered'}</Text>
            <Button
              title="Register"
              onPress={handleRegister}
              testID="register-button"
            />
          </>
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </NavigationContainer>
      );

      fireEvent.press(getByTestId('register-button'));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
        });
      });

      await waitFor(() => {
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
          'token',
          'new-jwt-token'
        );
        expect(getByTestId('user-email').props.children).toBe(
          'newuser@example.com'
        );
      });
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token when expired', async () => {
      const mockRefreshResponse = {
        success: true,
        data: {
          token: 'new-jwt-token',
          user: mockUser,
        },
      };

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('expired-token')
        .mockResolvedValueOnce('refresh-token');

      (apiClient.post as jest.Mock).mockResolvedValue(mockRefreshResponse);

      const TestComponent = () => {
        const { refreshToken } = useAuth();

        return (
          <Button
            title="Refresh"
            onPress={refreshToken}
            testID="refresh-button"
          />
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </NavigationContainer>
      );

      fireEvent.press(getByTestId('refresh-button'));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
          refreshToken: 'refresh-token',
        });
      });

      await waitFor(() => {
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
          'token',
          'new-jwt-token'
        );
      });
    });
  });

  describe('Deep Linking Authentication', () => {
    it('should handle authentication from deep link', async () => {
      const mockDeepLinkToken = 'deep-link-token';
      const mockDeepLinkUser = {
        ...mockUser,
        email: 'deeplink@example.com',
      };

      const TestComponent = () => {
        const { handleDeepLink } = useAuth();

        const processDeepLink = () => {
          handleDeepLink({
            token: mockDeepLinkToken,
            user: mockDeepLinkUser,
          });
        };

        return (
          <Button
            title="Process Deep Link"
            onPress={processDeepLink}
            testID="deeplink-button"
          />
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </NavigationContainer>
      );

      fireEvent.press(getByTestId('deeplink-button'));

      await waitFor(() => {
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
          'token',
          mockDeepLinkToken
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'user',
          JSON.stringify(mockDeepLinkUser)
        );
      });
    });
  });
});