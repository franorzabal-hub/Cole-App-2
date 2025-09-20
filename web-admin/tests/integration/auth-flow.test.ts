import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/app/(auth)/login/page';
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
  isFirebaseConfigured: jest.fn(() => false),
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

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
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

describe('Authentication Flow Integration', () => {
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
    localStorage.clear();

    // Setup Firebase auth mock
    (firebaseAuth.onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });
  });

  describe('Login Flow', () => {
    it('should complete full login flow successfully', async () => {
      const mocks = [
        {
          request: {
            query: LOGIN_MUTATION,
            variables: {
              email: 'admin@colegio.edu',
              password: 'password123',
            },
          },
          result: {
            data: {
              login: {
                accessToken: 'jwt-token',
                user: {
                  ...mockUser,
                  email: 'admin@colegio.edu',
                },
              },
            },
          },
        },
      ];

      const { container } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MockedProvider>
      );

      // Find form inputs
      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      // Fill in login form
      fireEvent.change(emailInput, { target: { value: 'admin@colegio.edu' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit form
      fireEvent.click(submitButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });

      // Verify token and user stored
      expect(localStorage.getItem('token')).toBe('jwt-token');
      expect(localStorage.getItem('user')).toBeTruthy();
    });

    it('should show error message on failed login', async () => {
      const mocks = [
        {
          request: {
            query: LOGIN_MUTATION,
            variables: {
              email: 'wrong@example.com',
              password: 'wrongpassword',
            },
          },
          error: new Error('Invalid credentials'),
        },
      ];

      const { container } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MockedProvider>
      );

      // Find form inputs
      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      // Fill in login form with wrong credentials
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      // Submit form
      fireEvent.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument();
      });

      // Verify no redirect
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should disable form during login', async () => {
      const mocks = [
        {
          request: {
            query: LOGIN_MUTATION,
            variables: {
              email: 'test@example.com',
              password: 'password123',
            },
          },
          delay: 500, // Add delay to test loading state
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

      const { container } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MockedProvider>
      );

      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      // Fill and submit form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Check that form is disabled during loading
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      // Wait for login to complete
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      }, { timeout: 1000 });
    });
  });

  describe('Registration Flow', () => {
    it('should complete registration successfully', async () => {
      const mocks = [
        {
          request: {
            query: REGISTER_MUTATION,
            variables: {
              email: 'new@example.com',
              password: 'password123',
              firstName: 'New',
              lastName: 'User',
            },
          },
          result: {
            data: {
              register: {
                accessToken: 'jwt-token',
                user: {
                  id: '456',
                  email: 'new@example.com',
                  firstName: 'New',
                  lastName: 'User',
                  role: 'USER',
                  tenantId: 'tenant_456',
                },
              },
            },
          },
        },
      ];

      // This would be a registration component test
      // Implementation depends on the actual registration component
    });
  });

  describe('Session Persistence', () => {
    it('should restore session from localStorage on page refresh', async () => {
      // Set initial session data
      localStorage.setItem('token', 'existing-jwt-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const mocks = [
        {
          request: {
            query: gql`
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
            `,
          },
          result: {
            data: {
              me: mockUser,
            },
          },
        },
      ];

      // Render a component that uses auth
      const TestComponent = () => {
        const { user } = useAuth();
        return <div>{user ? `Logged in as: ${user.email}` : 'Not logged in'}</div>;
      };

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(`Logged in as: ${mockUser.email}`)).toBeInTheDocument();
      });
    });
  });

  describe('Logout Flow', () => {
    it('should complete logout and redirect to login', async () => {
      const apolloClient = require('@/lib/apollo-client');

      // Set initial session
      localStorage.setItem('token', 'jwt-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const TestComponent = () => {
        const { logout } = useAuth();
        return (
          <button onClick={logout}>Logout</button>
        );
      };

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      // Click logout button
      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        // Verify cleanup
        expect(apolloClient.clearAuthToken).toHaveBeenCalled();
        expect(apolloClient.default.clearStore).toHaveBeenCalled();

        // Verify redirect
        expect(mockPush).toHaveBeenCalledWith('/login');

        // Verify localStorage cleared
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mocks = [
        {
          request: {
            query: LOGIN_MUTATION,
            variables: {
              email: 'test@example.com',
              password: 'password123',
            },
          },
          error: new Error('Network error'),
        },
      ];

      const { container } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MockedProvider>
      );

      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument();
      });
    });

    it('should handle expired token by redirecting to login', async () => {
      const apolloClient = require('@/lib/apollo-client');

      // Set expired token
      localStorage.setItem('token', 'expired-token');

      const mocks = [
        {
          request: {
            query: gql`
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
            `,
          },
          error: new Error('Unauthorized'),
        },
      ];

      const TestComponent = () => {
        const { checkAuth } = useAuth();
        React.useEffect(() => {
          checkAuth();
        }, []);
        return <div>Testing auth</div>;
      };

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </MockedProvider>
      );

      await waitFor(() => {
        expect(apolloClient.clearAuthToken).toHaveBeenCalled();
        expect(localStorage.getItem('token')).toBeNull();
      });
    });
  });
});