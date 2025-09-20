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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current user with profile
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const session = await this.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          person:people(*)
        `)
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user's children (students)
   */
  static async getUserChildren(userId: string): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('family_relationships')
        .select(`
          student:students(
            *,
            person:people(*),
            campus:campuses(*)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data?.map(rel => rel.student).filter(Boolean) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get user's roles
   */
  static async getUserRoles(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role:roles(name)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data?.map(ur => ur.role?.name).filter(Boolean) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if user has permission
   */
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_has_permission', {
        user_id: userId,
        permission_name: permission,
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get unread counts for user
   */
  static async getUnreadCounts(userId: string): Promise<UnreadCounts> {
    try {
      const { data, error } = await supabase.rpc('get_unread_counts', {
        p_user_id: userId,
      });

      if (error) throw error;

      return data || { news: 0, events: 0, messages: 0, total: 0 };
    } catch (error) {
      return { news: 0, events: 0, messages: 0, total: 0 };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'coleapp://reset-password',
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select(`
          *,
          person:people(*)
        `)
        .single();

      if (error) throw error;
      return { user: data, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}