import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Mock Firebase modules
jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('firebase/storage');
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(false)),
}));

describe('Firebase Configuration', () => {
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
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = mockConfig.apiKey;
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = mockConfig.authDomain;
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = mockConfig.projectId;
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = mockConfig.storageBucket;
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = mockConfig.messagingSenderId;
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = mockConfig.appId;
  });

  describe('Firebase Initialization', () => {
    it('should initialize Firebase with correct configuration', async () => {
      const mockApp = { name: 'test-app' };
      (getApps as jest.Mock).mockReturnValue([]);
      (initializeApp as jest.Mock).mockReturnValue(mockApp);
      (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
      (getFirestore as jest.Mock).mockReturnValue({});
      (getStorage as jest.Mock).mockReturnValue({});

      const firebase = await import('@/lib/firebase');

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

    it('should reuse existing app if already initialized', async () => {
      const mockApp = { name: 'existing-app' };
      (getApps as jest.Mock).mockReturnValue([mockApp]);
      (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
      (getFirestore as jest.Mock).mockReturnValue({});
      (getStorage as jest.Mock).mockReturnValue({});

      await import('@/lib/firebase');

      expect(initializeApp).not.toHaveBeenCalled();
    });

    it('should handle missing configuration gracefully', async () => {
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      const firebase = await import('@/lib/firebase');

      expect(firebase.isFirebaseConfigured()).toBe(false);
      expect(initializeApp).not.toHaveBeenCalled();
    });
  });

  describe('Mock Authentication', () => {
    it('should provide mock auth when Firebase is not configured', async () => {
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

      const firebase = await import('@/lib/firebase');
      const { auth } = firebase;

      expect(auth).toBeDefined();
      expect(auth.currentUser).toBeNull();

      // Test mock login
      const result = await auth.signInWithEmailAndPassword('test@example.com', 'password');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.uid).toBe('mock-user-123');
    });

    it('should handle mock auth state changes', (done) => {
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA = 'true';

      import('@/lib/firebase').then((firebase) => {
        const { auth } = firebase;

        auth.onAuthStateChanged((user: any) => {
          if (user) {
            expect(user.uid).toBe('mock-user-123');
            expect(user.email).toBe('dev@coleapp.com');
            done();
          }
        });
      });
    });
  });

  describe('Firebase Services', () => {
    beforeEach(() => {
      (getApps as jest.Mock).mockReturnValue([]);
      (initializeApp as jest.Mock).mockReturnValue({ name: 'test-app' });
    });

    it('should initialize Auth service', async () => {
      const mockAuth = { currentUser: null, onAuthStateChanged: jest.fn() };
      (getAuth as jest.Mock).mockReturnValue(mockAuth);

      const firebase = await import('@/lib/firebase');

      expect(getAuth).toHaveBeenCalled();
      expect(firebase.auth).toBe(mockAuth);
    });

    it('should initialize Firestore service', async () => {
      const mockDb = { collection: jest.fn() };
      (getFirestore as jest.Mock).mockReturnValue(mockDb);

      const firebase = await import('@/lib/firebase');

      expect(getFirestore).toHaveBeenCalled();
      expect(firebase.db).toBe(mockDb);
    });

    it('should initialize Storage service', async () => {
      const mockStorage = { ref: jest.fn() };
      (getStorage as jest.Mock).mockReturnValue(mockStorage);

      const firebase = await import('@/lib/firebase');

      expect(getStorage).toHaveBeenCalled();
      expect(firebase.storage).toBe(mockStorage);
    });
  });

  describe('Utility Functions', () => {
    it('should correctly report Firebase configuration status', async () => {
      const firebase = await import('@/lib/firebase');

      expect(firebase.isFirebaseConfigured()).toBe(true);

      // Test with missing config
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      jest.resetModules();
      const firebase2 = await import('@/lib/firebase');

      expect(firebase2.isFirebaseConfigured()).toBe(false);
    });

    it('should correctly report emulator usage', async () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR = 'true';

      const firebase = await import('@/lib/firebase');

      expect(firebase.isUsingEmulator()).toBe(true);
    });

    it('should correctly report mock data usage', async () => {
      process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA = 'true';

      const firebase = await import('@/lib/firebase');

      expect(firebase.isUsingMockData()).toBe(true);
    });
  });
});