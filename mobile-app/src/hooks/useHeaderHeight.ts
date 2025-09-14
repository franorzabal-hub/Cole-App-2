import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useHeaderHeight() {
  const insets = useSafeAreaInsets();

  const HEADER_HEIGHT = Platform.select({
    ios: 44,
    android: 56,
    default: 44,
  }) || 44;

  return {
    headerHeight: HEADER_HEIGHT,
    totalHeaderHeight: insets.top + HEADER_HEIGHT,
    statusBarHeight: insets.top,
  };
}