import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUnread } from '@/contexts/UnreadContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { tokens } from '@/theme/tokens';

import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

import NewsScreen from '@/screens/news/NewsScreen';
import NewsDetailScreen from '@/screens/news/NewsDetailScreen';
import EventsScreen from '@/screens/events/EventsScreen';
import EventDetailScreen from '@/screens/events/EventDetailScreen';
import MessagesScreen from '@/screens/messages/MessagesScreen';
import ChatScreen from '@/screens/messages/ChatScreen';
import NewMessageScreen from '@/screens/messages/NewMessageScreen';
import ExitPermissionsScreen from '@/screens/permissions/ExitPermissionsScreen';
import CreateExitPermissionScreen from '@/screens/permissions/CreateExitPermissionScreen';
import ReportsScreen from '@/screens/reports/ReportsScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  News: undefined;
  NewsDetail: { newsId: string };
  Events: undefined;
  EventDetail: { eventId: string };
  Messages: undefined;
  Chat: { chatId: string; recipientName: string };
  NewMessage: undefined;
  ExitPermissions: undefined;
  CreateExitPermission: undefined;
  Reports: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();
const NewsStack = createNativeStackNavigator();
const EventsStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();
const ExitPermissionsStack = createNativeStackNavigator();
const ReportsStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function NewsNavigator() {
  return (
    <NewsStack.Navigator screenOptions={{ headerShown: false }}>
      <NewsStack.Screen
        name="NewsList"
        component={NewsScreen}
        options={{ title: 'Novedades' }}
      />
      <NewsStack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{ title: 'Detalle' }}
      />
    </NewsStack.Navigator>
  );
}

function EventsNavigator() {
  return (
    <EventsStack.Navigator screenOptions={{ headerShown: false }}>
      <EventsStack.Screen
        name="EventsList"
        component={EventsScreen}
        options={{ title: 'Eventos' }}
      />
      <EventsStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Detalle del Evento' }}
      />
    </EventsStack.Navigator>
  );
}

function MessagesNavigator() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen
        name="MessagesList"
        component={MessagesScreen}
        options={{ title: 'Mensajes' }}
      />
      <MessagesStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params?.recipientName || 'Chat' })}
      />
      <MessagesStack.Screen
        name="NewMessage"
        component={NewMessageScreen}
        options={{ title: 'Nuevo Mensaje' }}
      />
    </MessagesStack.Navigator>
  );
}

function ExitPermissionsNavigator() {
  return (
    <ExitPermissionsStack.Navigator screenOptions={{ headerShown: false }}>
      <ExitPermissionsStack.Screen
        name="PermissionsList"
        component={ExitPermissionsScreen}
        options={{ title: 'Cambios de Salida' }}
      />
      <ExitPermissionsStack.Screen
        name="CreatePermission"
        component={CreateExitPermissionScreen}
        options={{ title: 'Solicitar Cambio' }}
      />
    </ExitPermissionsStack.Navigator>
  );
}

function ReportsNavigator() {
  return (
    <ReportsStack.Navigator screenOptions={{ headerShown: false }}>
      <ReportsStack.Screen
        name="ReportsList"
        component={ReportsScreen}
        options={{ title: 'Boletines e Informes' }}
      />
    </ReportsStack.Navigator>
  );
}

function MainNavigator() {
  const { unreadCounts } = useUnread();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, string> = {
            News: 'announcement',
            Events: 'event',
            Messages: 'message',
            ExitPermissions: 'directions-walk',
            Reports: 'assessment',
          };
          const iconName = iconMap[route.name] ?? 'announcement';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: tokens.color.primary,
        tabBarInactiveTintColor: tokens.color.gray600,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.color.bg,
          borderTopWidth: 0.5,
          borderTopColor: tokens.color.gray200,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarBadge:
          route.name === 'News' && unreadCounts.news > 0
            ? unreadCounts.news > 99
              ? '99+'
              : unreadCounts.news
            : route.name === 'Events' && unreadCounts.events > 0
            ? unreadCounts.events > 99
              ? '99+'
              : unreadCounts.events
            : route.name === 'Messages' && unreadCounts.messages > 0
            ? unreadCounts.messages > 99
              ? '99+'
              : unreadCounts.messages
            : route.name === 'Reports' && unreadCounts.reports > 0
            ? unreadCounts.reports > 99
              ? '99+'
              : unreadCounts.reports
            : undefined,
      })}
    >
      <Tab.Screen name="News" component={NewsNavigator} options={{ title: t('tabs.news'), tabBarLabel: t('tabs.news') }} />
      <Tab.Screen name="Events" component={EventsNavigator} options={{ title: t('tabs.events'), tabBarLabel: t('tabs.events') }} />
      <Tab.Screen name="Messages" component={MessagesNavigator} options={{ title: t('tabs.messages'), tabBarLabel: t('tabs.messages') }} />
      <Tab.Screen name="ExitPermissions" component={ExitPermissionsNavigator} options={{ title: t('tabs.exitPermissions'), tabBarLabel: t('tabs.exitPermissions') }} />
      <Tab.Screen name="Reports" component={ReportsNavigator} options={{ title: t('tabs.reports'), tabBarLabel: t('tabs.reports') }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tokens.color.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.color.bg,
  },
});
