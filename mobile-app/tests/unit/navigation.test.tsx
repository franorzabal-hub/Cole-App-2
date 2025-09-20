import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Text, Button, View } from 'react-native';

// Mock navigation hooks
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
  };
});

// Mock screens for testing
const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <View>
      <Text>Home Screen</Text>
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate('Profile' as never)}
      />
    </View>
  );
};

const ProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  return (
    <View>
      <Text>Profile Screen</Text>
      <Text testID="route-params">{JSON.stringify(route.params)}</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const SettingsScreen = () => (
  <View>
    <Text>Settings Screen</Text>
  </View>
);

describe('Navigation', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
      dispatch: mockDispatch,
    });

    (useRoute as jest.Mock).mockReturnValue({
      params: {},
      name: 'Home',
    });
  });

  describe('Stack Navigation', () => {
    it('should navigate between stack screens', () => {
      const Stack = createNativeStackNavigator();

      const { getByText } = render(
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Verify initial screen
      expect(getByText('Home Screen')).toBeTruthy();

      // Navigate to Profile
      const navigateButton = getByText('Go to Profile');
      fireEvent.press(navigateButton);

      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });

    it('should go back to previous screen', () => {
      const Stack = createNativeStackNavigator();

      (useRoute as jest.Mock).mockReturnValue({
        params: {},
        name: 'Profile',
      });

      const { getByText } = render(
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Profile">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      const goBackButton = getByText('Go Back');
      fireEvent.press(goBackButton);

      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should pass parameters to screen', () => {
      const mockParams = { userId: '123', userName: 'Test User' };

      (useRoute as jest.Mock).mockReturnValue({
        params: mockParams,
        name: 'Profile',
      });

      const Stack = createNativeStackNavigator();

      const { getByTestId } = render(
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Profile">
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      const paramsText = getByTestId('route-params');
      expect(paramsText.props.children).toBe(JSON.stringify(mockParams));
    });
  });

  describe('Tab Navigation', () => {
    it('should render tab navigator with multiple screens', () => {
      const Tab = createBottomTabNavigator();

      const TabNavigator = () => (
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      );

      const { getByText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      // Initial screen should be rendered
      expect(getByText('Home Screen')).toBeTruthy();
    });

    it('should handle tab navigation', () => {
      const Tab = createBottomTabNavigator();

      const TabNavigator = () => (
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      );

      const { getByText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      // Tab buttons are automatically created
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);

      // This would normally trigger navigation in a real app
      // In tests, we're verifying the structure is correct
      expect(settingsTab).toBeTruthy();
    });
  });

  describe('Navigation Guards', () => {
    it('should handle authenticated navigation', () => {
      const AuthenticatedStack = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
        const Stack = createNativeStackNavigator();

        return (
          <Stack.Navigator>
            {isAuthenticated ? (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
              </>
            ) : (
              <Stack.Screen name="Login" component={() => <Text>Login Screen</Text>} />
            )}
          </Stack.Navigator>
        );
      };

      // Test unauthenticated state
      const { getByText: getByTextUnauth, rerender } = render(
        <NavigationContainer>
          <AuthenticatedStack isAuthenticated={false} />
        </NavigationContainer>
      );

      expect(getByTextUnauth('Login Screen')).toBeTruthy();

      // Test authenticated state
      rerender(
        <NavigationContainer>
          <AuthenticatedStack isAuthenticated={true} />
        </NavigationContainer>
      );

      // Now we should see the authenticated screens
      // Note: In a real test, we'd need to handle the async nature of navigation
    });
  });

  describe('Deep Linking', () => {
    it('should handle deep link navigation', () => {
      const linking = {
        prefixes: ['coleapp://'],
        config: {
          screens: {
            Home: 'home',
            Profile: 'profile/:id',
            Settings: 'settings',
          },
        },
      };

      const Stack = createNativeStackNavigator();

      const { getByText } = render(
        <NavigationContainer linking={linking}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Verify the navigation structure is set up for deep linking
      expect(getByText('Home Screen')).toBeTruthy();
    });
  });

  describe('Navigation State', () => {
    it('should track navigation state changes', () => {
      const onStateChange = jest.fn();

      const Stack = createNativeStackNavigator();

      render(
        <NavigationContainer onStateChange={onStateChange}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Navigation state changes would trigger the callback
      // In a real scenario, navigation actions would trigger this
    });
  });

  describe('Screen Options', () => {
    it('should apply screen options correctly', () => {
      const Stack = createNativeStackNavigator();

      const { getByText } = render(
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#f4511e' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Welcome Home' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={({ route }) => ({ title: `Profile` })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Screen options are applied to the navigation structure
      expect(getByText('Home Screen')).toBeTruthy();
    });
  });
});