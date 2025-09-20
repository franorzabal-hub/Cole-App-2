import { apiClient, queries, User, Student, RegisterInput } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const USER_DATA_KEY = '@coleapp/user_data';
const TENANT_ID_KEY = '@coleapp/tenant_id';

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface UnreadCounts {
  news: number;
  events: number;
  messages: number;
  total: number;
}

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.graphql(queries.LOGIN, {
        email,
        password,
      });

      if (response.login) {
        const { accessToken, refreshToken, user } = response.login;

        // Store tokens and user data
        await apiClient.setAuthToken(accessToken);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

        // Store tenant ID (assuming it's the first role's tenant or a default)
        if (user.roles && user.roles.length > 0) {
          // For now, we'll use a default tenant ID - this should be configured based on your backend
          await AsyncStorage.setItem(TENANT_ID_KEY, 'default-tenant');
        }

        return { user, error: null };
      }

      return { user: null, error: 'Usuario no encontrado' };
    } catch (error: any) {
      return { user: null, error: error.message || 'Error de inicio de sesión' };
    }
  }

  /**
   * Sign up new user
   */
  static async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string
  ): Promise<AuthResponse> {
    try {
      const registerInput: RegisterInput = {
        email,
        password,
        firstName,
        lastName,
        phone,
      };

      const response = await apiClient.graphql(queries.REGISTER, {
        input: registerInput,
      });

      if (response.register) {
        const { accessToken, refreshToken, user } = response.register;

        // Store tokens and user data
        await apiClient.setAuthToken(accessToken);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

        // Store tenant ID
        if (user.roles && user.roles.length > 0) {
          await AsyncStorage.setItem(TENANT_ID_KEY, 'default-tenant');
        }

        return { user, error: null };
      }

      return { user: null, error: 'Error al crear usuario' };
    } catch (error: any) {
      return { user: null, error: error.message || 'Error en el registro' };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error: string | null }> {
    try {
      await apiClient.clearAuth();
      await AsyncStorage.removeItem(USER_DATA_KEY);
      await AsyncStorage.removeItem(TENANT_ID_KEY);
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al cerrar sesión' };
    }
  }

  /**
   * Get current user from storage
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current tenant ID
   */
  static async getCurrentTenantId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TENANT_ID_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user's children (students)
   */
  static async getUserChildren(): Promise<Student[]> {
    try {
      const tenantId = await this.getCurrentTenantId();
      if (!tenantId) return [];

      const response = await apiClient.graphql(queries.GET_MY_STUDENTS, {
        tenantId,
      });

      return response.myStudents || [];
    } catch (error) {
      console.error('Error fetching user children:', error);
      return [];
    }
  }

  /**
   * Get user's roles from stored user data
   */
  static async getUserRoles(): Promise<string[]> {
    try {
      const user = await this.getCurrentUser();
      return user?.roles?.map(role => role.name) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if user has a specific role
   */
  static async hasRole(roleName: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles();
      return roles.includes(roleName);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get unread counts for user (this would need a specific query on the backend)
   */
  static async getUnreadCounts(): Promise<UnreadCounts> {
    try {
      // This would need to be implemented as a custom query on the backend
      // For now, return a mock structure
      return { news: 0, events: 0, messages: 0, total: 0 };
    } catch (error) {
      return { news: 0, events: 0, messages: 0, total: 0 };
    }
  }

  /**
   * Reset password - would need to be implemented on the backend
   */
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      // This would need a password reset endpoint on the NestJS backend
      await apiClient.post('/auth/forgot-password', { email });
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al enviar email de recuperación' };
    }
  }

  /**
   * Update password - would need to be implemented on the backend
   */
  static async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      // This would need a password update endpoint on the NestJS backend
      await apiClient.put('/auth/change-password', { newPassword });
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Error al actualizar contraseña' };
    }
  }

  /**
   * Update user profile - would need to be implemented on the backend
   */
  static async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      // This would need a profile update endpoint on the NestJS backend
      const response = await apiClient.put('/auth/profile', updates);

      // Update stored user data
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));

      return { user: response.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'Error al actualizar perfil' };
    }
  }

  /**
   * Initialize auth state from storage
   */
  static async initializeAuth(): Promise<User | null> {
    try {
      const user = await this.getCurrentUser();
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  // Compatibility methods for AuthContext

  /**
   * Get stored token (for compatibility with AuthContext)
   */
  static async getToken(): Promise<string | null> {
    try {
      return await apiClient.getAuthToken();
    } catch (error) {
      return null;
    }
  }

  /**
   * Set auth token (for compatibility with AuthContext)
   */
  static async setToken(token: string): Promise<void> {
    try {
      await apiClient.setAuthToken(token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  /**
   * Login method (for compatibility with AuthContext)
   */
  static async login(email: string, password: string): Promise<any> {
    try {
      const response = await this.signIn(email, password);
      if (response.user && !response.error) {
        // Get the token from apiClient after successful login
        const token = await apiClient.getAuthToken();
        return {
          token,
          user: response.user,
        };
      }
      throw new Error(response.error || 'Login failed');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register method (for compatibility with AuthContext)
   */
  static async register(email: string, password: string, userData: any): Promise<any> {
    try {
      const response = await this.signUp(
        email,
        password,
        userData.firstName || userData.displayName || email.split('@')[0],
        userData.lastName || '',
        userData.phone
      );
      if (response.user && !response.error) {
        // Get the token from apiClient after successful registration
        const token = await apiClient.getAuthToken();
        return {
          token,
          user: response.user,
        };
      }
      throw new Error(response.error || 'Registration failed');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout method (for compatibility with AuthContext)
   */
  static async logout(): Promise<void> {
    await this.signOut();
  }
}