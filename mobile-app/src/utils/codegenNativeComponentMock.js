// Mock implementation of codegenNativeComponent for Expo compatibility
// This is used to bypass native component registration issues in Expo environment

import { View } from 'react-native';

/**
 * Mock implementation of codegenNativeComponent that returns a View component
 * This allows react-native-safe-area-context to work properly in Expo
 */
export default function codegenNativeComponent(componentName, options) {
  // For RNCSafeAreaView and RNCSafeAreaProvider, return View as a fallback
  // The actual safe area functionality is provided by Expo's own implementation
  return View;
}