import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'news' | 'event' | 'message' | 'report' | 'permission';
  id: string;
  title?: string;
  body?: string;
}

class NotificationService {
  private navigationRef: NavigationContainerRef<any> | null = null;

  setNavigationRef(ref: NavigationContainerRef<any>) {
    this.navigationRef = ref;
  }

  async registerForPushNotifications() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        // Failed to get push token for push notification
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    seconds: number = 1
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        badge: 1,
      },
      trigger: {
        seconds,
      },
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data as NotificationData;

    if (!data || !this.navigationRef) return;

    // Navigate based on notification type
    switch (data.type) {
      case 'news':
        this.navigationRef.navigate('News', {
          screen: 'NewsDetail',
          params: { newsId: data.id },
        });
        break;
      case 'event':
        this.navigationRef.navigate('Events', {
          screen: 'EventDetail',
          params: { eventId: data.id },
        });
        break;
      case 'message':
        this.navigationRef.navigate('Messages', {
          screen: 'Chat',
          params: { chatId: data.id },
        });
        break;
      case 'report':
        this.navigationRef.navigate('Reports');
        break;
      case 'permission':
        this.navigationRef.navigate('More', {
          screen: 'ExitPermissions',
        });
        break;
    }
  }

  // Handle deep links
  handleDeepLink(url: string) {
    if (!this.navigationRef) return;

    const { path, queryParams } = Linking.parse(url);

    // Parse the path and navigate accordingly
    // Example: coleapp://news/123 or coleapp://event/456
    const [screen, id] = path?.split('/') || [];

    switch (screen) {
      case 'news':
        if (id) {
          this.navigationRef.navigate('News', {
            screen: 'NewsDetail',
            params: { newsId: id },
          });
        } else {
          this.navigationRef.navigate('News');
        }
        break;
      case 'events':
      case 'event':
        if (id) {
          this.navigationRef.navigate('Events', {
            screen: 'EventDetail',
            params: { eventId: id },
          });
        } else {
          this.navigationRef.navigate('Events');
        }
        break;
      case 'messages':
      case 'message':
        if (id) {
          this.navigationRef.navigate('Messages', {
            screen: 'Chat',
            params: { chatId: id },
          });
        } else {
          this.navigationRef.navigate('Messages');
        }
        break;
      case 'reports':
        this.navigationRef.navigate('Reports');
        break;
      case 'permissions':
        this.navigationRef.navigate('More', {
          screen: 'ExitPermissions',
        });
        break;
      default:
        // Navigate to home or do nothing
        break;
    }
  }

  // Setup listeners
  setupNotificationListeners() {
    // Handle notifications when app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      // Notification received
    });

    // Handle notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });

    // Handle deep links
    const urlListener = Linking.addEventListener('url', ({ url }) => {
      this.handleDeepLink(url);
    });

    // Check if app was opened from a notification
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        this.handleNotificationResponse(response);
      }
    });

    // Check if app was opened from a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        this.handleDeepLink(url);
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
      urlListener.remove();
    };
  }
}

export const notificationService = new NotificationService();