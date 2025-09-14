import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { tokens } from '@/theme/tokens';

export default function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.white,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    ...tokens.shadow.card,
  },
});

