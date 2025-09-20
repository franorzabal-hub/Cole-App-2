import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Mock Apollo Client modules
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  createHttpLink: jest.fn(),
}));

jest.mock('@apollo/client/link/context', () => ({
  setContext: jest.fn(),
}));

jest.mock('@apollo/client/link/error', () => ({
  onError: jest.fn(),
}));

jest.mock('@apollo/client/link/retry', () => ({
  RetryLink: jest.fn(),
}));

jest.mock('@graphql-ws/client/lib/client', () => ({
  createClient: jest.fn(),
}));

describe('Apollo Client Configuration', () => {
  const originalEnv = process.env;
  const mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset environment
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_GRAPHQL_URL = 'http://localhost:3000/graphql';
    process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:3000/graphql';

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => mockLocalStorage[key] || null),
        setItem: jest.fn((key, value) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
        }),
      },
      writable: true,
    });

    // Clear localStorage
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Client Initialization', () => {
    it('should create Apollo Client with correct configuration', () => {
      const mockCache = {};
      const mockLink = { request: jest.fn() };

      (InMemoryCache as jest.Mock).mockReturnValue(mockCache);
      (createHttpLink as jest.Mock).mockReturnValue(mockLink);
      (ApolloClient as jest.Mock).mockImplementation(function (config) {
        this.cache = config.cache;
        this.link = config.link;
        this.defaultOptions = config.defaultOptions;
        this.name = config.name;
        this.version = config.version;
      });

      require('@/lib/apollo-client');

      expect(ApolloClient).toHaveBeenCalledWith(
        expect.objectContaining({
          cache: expect.any(Object),
          defaultOptions: expect.objectContaining({
            watchQuery: expect.objectContaining({
              fetchPolicy: expect.any(String),
              errorPolicy: 'all',
            }),
            query: expect.objectContaining({
              fetchPolicy: expect.any(String),
              errorPolicy: 'all',
            }),
            mutate: expect.objectContaining({
              errorPolicy: 'all',
            }),
          }),
          name: 'web-admin-client',
        })
      );
    });

    it('should configure HTTP link with correct URI', () => {
      const expectedUrl = 'http://localhost:3000/graphql';
      process.env.NEXT_PUBLIC_GRAPHQL_URL = expectedUrl;

      require('@/lib/apollo-client');

      expect(createHttpLink).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: expectedUrl,
          credentials: 'include',
        })
      );
    });
  });

  describe('Authentication', () => {
    it('should add authorization header when token exists', () => {
      mockLocalStorage['token'] = 'test-jwt-token';

      let authLinkHandler: any;
      (setContext as jest.Mock).mockImplementation((handler) => {
        authLinkHandler = handler;
        return { concat: jest.fn() };
      });

      require('@/lib/apollo-client');

      const context = authLinkHandler(undefined, { headers: {} });

      expect(context).toEqual({
        headers: expect.objectContaining({
          authorization: 'Bearer test-jwt-token',
        }),
      });
    });

    it('should not add authorization header when token is missing', () => {
      let authLinkHandler: any;
      (setContext as jest.Mock).mockImplementation((handler) => {
        authLinkHandler = handler;
        return { concat: jest.fn() };
      });

      require('@/lib/apollo-client');

      const context = authLinkHandler(undefined, { headers: {} });

      expect(context).toEqual({
        headers: expect.objectContaining({
          authorization: '',
        }),
      });
    });

    it('should add tenant ID header when available', () => {
      mockLocalStorage['tenantId'] = 'tenant_123';

      let authLinkHandler: any;
      (setContext as jest.Mock).mockImplementation((handler) => {
        authLinkHandler = handler;
        return { concat: jest.fn() };
      });

      require('@/lib/apollo-client');

      const context = authLinkHandler(undefined, { headers: {} });

      expect(context).toEqual({
        headers: expect.objectContaining({
          'x-tenant-id': 'tenant_123',
        }),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle GraphQL errors', () => {
      let errorLinkHandler: any;
      (onError as jest.Mock).mockImplementation((handler) => {
        errorLinkHandler = handler;
        return { concat: jest.fn() };
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      require('@/lib/apollo-client');

      const graphQLErrors = [
        {
          message: 'Test error',
          locations: [{ line: 1, column: 1 }],
          path: ['test'],
          extensions: { code: 'TEST_ERROR' },
        },
      ];

      errorLinkHandler({
        graphQLErrors,
        networkError: null,
        operation: {},
        forward: jest.fn(),
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[GraphQL Error]')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should redirect to login on UNAUTHENTICATED error', () => {
      let errorLinkHandler: any;
      (onError as jest.Mock).mockImplementation((handler) => {
        errorLinkHandler = handler;
        return { concat: jest.fn() };
      });

      delete (window as any).location;
      (window as any).location = { href: '' };

      require('@/lib/apollo-client');

      errorLinkHandler({
        graphQLErrors: [
          {
            message: 'Unauthorized',
            extensions: { code: 'UNAUTHENTICATED' },
          },
        ],
        operation: {},
        forward: jest.fn(),
      });

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(window.location.href).toBe('/login');
    });

    it('should handle network errors', () => {
      let errorLinkHandler: any;
      (onError as jest.Mock).mockImplementation((handler) => {
        errorLinkHandler = handler;
        return { concat: jest.fn() };
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      require('@/lib/apollo-client');

      errorLinkHandler({
        graphQLErrors: null,
        networkError: { statusCode: 500, message: 'Internal Server Error' },
        operation: {},
        forward: jest.fn(),
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Network Error]')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Token Management', () => {
    it('should set authentication token', () => {
      const apolloClient = require('@/lib/apollo-client');
      const token = 'new-auth-token';

      apolloClient.setAuthToken(token);

      expect(window.localStorage.setItem).toHaveBeenCalledWith('token', token);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('accessToken', token);
    });

    it('should clear authentication token', () => {
      const apolloClient = require('@/lib/apollo-client');

      apolloClient.clearAuthToken();

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('tenantId');
    });

    it('should set tenant ID', () => {
      const apolloClient = require('@/lib/apollo-client');
      const tenantId = 'tenant_456';

      apolloClient.setTenantId(tenantId);

      expect(window.localStorage.setItem).toHaveBeenCalledWith('tenantId', tenantId);
    });
  });

  describe('Environment-based Configuration', () => {
    it('should use development settings in development mode', () => {
      process.env.NODE_ENV = 'development';

      (ApolloClient as jest.Mock).mockImplementation(function (config) {
        this.defaultOptions = config.defaultOptions;
        this.connectToDevTools = config.connectToDevTools;
      });

      require('@/lib/apollo-client');

      expect(ApolloClient).toHaveBeenCalledWith(
        expect.objectContaining({
          connectToDevTools: true,
          defaultOptions: expect.objectContaining({
            watchQuery: expect.objectContaining({
              fetchPolicy: 'cache-and-network',
            }),
            query: expect.objectContaining({
              fetchPolicy: 'network-only',
            }),
          }),
        })
      );
    });

    it('should use production settings in production mode', () => {
      process.env.NODE_ENV = 'production';

      (ApolloClient as jest.Mock).mockImplementation(function (config) {
        this.defaultOptions = config.defaultOptions;
        this.connectToDevTools = config.connectToDevTools;
      });

      require('@/lib/apollo-client');

      expect(ApolloClient).toHaveBeenCalledWith(
        expect.objectContaining({
          connectToDevTools: false,
          defaultOptions: expect.objectContaining({
            watchQuery: expect.objectContaining({
              fetchPolicy: 'cache-first',
            }),
            query: expect.objectContaining({
              fetchPolicy: 'cache-first',
            }),
          }),
        })
      );
    });
  });
});