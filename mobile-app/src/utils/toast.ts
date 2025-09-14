import { Alert, Platform, ToastAndroid } from 'react-native';

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // En iOS usamos Alert como fallback
    const title = type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : 'Información';
    Alert.alert(title, message);
  }
};

export const showSuccess = (message: string) => showToast(message, 'success');
export const showError = (message: string) => showToast(message, 'error');
export const showInfo = (message: string) => showToast(message, 'info');