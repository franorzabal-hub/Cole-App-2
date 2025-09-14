import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { tokens } from '@/theme/tokens';

interface Props {
  label: string;
  icon?: string;
  selected?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export default function FilterChip({ label, icon, selected = false, style, onPress, accessibilityLabel }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      {icon && (
        <Icon
          name={icon}
          size={16}
          color={selected ? tokens.color.white : '#666'}
          style={{ marginRight: 6 }}
        />
      )}
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 18,
    backgroundColor: tokens.color.white,
    borderWidth: 1,
    borderColor: tokens.color.gray200,
  },
  chipSelected: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  text: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  textSelected: {
    color: tokens.color.white,
  },
});

