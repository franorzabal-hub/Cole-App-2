import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '@/theme/tokens';

interface IOSHeaderProps {
  title: string;
  scrollY: Animated.Value;
  showBackButton?: boolean;
  subtitle?: string;
  rightButton?: React.ReactNode;
  onBackPress?: () => void;
}

export default function IOSHeader({ title, scrollY, showBackButton = false, subtitle, rightButton, onBackPress }: IOSHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Header animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const HEADER_HEIGHT = Platform.select({
    ios: 44,
    android: 56,
    default: 44,
  });

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={[styles.header, { height: HEADER_HEIGHT }]}>
        {/* School info and profile - fades out */}
        <Animated.View style={[styles.headerTop, { opacity: headerOpacity }]}>
          <TouchableOpacity
            style={styles.schoolInfo}
            onPress={() => navigation.navigate('News' as never)}
            >
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
            <Text style={styles.schoolName}>Colegio San Juan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <Icon name="account-circle" size={32} color="#333" />
          </TouchableOpacity>
        </Animated.View>

        {/* Page title - fades in */}
        <Animated.View style={[styles.headerTitle, { opacity: titleOpacity }]}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (onBackPress ? onBackPress() : (navigation.goBack() as unknown))}
              accessibilityRole="button"
              accessibilityLabel="Volver"
            >
              <Icon name="arrow-back-ios" size={22} color={tokens.color.primary} />
            </TouchableOpacity>
          )}
          <View style={styles.titleBlock}>
            <Text style={styles.headerTitleText}>{title}</Text>
            {!!subtitle && <Text style={styles.headerSubtitleText}>{subtitle}</Text>}
          </View>
          {!!rightButton && <View style={styles.rightButton}>{rightButton}</View>}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(242, 242, 247, 0.94)',
    zIndex: 100,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(199, 199, 204, 0.5)',
  },
  header: {
    justifyContent: 'center',
  },
  headerTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.color.black,
  },
  headerSubtitleText: {
    fontSize: 12,
    color: tokens.color.textMuted,
    marginTop: 2,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileButton: {
    padding: 4,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
  rightButton: {
    position: 'absolute',
    right: 16,
  },
});
