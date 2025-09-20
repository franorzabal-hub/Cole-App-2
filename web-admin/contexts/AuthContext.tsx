'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import apolloClient, { setAuthToken, clearAuthToken, setTenantId } from '@/lib/apollo-client';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured, isUsingMockData } from '@/lib/firebase';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  firebaseUid?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  setCurrentTenant: (tenantId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  checkAuth: async () => {},
  setCurrentTenant: () => {},
});

// GraphQL Queries and Mutations
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        role
        tenantId
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    register(input: { email: $email, password: $password, firstName: $firstName, lastName: $lastName }) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        role
        tenantId
      }
    }
  }
`;

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      firstName
      lastName
      role
      tenantId
    }
  }
`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [loginMutation] = useMutation(LOGIN_MUTATION, {
    client: apolloClient,
  });

  const [registerMutation] = useMutation(REGISTER_MUTATION, {
    client: apolloClient,
  });

  const [getCurrentUser] = useLazyQuery(GET_CURRENT_USER, {
    client: apolloClient,
    fetchPolicy: 'network-only',
  });

  // Firebase auth state listener
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.log('Firebase not configured, using mock auth');
      checkAuth();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);

        // Sync with backend
        try {
          const { data } = await getCurrentUser();
          if (data?.me) {
            const userData: User = {
              ...data.me,
              firebaseUid: firebaseUser.uid,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (userData.tenantId) {
              setTenantId(userData.tenantId);
            }
          }
        } catch (error) {
          console.error('Error syncing with backend:', error);
        }
      } else {
        // User is signed out
        setUser(null);
        clearAuthToken();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [getCurrentUser]);

  // Check auth on mount (for non-Firebase scenarios)
  useEffect(() => {
    if (isFirebaseConfigured()) {
      return; // Handled by Firebase auth state listener
    }

    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, []);

  const checkAuth = async () => {
    console.log('checkAuth called');
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!token) {
        console.log('No token found, clearing user');
        setUser(null);
        setLoading(false);
        return;
      }

      // If we have a saved user, use it immediately for better UX
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Setting user from localStorage:', parsedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('Error parsing saved user:', e);
          clearAuthToken();
          localStorage.removeItem('user');
          setUser(null);
          setLoading(false);
          return;
        }
      }

      // Verify with the server
      try {
        const { data } = await getCurrentUser();
        console.log('Server verification response:', data);

        if (data?.me) {
          setUser(data.me);
          localStorage.setItem('user', JSON.stringify(data.me));
          if (data.me.tenantId) {
            setTenantId(data.me.tenantId);
          }
        } else if (!savedUser) {
          // Only clear if we don't have a saved user
          console.log('No user from server and no saved user, clearing');
          clearAuthToken();
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (verifyError) {
        // If server verification fails but we have a saved user, keep using it
        console.log('Server verification failed, but keeping saved user');
      }
    } catch (error) {
      console.error('Error in checkAuth:', error);
      setError('Authentication check failed');
      clearAuthToken();
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      console.log('checkAuth finished, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting login with:', { email });

      if (isFirebaseConfigured() && !isUsingMockData()) {
        // Use Firebase authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        setAuthToken(token);

        // Then sync with backend
        const { data } = await loginMutation({
          variables: { email, password },
        });

        if (data?.login) {
          const userData: User = {
            ...data.login.user,
            firebaseUid: userCredential.user.uid,
          };

          localStorage.setItem('user', JSON.stringify(userData));
          if (userData.tenantId) {
            setTenantId(userData.tenantId);
          }

          setUser(userData);
          await apolloClient.resetStore();

          console.log('Login successful, user set:', userData);
        }
      } else {
        // Use GraphQL-only authentication (development/mock mode)
        const { data } = await loginMutation({
          variables: { email, password },
        });

        console.log('Login response:', data);

        if (data?.login) {
          setAuthToken(data.login.accessToken);
          localStorage.setItem('user', JSON.stringify(data.login.user));

          if (data.login.user.tenantId) {
            setTenantId(data.login.user.tenantId);
          }

          setUser(data.login.user);
          await apolloClient.resetStore();

          console.log('Login successful, user set:', data.login.user);
        } else {
          throw new Error('Invalid response from server');
        }
      }
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });

      const errorMessage = error.graphQLErrors?.[0]?.message ||
                          error.message ||
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting registration for:', { email, firstName, lastName });

      if (isFirebaseConfigured() && !isUsingMockData()) {
        // Create Firebase user first
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        setAuthToken(token);

        // Then create backend user
        const { data } = await registerMutation({
          variables: { email, password, firstName, lastName },
        });

        if (data?.register) {
          const userData: User = {
            ...data.register.user,
            firebaseUid: userCredential.user.uid,
          };

          localStorage.setItem('user', JSON.stringify(userData));
          if (userData.tenantId) {
            setTenantId(userData.tenantId);
          }

          setUser(userData);
          await apolloClient.resetStore();

          console.log('Registration successful, user set:', userData);
        }
      } else {
        // GraphQL-only registration (development/mock mode)
        const { data } = await registerMutation({
          variables: { email, password, firstName, lastName },
        });

        if (data?.register) {
          setAuthToken(data.register.accessToken);
          localStorage.setItem('user', JSON.stringify(data.register.user));

          if (data.register.user.tenantId) {
            setTenantId(data.register.user.tenantId);
          }

          setUser(data.register.user);
          await apolloClient.resetStore();

          console.log('Registration successful, user set:', data.register.user);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      const errorMessage = error.graphQLErrors?.[0]?.message ||
                          error.message ||
                          'Registration failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase if configured
      if (isFirebaseConfigured() && !isUsingMockData()) {
        await firebaseSignOut(auth);
      }

      // Clear local storage
      clearAuthToken();
      localStorage.removeItem('user');

      // Clear user state
      setUser(null);
      setError(null);

      // Clear Apollo cache
      await apolloClient.clearStore();

      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    setLoading(true);

    try {
      if (isFirebaseConfigured() && !isUsingMockData()) {
        await firebaseSendPasswordResetEmail(auth, email);
        console.log('Password reset email sent to:', email);
      } else {
        // Mock implementation for development
        console.log('Mock: Password reset email would be sent to:', email);
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      const errorMessage = error.message || 'Failed to send password reset email';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setCurrentTenant = (tenantId: string) => {
    if (user) {
      const updatedUser = { ...user, tenantId };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTenantId(tenantId);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        checkAuth,
        setCurrentTenant
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};