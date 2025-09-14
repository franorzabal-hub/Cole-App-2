import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock User type
export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

// Mock auth state
let currentUser: User | null = null;
const authStateListeners: Array<(user: User | null) => void> = [];

// Mock Firebase app
const app = { name: 'mock-app' };

// Mock auth service
export const auth = {
  currentUser: null as User | null,
  signOut: async () => {
    currentUser = null;
    auth.currentUser = null;
    authStateListeners.forEach(listener => listener(null));
    await AsyncStorage.removeItem('mockUser');
  },
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    authStateListeners.push(callback);
    // Check for saved user
    AsyncStorage.getItem('mockUser').then(userData => {
      if (userData) {
        const user = JSON.parse(userData);
        currentUser = user;
        auth.currentUser = user;
        callback(user);
      } else {
        callback(null);
      }
    });

    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }
};

// Mock Firestore
export const db = {};

// Mock Storage
export const storage = {};

// Mock auth functions
export const signInWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  // Accept test credentials
  if (email === 'test@test.com' && password === 'password123') {
    const user: User = {
      uid: 'test-user-123',
      email: email,
      displayName: 'Test User'
    };
    currentUser = user;
    auth.currentUser = user;
    await AsyncStorage.setItem('mockUser', JSON.stringify(user));
    authStateListeners.forEach(listener => listener(user));
    return { user };
  }
  throw new Error('Invalid credentials. Use test@test.com / password123');
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  const user: User = {
    uid: 'new-user-' + Date.now(),
    email: email,
    displayName: email.split('@')[0]
  };
  currentUser = user;
  auth.currentUser = user;
  await AsyncStorage.setItem('mockUser', JSON.stringify(user));
  authStateListeners.forEach(listener => listener(user));
  return { user };
};

export const signOut = async () => {
  await auth.signOut();
};

// Export onAuthStateChanged as a standalone function for compatibility
export const onAuthStateChanged = (authInstance: any, callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

// Initialize function for the app
export const initializeFirebaseApp = async () => {
  try {
    // Mock Firebase initialized successfully

    // Mock FCM token for development
    const mockToken = 'mock-fcm-token-' + Math.random().toString(36).substr(2, 9);
    await AsyncStorage.setItem('fcmToken', mockToken);
    // Mock FCM Token stored

  } catch (error) {
    console.error('Mock Firebase initialization error:', error);
  }
};

// Maintain the old export name for compatibility
export { initializeFirebaseApp as initializeApp };

export default app;