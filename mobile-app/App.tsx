import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'react-native-elements';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { UnreadProvider } from './src/contexts/UnreadContext';
import { ToastProvider } from './src/hooks/useToast';
import { lightNavTheme, darkNavTheme, lightRNETheme, darkRNETheme } from './src/theme/themes';
import i18n from './src/i18n';
import { notificationService } from './src/services/notifications';

export default function App() {
  const navigationRef = useRef(null);
  const scheme = useColorScheme();
  const navTheme = scheme === 'dark' ? darkNavTheme : lightNavTheme;
  const rneTheme = scheme === 'dark' ? darkRNETheme : lightRNETheme;

  useEffect(() => {
    // Setup notifications
    notificationService.setNavigationRef(navigationRef.current);
    notificationService.registerForPushNotifications();
    const cleanup = notificationService.setupNotificationListeners();

    return cleanup;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <SafeAreaProvider>
            <ThemeProvider theme={rneTheme}>
              <NavigationContainer ref={navigationRef} theme={navTheme}>
                <AuthProvider>
                  <UnreadProvider>
                    <NotificationProvider>
                      <ToastProvider>
                        <AppNavigator />
                      </ToastProvider>
                    </NotificationProvider>
                  </UnreadProvider>
                </AuthProvider>
              </NavigationContainer>
            </ThemeProvider>
          </SafeAreaProvider>
        </I18nextProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
