import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { tokens } from '@/theme/tokens';

type Variant = 'primary' | 'danger' | 'success' | 'warning' | 'muted';

interface Props {
  text: string;
  variant?: Variant;
  style?: ViewStyle;
}

const colors: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: '#E3F2FF', text: tokens.color.primary },
  danger: { bg: '#FDEAEA', text: tokens.color.danger },
  success: { bg: tokens.color.successLight, text: tokens.color.success },
  warning: { bg: '#FFF3CD', text: tokens.color.warning },
  muted: { bg: tokens.color.gray50, text: tokens.color.gray400 },
};

export default function Badge({ text, variant = 'primary', style }: Props) {
  const palette = colors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      <Text style={[styles.text, { color: palette.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

