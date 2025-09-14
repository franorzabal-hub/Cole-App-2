import React, { createContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface NotificationContextType {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  fcmToken: string | null;
  lastNotification: any | null;
}

export const NotificationContext = createContext<NotificationContextType>({
  hasPermission: false,
  requestPermission: async () => false,
  fcmToken: null,
  lastNotification: null,
});

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<any | null>(null);

  useEffect(() => {
    // Mock notification setup for development
    mockSetup();
  }, []);

  const mockSetup = async () => {
    // Simulate having permission
    setHasPermission(true);

    // Get or create mock FCM token
    const storedToken = await AsyncStorage.getItem('fcmToken');
    if (storedToken) {
      setFcmToken(storedToken);
    } else {
      const mockToken = 'mock-fcm-token-' + Math.random().toString(36).substr(2, 9);
      setFcmToken(mockToken);
      await AsyncStorage.setItem('fcmToken', mockToken);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    // Simulate permission granted for development
    setHasPermission(true);
    // Mock notification permission granted
    return true;
  };

  const handleNotificationOpen = (remoteMessage: any) => {
    // Mock notification handler
    // Mock notification opened
  };

  return (
    <NotificationContext.Provider
      value={{
        hasPermission,
        requestPermission,
        fcmToken,
        lastNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}