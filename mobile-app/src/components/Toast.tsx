import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ToastAndroid,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { tokens } from '@/theme/tokens';

export interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastProps extends ToastConfig {
  visible: boolean;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  action,
  visible,
  onHide,
}) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Show Android native toast
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          message,
          duration === 3000 ? ToastAndroid.SHORT : ToastAndroid.LONG,
          ToastAndroid.BOTTOM
        );
        onHide();
        return;
      }

      // iOS banner animation
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, message, duration, animation, onHide]);

  // Android uses native toast, so no UI needed
  if (Platform.OS === 'android' || !visible) {
    return null;
  }

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return tokens.color.success;
      case 'error':
        return tokens.color.danger;
      case 'warning':
        return tokens.color.warning;
      default:
        return tokens.color.info;
    }
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity: animation,
        },
      ]}
      pointerEvents="box-none"
    >
      <SafeAreaView>
        <View
          style={[
            styles.toast,
            { backgroundColor: getBackgroundColor() },
          ]}
        >
          <View style={styles.content}>
            <Icon
              name={getIconName()}
              size={20}
              color={tokens.color.white}
              style={styles.icon}
            />
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
            {action && (
              <TouchableOpacity
                onPress={action.onPress}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toast: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: tokens.color.white,
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  actionText: {
    fontSize: 12,
    color: tokens.color.white,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default Toast;