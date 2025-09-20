/**
 * API Configuration for ColeApp Mobile
 * Connects to NestJS Backend with GraphQL and REST endpoints
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API Configuration
const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const GRAPHQL_URL = Constants.expoConfig?.extra?.graphqlUrl || process.env.EXPO_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

// Storage Keys
const AUTH_TOKEN_KEY = '@coleapp/auth_token';
const REFRESH_TOKEN_KEY = '@coleapp/refresh_token';
const USER_DATA_KEY = '@coleapp/user_data';

/**
 * API Client Configuration
 */
class ApiClient {
  private baseURL: string;
  private graphqlURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_URL;
    this.graphqlURL = GRAPHQL_URL;
    this.initializeAuth();
  }

  /**
   * Initialize authentication from storage
   */
  private async initializeAuth() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        this.authToken = token;
      }
    } catch (error) {
      console.error('Error loading auth token:', error);
    }
  }

  /**
   * Set authentication token
   */
  async setAuthToken(token: string) {
    this.authToken = token;
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Get authentication token
   */
  async getAuthToken(): Promise<string | null> {
    if (this.authToken) {
      return this.authToken;
    }
    // Try to load from storage if not in memory
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      this.authToken = token;
    }
    return this.authToken;
  }

  /**
   * Clear authentication
   */
  async clearAuth() {
    this.authToken = null;
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make REST API request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      // Handle authentication errors
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry request with new token
          return this.request(endpoint, options);
        } else {
          // Clear auth and redirect to login
          await this.clearAuth();
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Make GraphQL request
   */
  async graphql<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await fetch(this.graphqlURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      // Handle authentication errors
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.graphql(query, variables);
        } else {
          await this.clearAuth();
          throw new Error('Authentication failed');
        }
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL Error');
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL Request Error:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await this.request<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.accessToken) {
        await this.setAuthToken(response.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * GET request helper
   */
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request helper
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint: string, file: File | Blob, fieldName = 'file'): Promise<any> {
    const formData = new FormData();
    formData.append(fieldName, file as any);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export GraphQL queries and mutations
export const queries = {
  // Auth
  LOGIN: `
    mutation Login($email: String!, $password: String!) {
      login(input: { email: $email, password: $password }) {
        accessToken
        refreshToken
        user {
          id
          email
          firstName
          lastName
          roles {
            id
            name
          }
        }
      }
    }
  `,

  REGISTER: `
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        accessToken
        refreshToken
        user {
          id
          email
          firstName
          lastName
          roles {
            id
            name
          }
        }
      }
    }
  `,

  // Students
  GET_STUDENTS: `
    query GetStudents($tenantId: String!) {
      students(tenantId: $tenantId) {
        id
        firstName
        lastName
        email
        grade
        campus {
          id
          name
        }
        person {
          id
          firstName
          lastName
          email
          phone
        }
      }
    }
  `,

  GET_MY_STUDENTS: `
    query GetMyStudents($tenantId: String!) {
      myStudents(tenantId: $tenantId) {
        id
        firstName
        lastName
        email
        grade
        campus {
          id
          name
        }
        person {
          id
          firstName
          lastName
          email
          phone
        }
      }
    }
  `,

  GET_STUDENT: `
    query GetStudent($id: String!, $tenantId: String!) {
      student(id: $id, tenantId: $tenantId) {
        id
        firstName
        lastName
        email
        grade
        campus {
          id
          name
        }
        person {
          id
          firstName
          lastName
          email
          phone
        }
      }
    }
  `,

  // News
  GET_NEWS: `
    query GetNews($tenantId: String!, $filter: String, $limit: Int) {
      news(tenantId: $tenantId, filter: $filter, limit: $limit) {
        id
        title
        content
        priority
        publishedAt
        isRead
        attachments
        author {
          id
          firstName
          lastName
        }
        campus {
          id
          name
        }
      }
    }
  `,

  GET_NEWS_ITEM: `
    query GetNewsItem($id: String!, $tenantId: String!) {
      newsItem(id: $id, tenantId: $tenantId) {
        id
        title
        content
        priority
        publishedAt
        isRead
        attachments
        author {
          id
          firstName
          lastName
        }
        campus {
          id
          name
        }
      }
    }
  `,

  MARK_NEWS_AS_READ: `
    mutation MarkNewsAsRead($newsId: String!, $tenantId: String!) {
      markNewsAsRead(newsId: $newsId, tenantId: $tenantId) {
        id
        isRead
      }
    }
  `,

  // Events
  GET_EVENTS: `
    query GetEvents($tenantId: String!, $month: Int, $year: Int) {
      events(tenantId: $tenantId, month: $month, year: $year) {
        id
        title
        description
        startDate
        endDate
        location
        isRegistered
        attendeeCount
        campus {
          id
          name
        }
      }
    }
  `,

  GET_EVENT: `
    query GetEvent($id: String!, $tenantId: String!) {
      event(id: $id, tenantId: $tenantId) {
        id
        title
        description
        startDate
        endDate
        location
        isRegistered
        attendeeCount
        campus {
          id
          name
        }
      }
    }
  `,

  REGISTER_FOR_EVENT: `
    mutation RegisterForEvent($eventId: String!, $studentId: String) {
      registerForEvent(eventId: $eventId, studentId: $studentId) {
        id
        isRegistered
        attendeeCount
      }
    }
  `,

  // Messages
  GET_MESSAGES: `
    query GetMessages($tenantId: String!, $filter: String) {
      messages(tenantId: $tenantId, filter: $filter) {
        id
        subject
        content
        sentAt
        isRead
        sender {
          id
          firstName
          lastName
        }
        replies {
          id
          content
          sentAt
          sender {
            id
            firstName
            lastName
          }
        }
      }
    }
  `,

  GET_MESSAGE: `
    query GetMessage($id: String!, $tenantId: String!) {
      message(id: $id, tenantId: $tenantId) {
        id
        subject
        content
        sentAt
        isRead
        sender {
          id
          firstName
          lastName
        }
        replies {
          id
          content
          sentAt
          sender {
            id
            firstName
            lastName
          }
        }
      }
    }
  `,

  SEND_MESSAGE: `
    mutation SendMessage($input: SendMessageInput!) {
      sendMessage(input: $input) {
        id
        subject
        content
        sentAt
        sender {
          id
          firstName
          lastName
        }
      }
    }
  `,

  MARK_MESSAGE_AS_READ: `
    mutation MarkAsRead($messageId: String!, $tenantId: String!) {
      markAsRead(messageId: $messageId, tenantId: $tenantId) {
        id
        isRead
      }
    }
  `,

  // Exit Permissions
  GET_EXIT_PERMISSIONS: `
    query GetExitPermissions($tenantId: String!, $filter: String, $studentId: String) {
      exitPermissions(tenantId: $tenantId, filter: $filter, studentId: $studentId) {
        id
        status
        exitDate
        exitTime
        returnTime
        authorizedPersonName
        authorizedPersonDocument
        authorizedPersonPhone
        relationship
        reason
        transportationMethod
        createdAt
        updatedAt
        student {
          id
          firstName
          lastName
          grade
        }
        requestedBy {
          id
          firstName
          lastName
        }
        approvedBy {
          id
          firstName
          lastName
        }
      }
    }
  `,

  GET_EXIT_PERMISSION: `
    query GetExitPermission($id: String!, $tenantId: String!) {
      exitPermission(id: $id, tenantId: $tenantId) {
        id
        status
        exitDate
        exitTime
        returnTime
        authorizedPersonName
        authorizedPersonDocument
        authorizedPersonPhone
        relationship
        reason
        transportationMethod
        createdAt
        updatedAt
        student {
          id
          firstName
          lastName
          grade
        }
        requestedBy {
          id
          firstName
          lastName
        }
        approvedBy {
          id
          firstName
          lastName
        }
      }
    }
  `,

  REQUEST_EXIT: `
    mutation RequestExit($input: RequestExitInput!) {
      requestExit(input: $input) {
        id
        status
        exitDate
        exitTime
        returnTime
        authorizedPersonName
        authorizedPersonDocument
        authorizedPersonPhone
        relationship
        reason
        transportationMethod
        createdAt
        student {
          id
          firstName
          lastName
        }
      }
    }
  `,

  APPROVE_EXIT: `
    mutation ApproveExit($exitId: String!, $tenantId: String!) {
      approveExit(exitId: $exitId, tenantId: $tenantId) {
        id
        status
        approvedBy {
          id
          firstName
          lastName
        }
      }
    }
  `,

  REJECT_EXIT: `
    mutation RejectExit($exitId: String!, $tenantId: String!) {
      rejectExit(exitId: $exitId, tenantId: $tenantId) {
        id
        status
        approvedBy {
          id
          firstName
          lastName
        }
      }
    }
  `,

  // Reports
  GET_REPORTS: `
    query GetReports($tenantId: String!, $studentId: String, $type: String) {
      reports(tenantId: $tenantId, studentId: $studentId, type: $type) {
        id
        type
        title
        period
        fileUrl
        createdAt
        updatedAt
        student {
          id
          firstName
          lastName
          grade
        }
        generatedBy {
          id
          firstName
          lastName
        }
      }
    }
  `,

  GET_REPORT: `
    query GetReport($id: String!, $tenantId: String!) {
      report(id: $id, tenantId: $tenantId) {
        id
        type
        title
        period
        fileUrl
        content
        createdAt
        updatedAt
        student {
          id
          firstName
          lastName
          grade
          campus {
            id
            name
          }
        }
        generatedBy {
          id
          firstName
          lastName
        }
      }
    }
  `,

  CREATE_REPORT: `
    mutation CreateReport($input: CreateReportInput!) {
      createReport(input: $input) {
        id
        type
        title
        period
        fileUrl
        content
        createdAt
        student {
          id
          firstName
          lastName
        }
      }
    }
  `,

  UPDATE_REPORT: `
    mutation UpdateReport($id: String!, $input: UpdateReportInput!, $tenantId: String!) {
      updateReport(id: $id, input: $input, tenantId: $tenantId) {
        id
        type
        title
        period
        fileUrl
        content
        updatedAt
      }
    }
  `,
};

// Export type definitions
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dni?: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  permissions?: string[];
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Campus {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  grade?: string;
  campus: Campus;
  person: Person;
}

export interface News {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publishedAt: string;
  isRead: boolean;
  attachments?: string[];
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  campus?: Campus;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isRegistered: boolean;
  attendeeCount: number;
  campus?: Campus;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
  replies?: {
    id: string;
    content: string;
    sentAt: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
}

export interface ExitPermission {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  exitDate: string;
  exitTime?: string;
  returnTime?: string;
  authorizedPersonName: string;
  authorizedPersonDocument?: string;
  authorizedPersonPhone?: string;
  relationship?: string;
  reason?: string;
  transportationMethod?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    grade?: string;
  };
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Report {
  id: string;
  type: 'grade_report' | 'behavior_report' | 'attendance_report' | 'general_report';
  title: string;
  period?: string;
  fileUrl?: string;
  content?: any;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    grade?: string;
    campus?: Campus;
  };
  generatedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Input types for mutations
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SendMessageInput {
  tenantId: string;
  subject: string;
  content: string;
  recipientIds?: string[];
  priority?: 'low' | 'normal' | 'high';
  type?: 'announcement' | 'inquiry' | 'response' | 'notification';
  parentMessageId?: string;
}

export interface RequestExitInput {
  tenantId: string;
  studentId: string;
  exitDate: string;
  exitTime?: string;
  returnTime?: string;
  authorizedPersonName: string;
  authorizedPersonDocument?: string;
  authorizedPersonPhone?: string;
  relationship?: string;
  reason?: string;
  transportationMethod?: string;
}

export interface CreateReportInput {
  tenantId: string;
  studentId: string;
  type: 'grade_report' | 'behavior_report' | 'attendance_report' | 'general_report';
  title: string;
  period?: string;
  content?: any;
}

export interface UpdateReportInput {
  title?: string;
  period?: string;
  content?: any;
}

export default apiClient;