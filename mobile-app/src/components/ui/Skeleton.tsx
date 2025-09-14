import React from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { tokens } from '@/theme/tokens';

// Shimmer animation component
const ShimmerPlaceholder: React.FC<{
  width: number | string;
  height: number;
  style?: ViewStyle;
}> = ({ width, height, style }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          width,
          height,
          opacity,
        },
        style,
      ]}
    />
  );
};

export function SkeletonBlock({
  height = 16,
  width = '100%',
  style,
  shimmer = true
}: {
  height?: number;
  width?: number | string;
  style?: ViewStyle;
  shimmer?: boolean;
}) {
  if (shimmer) {
    return <ShimmerPlaceholder height={height} width={width} style={style} />;
  }
  return <View style={[styles.block, { height, width }, style]} />;
}

export function CardSkeleton({ lines = 3, shimmer = true }: { lines?: number; shimmer?: boolean }) {
  return (
    <View style={styles.card}>
      <SkeletonBlock height={180} shimmer={shimmer} />
      <View style={styles.content}>
        <SkeletonBlock height={12} width={80} style={{ marginBottom: 8 }} shimmer={shimmer} />
        <SkeletonBlock height={18} width={'90%'} style={{ marginBottom: 8 }} shimmer={shimmer} />
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock key={i} style={{ marginBottom: 6 }} shimmer={shimmer} />
        ))}
      </View>
    </View>
  );
}

export function CardSkeletonList({ count = 3, shimmer = true }: { count?: number; shimmer?: boolean }) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ marginBottom: 16 }}>
          <CardSkeleton shimmer={shimmer} />
        </View>
      ))}
    </View>
  );
}

// Line skeleton for text
export function LineSkeleton({
  width = '100%',
  height = 12,
  shimmer = true,
  style
}: {
  width?: number | string;
  height?: number;
  shimmer?: boolean;
  style?: ViewStyle;
}) {
  return <SkeletonBlock width={width} height={height} shimmer={shimmer} style={style} />;
}

// Avatar skeleton
export function AvatarSkeleton({
  size = 40,
  shimmer = true
}: {
  size?: number;
  shimmer?: boolean;
}) {
  return (
    <SkeletonBlock
      width={size}
      height={size}
      shimmer={shimmer}
      style={{ borderRadius: size / 2 }}
    />
  );
}

// List item skeleton
export function ListItemSkeleton({ shimmer = true }: { shimmer?: boolean }) {
  return (
    <View style={styles.listItem}>
      <AvatarSkeleton shimmer={shimmer} />
      <View style={styles.listItemContent}>
        <LineSkeleton width="60%" height={14} shimmer={shimmer} style={{ marginBottom: 4 }} />
        <LineSkeleton width="40%" height={12} shimmer={shimmer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: tokens.color.gray100,
    borderRadius: tokens.radius.sm,
  },
  shimmer: {
    backgroundColor: tokens.color.gray100,
    borderRadius: tokens.radius.sm,
  },
  card: {
    backgroundColor: tokens.color.white,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    ...tokens.shadow.card,
  },
  content: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: tokens.color.white,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
});