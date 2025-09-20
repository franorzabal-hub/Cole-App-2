import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import * as firebaseAuth from 'firebase/auth';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
  isFirebaseConfigured: jest.fn(() => true),
  isUsingMockData: jest.fn(() => false),
}));

jest.mock('@/lib/apollo-client', () => ({
  __esModule: true,
  default: {
    resetStore: jest.fn(() => Promise.resolve()),
    clearStore: jest.fn(() => Promise.resolve()),
  },
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
  setTenantId: jest.fn(),
}));

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

describe('AuthContext', () => {
  const mockPush = jest.fn();
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
    tenantId: 'tenant_123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    // Clear localStorage
    localStorage.clear();

    // Reset Firebase auth mock
    (firebaseAuth.onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null); // Start with no user
      return jest.fn(); // Return unsubscribe function
    });
  });

  describe('AuthProvider', () => {
    it('should render children', () => {
      const mocks: any[] = [];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <div>Test Child</div>
          </AuthProvider>
        </MockedProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should initialize with loading state', () => {
      const TestComponent = () => {
        const { loading } = useAuth();
        return <div>{loading ? 'Loading' : 'Not Loading'}</div>;
      };

      const mocks: any[] = [];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      expect(screen.getByText('Loading')).toBeInTheDocument();
    });
  });

  describe('Login', () => {
    it('should login user successfully with GraphQL', async () => {
      const firebase = require('@/lib/firebase');
      firebase.isFirebaseConfigured.mockReturnValue(false);

      const mocks = [
        {
          request: {
            query: LOGIN_MUTATION,
            variables: {
              email: 'test@example.com',
              password: 'password123',
            },
          },
          result: {
            data: {
              login: {
                accessToken: 'jwt-token',
                user: mockUser,
              },
            },
          },
        },
      ];

      const TestComponent = () => {
        const { login, user, loading, error } = useAuth();

        React.useEffect(() => {
          if (!loading) {
            login('test@example.com', 'password123');
          }
        }, [loading]);

        return (
          <div>
            {user && <div>Logged in as: {user.email}</div>}
            {error && <div>Error: {error}</div>}
          </div>
        );
      };

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Logged in as: test@example.com')).toBeInTheDocument();
      });

      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('should login with Firebase when configured', async () => {
      const firebase = require('@/lib/firebase');
      firebase.isFirebaseConfigured.mockReturnValue(true);
      firebase.isUsingMockData.mockReturnValue(false);

      const mockFirebaseUser = {
        uid: 'firebase-123',
        getIdToken: jest.fn(() => Promise.resolve('firebase-token')),
      };

      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockFirebaseUser,
      });

      const mocks = [
        {
          request: {
            query: LOGIN_MUTATION,
            variables: {
              email: 'test@example.com',
              password: 'password123',
            },
          },
          result: {
            data: {
              login: {
                accessToken: 'jwt-token',
                user: mockUser,
              },
            },
          },
        },
      ];

      const TestComponent = () => {
        const { login, user, loading } = useAuth();

        React.useEffect(() => {
          if (!loading) {
            login('test@example.com', 'password123');
          }
        }, [loading]);

        return <div>{user && <div>Logged in as: {user.email}</div>}</div>;
      };

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
          firebase.auth,
          'test@example.com',
          'password123'
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Logged in as: test@example.com')).toBeInTheDocument();
      });
    });

    it('should handle login error', async () => {
      const firebase = require('@/lib/firebase');
      firebase.isFirebaseConfigured.mockReturnValue(false);

      const mocks = [
        {
          request: {
            query: LOGIN_MUTATION,
            variables: {
              email: 'test@example.com',
              password: 'wrong-password',
            },
          },
          error: new Error('Invalid credentials'),
        },
      ];

      const TestComponent = () => {
        const { login, error, loading } = useAuth();
        const [loginError, setLoginError] = React.useState<string | null>(null);

        const handleLogin = async () => {
          try {
            await login('test@example.com', 'wrong-password');
          } catch (err: any) {
            setLoginError(err.message);
          }
        };

        React.useEffect(() => {
          if (!loading) {
            handleLogin();
          }
        }, [loading]);

        return (
          <div>
            {loginError && <div>Login Error: {loginError}</div>}
            {error && <div>Context Error: {error}</div>}
          </div>
        );
      };

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Login Error: Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Logout', () => {
    it('should logout user and redirect', async () => {
      const apolloClient = require('@/lib/apollo-client');
      const firebase = require('@/lib/firebase');
      firebase.isFirebaseConfigured.mockReturnValue(false);

      // Set initial user
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'jwt-token');

      const TestComponent = () => {
        const { logout, loading } = useAuth();

        React.useEffect(() => {
          if (!loading) {
            logout();
          }
        }, [loading]);

        return <div>Logging out...</div>;
      };

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(apolloClient.clearAuthToken).toHaveBeenCalled();
        expect(apolloClient.default.clearStore).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/login');
      });

      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should sign out from Firebase when configured', async () => {
      const firebase = require('@/lib/firebase');
      firebase.isFirebaseConfigured.mockReturnValue(true);
      firebase.isUsingMockData.mockReturnValue(false);

      const TestComponent = () => {
        const { logout, loading } = useAuth();

        React.useEffect(() => {
          if (!loading) {
            logout();
          }
        }, [loading]);

        return <div>Logging out...</div>;
      };

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(firebaseAuth.signOut).toHaveBeenCalledWith(firebase.auth);
      });
    });
  });

  describe('Check Auth', () => {
    it('should restore user from localStorage', async () => {
      const firebase = require('@/lib/firebase');
      firebase.isFirebaseConfigured.mockReturnValue(false);

      // Set user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'jwt-token');

      const mocks = [
        {
          request: {
            query: GET_CURRENT_USER,
          },
          result: {
            data: {
              me: mockUser,
            },
          },
        },
      ];

      const TestComponent = () => {
        const { user, checkAuth, loading } = useAuth();

        React.useEffect(() => {
          if (!loading) {
            checkAuth();
          }
        }, [loading]);

        return <div>{user && <div>User: {user.email}</div>}</div>;
      };

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
      });
    });

    it('should clear auth when no token found', async () => {
      const apolloClient = require('@/lib/apollo-client');
      const firebase = require('@/lib/firebase');
      firebase.isFirebaseConfigured.mockReturnValue(false);

      const TestComponent = () => {
        const { user, checkAuth, loading } = useAuth();

        React.useEffect(() => {
          if (!loading) {
            checkAuth();
          }
        }, [loading]);

        return <div>{user ? `User: ${user.email}` : 'No user'}</div>;
      };

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('No user')).toBeInTheDocument();
      });
    });
  });

  describe('Set Current Tenant', () => {
    it('should update user tenant ID', async () => {
      const apolloClient = require('@/lib/apollo-client');
      const firebase = require('@/lib/firebase');
      firebase.isFirebaseConfigured.mockReturnValue(false);

      const TestComponent = () => {
        const { user, setCurrentTenant, loading } = useAuth();
        const [localUser, setLocalUser] = React.useState(mockUser);

        React.useEffect(() => {
          if (!loading) {
            // Simulate user being set
            setLocalUser(mockUser);
            setCurrentTenant('new_tenant_456');
          }
        }, [loading]);

        return <div>{localUser && <div>Tenant: {localUser.tenantId}</div>}</div>;
      };

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(apolloClient.setTenantId).toHaveBeenCalledWith('new_tenant_456');
      });
    });
  });
});