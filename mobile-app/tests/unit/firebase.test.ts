import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Mock Firebase modules
jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

describe('Mobile App Firebase Configuration', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset environment variables
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY = mockConfig.apiKey;
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = mockConfig.authDomain;
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = mockConfig.projectId;
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = mockConfig.storageBucket;
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = mockConfig.messagingSenderId;
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID = mockConfig.appId;
  });

  describe('Firebase Initialization', () => {
    it('should initialize Firebase with correct configuration', () => {
      const mockApp = { name: 'test-app' };
      (getApps as jest.Mock).mockReturnValue([]);
      (initializeApp as jest.Mock).mockReturnValue(mockApp);
      (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
      (getFirestore as jest.Mock).mockReturnValue({});

      const firebase = require('@/services/firebase');

      expect(initializeApp).toHaveBeenCalledWith(expect.objectContaining({
        apiKey: mockConfig.apiKey,
        authDomain: mockConfig.authDomain,
        projectId: mockConfig.projectId,
        storageBucket: mockConfig.storageBucket,
        messagingSenderId: mockConfig.messagingSenderId,
        appId: mockConfig.appId,
      }));

      expect(firebase.app).toBe(mockApp);
    });

    it('should reuse existing app if already initialized', () => {
      const mockApp = { name: 'existing-app' };
      (getApps as jest.Mock).mockReturnValue([mockApp]);
      (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
      (getFirestore as jest.Mock).mockReturnValue({});

      require('@/services/firebase');

      expect(initializeApp).not.toHaveBeenCalled();
    });

    it('should handle missing configuration', () => {
      delete process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
      delete process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      require('@/services/firebase');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Firebase configuration is incomplete')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Firebase Services', () => {
    beforeEach(() => {
      (getApps as jest.Mock).mockReturnValue([]);
      (initializeApp as jest.Mock).mockReturnValue({ name: 'test-app' });
    });

    it('should initialize Auth service', () => {
      const mockAuth = { currentUser: null, onAuthStateChanged: jest.fn() };
      (getAuth as jest.Mock).mockReturnValue(mockAuth);

      const firebase = require('@/services/firebase');

      expect(getAuth).toHaveBeenCalled();
      expect(firebase.auth).toBe(mockAuth);
    });

    it('should initialize Firestore service', () => {
      const mockDb = { collection: jest.fn() };
      (getFirestore as jest.Mock).mockReturnValue(mockDb);

      const firebase = require('@/services/firebase');

      expect(getFirestore).toHaveBeenCalled();
      expect(firebase.db).toBe(mockDb);
    });
  });

  describe('Auth State Management', () => {
    it('should handle auth state changes', (done) => {
      const mockAuth = {
        currentUser: null,
        onAuthStateChanged: jest.fn((callback) => {
          // Simulate auth state change
          setTimeout(() => {
            callback({
              uid: 'user123',
              email: 'test@example.com',
              displayName: 'Test User',
            });
          }, 100);
          return jest.fn(); // Return unsubscribe function
        }),
      };

      (getAuth as jest.Mock).mockReturnValue(mockAuth);
      (getApps as jest.Mock).mockReturnValue([{ name: 'app' }]);

      const firebase = require('@/services/firebase');

      firebase.auth.onAuthStateChanged((user: any) => {
        expect(user).toEqual({
          uid: 'user123',
          email: 'test@example.com',
          displayName: 'Test User',
        });
        done();
      });
    });

    it('should handle sign out', async () => {
      const mockAuth = {
        currentUser: { uid: 'user123' },
        signOut: jest.fn(() => Promise.resolve()),
      };

      (getAuth as jest.Mock).mockReturnValue(mockAuth);
      (getApps as jest.Mock).mockReturnValue([{ name: 'app' }]);

      const firebase = require('@/services/firebase');

      await firebase.auth.signOut();

      expect(mockAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('Firestore Operations', () => {
    it('should handle document operations', () => {
      const mockDoc = {
        id: 'doc123',
        data: () => ({ name: 'Test Document' }),
      };

      const mockDb = {
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve(mockDoc)),
            set: jest.fn(() => Promise.resolve()),
            update: jest.fn(() => Promise.resolve()),
            delete: jest.fn(() => Promise.resolve()),
          })),
          add: jest.fn(() => Promise.resolve({ id: 'new123' })),
        })),
      };

      (getFirestore as jest.Mock).mockReturnValue(mockDb);
      (getApps as jest.Mock).mockReturnValue([{ name: 'app' }]);

      const firebase = require('@/services/firebase');

      expect(firebase.db).toBe(mockDb);
      expect(firebase.db.collection).toBeDefined();
    });
  });
});