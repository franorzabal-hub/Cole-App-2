import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  NormalizedCacheObject,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@graphql-ws/client/lib/client';
import { createClient } from 'graphql-ws';
import { split } from '@apollo/client';

// Configuration
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/graphql';
const IS_SERVER = typeof window === 'undefined';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const ENABLE_MOCK_DATA = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';

/**
 * Get authentication token from storage
 */
const getAuthToken = (): string | null => {
  if (IS_SERVER) return null;

  // Check multiple possible storage keys for compatibility
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    null
  );
};

/**
 * Get tenant ID from storage or environment
 */
const getTenantId = (): string => {
  if (IS_SERVER) {
    return process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'tenant_default';
  }

  return (
    localStorage.getItem('tenantId') ||
    sessionStorage.getItem('tenantId') ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ||
    'tenant_default'
  );
};

/**
 * HTTP Link for queries and mutations
 */
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
  fetch: IS_SERVER ? fetch : undefined,
});

/**
 * WebSocket link for subscriptions (client-side only)
 */
let wsLink: GraphQLWsLink | null = null;

if (!IS_SERVER && !ENABLE_MOCK_DATA) {
  try {
    wsLink = new GraphQLWsLink(
      createClient({
        url: WS_URL,
        connectionParams: () => ({
          authorization: getAuthToken() || '',
          'x-tenant-id': getTenantId(),
        }),
        reconnect: true,
        keepAlive: 10000,
      })
    );
  } catch (error) {
    console.warn('WebSocket connection not available:', error);
  }
}

/**
 * Authentication link - adds auth headers to requests
 */
const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();
  const tenantId = getTenantId();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-tenant-id': tenantId,
      'x-client-version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    },
  };
});

/**
 * Error handling link
 */
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      const errorCode = extensions?.code;

      console.error(
        `[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}, Code: ${errorCode}`
      );

      // Handle specific error codes
      switch (errorCode) {
        case 'UNAUTHENTICATED':
          // Redirect to login
          if (!IS_SERVER) {
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
          }
          break;
        case 'FORBIDDEN':
          console.error('Access denied to this resource');
          break;
        case 'INTERNAL_SERVER_ERROR':
          console.error('Server error occurred');
          break;
      }
    });
  }

  if (networkError) {
    console.error(`[Network Error]: ${networkError}`);

    // Handle network-specific errors
    if ('statusCode' in networkError) {
      switch (networkError.statusCode) {
        case 401:
          // Unauthorized - clear auth and redirect
          if (!IS_SERVER) {
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('tenantId');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Forbidden: Check your permissions');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server error: Please try again later');
          break;
      }
    }
  }
});

/**
 * Retry link for failed requests
 */
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors but not on GraphQL errors
      return !!error && !error.graphQLErrors?.length;
    },
  },
});

/**
 * Split link - route subscriptions through WebSocket, others through HTTP
 */
const splitLink = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      from([retryLink, errorLink, authLink, httpLink])
    )
  : from([retryLink, errorLink, authLink, httpLink]);

/**
 * Apollo Client instance
 */
const apolloClient = new ApolloClient<NormalizedCacheObject>({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Add any field policies here
        },
      },
      User: {
        keyFields: ['id', 'tenantId'],
      },
      // Add more type policies as needed
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: IS_DEVELOPMENT ? 'cache-and-network' : 'cache-first',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: IS_DEVELOPMENT ? 'network-only' : 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: IS_DEVELOPMENT,
  name: 'web-admin-client',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
});

// Export utility functions for token management
export const setAuthToken = (token: string) => {
  if (!IS_SERVER) {
    localStorage.setItem('token', token);
    localStorage.setItem('accessToken', token); // For compatibility
  }
};

export const clearAuthToken = () => {
  if (!IS_SERVER) {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tenantId');
  }
};

export const setTenantId = (tenantId: string) => {
  if (!IS_SERVER) {
    localStorage.setItem('tenantId', tenantId);
  }
};

// Export the client
export default apolloClient;

// Export for SSR/SSG usage
export const createApolloClient = () => apolloClient;