import { Theme } from 'react-native-elements';
import { tokens } from './tokens';

export const theme: Theme = {
  colors: {
    primary: '#2089dc',
    secondary: '#8F0CE8',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff190c',
    grey0: '#393e42',
    grey1: '#43484d',
    grey2: '#5e6977',
    grey3: '#86939e',
    grey4: '#bdc6cf',
    grey5: '#e1e8ee',
    greyOutline: '#bbb',
    searchBg: '#303337',
    disabled: 'hsl(208, 8%, 90%)',
    divider: '#bcbbc1',
    platform: {
      ios: {
        primary: '#007aff',
        secondary: '#5856d6',
        success: '#4cd964',
        error: '#ff3b30',
        warning: '#ffcc00',
      },
      android: {
        primary: '#2196f3',
        secondary: '#9C27B0',
        success: '#4caf50',
        error: '#f44336',
        warning: '#ffeb3b',
      },
      web: {
        primary: '#2089dc',
        secondary: '#ca71eb',
        success: '#52c41a',
        error: '#ff190c',
        warning: '#faad14',
      },
    },
  },
  Text: {
    style: {
      fontSize: 16,
      color: '#43484d',
    },
  },
  Button: {
    buttonStyle: {
      borderRadius: 8,
      paddingVertical: 12,
    },
    titleStyle: {
      fontSize: 16,
      fontWeight: '600',
    },
  },
  Input: {
    inputStyle: {
      fontSize: 16,
    },
    labelStyle: {
      fontSize: 14,
      color: '#86939e',
      fontWeight: 'normal',
    },
    errorStyle: {
      fontSize: 12,
      marginTop: 4,
    },
  },
  Card: {
    containerStyle: {
      borderRadius: 12,
      shadowColor: tokens.color.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
  ListItem: {
    containerStyle: {
      paddingVertical: 12,
    },
  },
};