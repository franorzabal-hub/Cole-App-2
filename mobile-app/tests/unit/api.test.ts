import { apiClient, ApiError, ApiResponse } from '@/services/api';
import * as SecureStore from 'expo-secure-store';

// Mock Expo Secure Store
jest.mock('expo-secure-store');

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  const mockBaseURL = 'http://localhost:3000';
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.EXPO_PUBLIC_API_URL = mockBaseURL;

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Request Configuration', () => {
    it('should include authentication token in headers', async () => {
      const mockToken = 'test-jwt-token';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' }),
        headers: new Headers(),
      });

      await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/test`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should not include auth header when no token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' }),
        headers: new Headers(),
      });

      await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/test`,
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it('should include default headers', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' }),
        headers: new Headers(),
      });

      await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      );
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
        headers: new Headers(),
      });
    });

    it('should make GET request', async () => {
      const response = await apiClient.get('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users`,
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(response.data).toBe('success');
    });

    it('should make POST request with body', async () => {
      const payload = { name: 'Test User', email: 'test@example.com' };

      await apiClient.post('/users', payload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });

    it('should make PUT request with body', async () => {
      const payload = { name: 'Updated User' };

      await apiClient.put('/users/123', payload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users/123`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      );
    });

    it('should make PATCH request with body', async () => {
      const payload = { status: 'active' };

      await apiClient.patch('/users/123', payload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users/123`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      );
    });

    it('should make DELETE request', async () => {
      await apiClient.delete('/users/123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users/123`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Query Parameters', () => {
    it('should append query parameters to URL', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
        headers: new Headers(),
      });

      const params = {
        page: 1,
        limit: 10,
        search: 'test query',
      };

      await apiClient.get('/users', { params });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users?page=1&limit=10&search=test%20query`,
        expect.any(Object)
      );
    });

    it('should handle array query parameters', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
        headers: new Headers(),
      });

      const params = {
        ids: [1, 2, 3],
        tags: ['tag1', 'tag2'],
      };

      await apiClient.get('/users', { params });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('ids=1&ids=2&ids=3'),
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    });

    it('should handle 401 unauthorized error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid token' }),
        headers: new Headers(),
      });

      try {
        await apiClient.get('/protected');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(401);
        expect((error as ApiError).message).toBe('Invalid token');
      }

      // Verify token was cleared
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
    });

    it('should handle 404 not found error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
        headers: new Headers(),
      });

      try {
        await apiClient.get('/users/999');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect((error as ApiError).message).toBe('Resource not found');
      }
    });

    it('should handle 500 server error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error occurred' }),
        headers: new Headers(),
      });

      try {
        await apiClient.post('/users', {});
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe('Server error occurred');
      }
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await apiClient.get('/users');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle invalid JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
        headers: new Headers(),
        text: async () => 'Not JSON',
      });

      try {
        await apiClient.get('/users');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Request Interceptors', () => {
    it('should support request interceptors', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
        headers: new Headers(),
      });

      const interceptor = jest.fn((config) => {
        config.headers['X-Custom-Header'] = 'custom-value';
        return config;
      });

      apiClient.interceptors.request.use(interceptor);

      await apiClient.get('/users');

      expect(interceptor).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should support response interceptors', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const mockResponse = { data: 'original' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const interceptor = jest.fn((response) => {
        response.data = 'modified';
        return response;
      });

      apiClient.interceptors.response.use(interceptor);

      const response = await apiClient.get('/users');

      expect(interceptor).toHaveBeenCalled();
      expect(response.data).toBe('modified');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
          headers: new Headers(),
        });
      });

      const response = await apiClient.get('/users', { retry: 3 });

      expect(callCount).toBe(3);
      expect(response.data).toBe('success');
    });

    it('should not retry non-retryable errors', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid data' }),
        headers: new Headers(),
      });

      let attempts = 0;
      try {
        await apiClient.get('/users', {
          retry: 3,
          onRetry: () => attempts++,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(attempts).toBe(0); // Should not retry 400 errors
        expect((error as ApiError).status).toBe(400);
      }
    });
  });

  describe('Timeout', () => {
    it('should timeout long-running requests', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      (global.fetch as jest.Mock).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: async () => ({ data: 'success' }),
              headers: new Headers(),
            });
          }, 5000);
        });
      });

      try {
        await apiClient.get('/users', { timeout: 100 });
        fail('Should have thrown a timeout error');
      } catch (error) {
        expect((error as Error).message).toContain('timeout');
      }
    });
  });
});