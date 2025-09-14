import { DefaultTheme, DarkTheme, Theme as NavTheme } from '@react-navigation/native';
import { Theme as RNETheme } from 'react-native-elements';
import { tokens } from './tokens';

export const lightNavTheme: NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: tokens.color.primary,
    background: tokens.color.bg,
    card: tokens.color.white,
    text: tokens.color.textPrimary,
    border: tokens.color.gray200,
    notification: tokens.color.danger,
  },
};

export const darkNavTheme: NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#2C2C2E',
    notification: '#FF453A',
  },
};

export const lightRNETheme: RNETheme = {
  colors: {
    primary: tokens.color.primary,
  },
  Text: {
    style: { color: tokens.color.textPrimary },
  },
};

export const darkRNETheme: RNETheme = {
  colors: {
    primary: '#0A84FF',
  },
  Text: {
    style: { color: '#FFFFFF' },
  },
};

