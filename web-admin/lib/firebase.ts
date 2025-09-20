import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

/**
 * Firebase configuration
 * Supports both production and development environments
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase config is properly set
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

/**
 * Initialize Firebase services
 */
if (isConfigValid) {
  try {
    // Initialize Firebase app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Initialize Analytics only on client side and if supported
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      });
    }

    // Connect to emulators in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      const EMULATOR_HOST = 'localhost';

      // Connect Auth emulator
      if (auth && !(auth as any)._canInitEmulator) {
        connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
      }

      // Connect Firestore emulator
      if (db && !(db as any)._settings?.host?.includes('localhost')) {
        connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
      }

      // Connect Storage emulator
      if (storage && !(storage as any)._bucket?.includes('localhost')) {
        connectStorageEmulator(storage, EMULATOR_HOST, 9199);
      }

      console.log('🔥 Firebase connected to local emulators');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.warn('Firebase configuration is incomplete. Some features may not work properly.');
}

/**
 * Mock authentication for development when Firebase is not configured
 */
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Simulate auth state change
    if (process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true') {
      setTimeout(() => {
        callback({
          uid: 'mock-user-123',
          email: 'dev@coleapp.com',
          displayName: 'Developer User',
        });
      }, 1000);
    } else {
      callback(null);
    }
    return () => {}; // Unsubscribe function
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // Mock successful login
    return {
      user: {
        uid: 'mock-user-123',
        email,
        displayName: 'Developer User',
      },
    };
  },
  signOut: async () => {
    // Mock logout
    console.log('Mock logout successful');
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // Mock user creation
    return {
      user: {
        uid: 'mock-user-new',
        email,
        displayName: null,
      },
    };
  },
  sendPasswordResetEmail: async (email: string) => {
    // Mock password reset
    console.log(`Mock password reset email sent to ${email}`);
  },
};

// Export services with fallback to mock in development
export { app };
export const auth = isConfigValid ? auth : (mockAuth as any);
export const db = db as Firestore;
export const storage = storage as FirebaseStorage;
export { analytics };

// Utility functions
export const isFirebaseConfigured = () => isConfigValid;
export const isUsingEmulator = () =>
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
export const isUsingMockData = () =>
  !isConfigValid ||
  process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';

export default app;