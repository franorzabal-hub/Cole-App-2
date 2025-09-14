import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { Text, Input, Button, Image } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/validation';
import { tokens } from '@/theme/tokens';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.message || t('auth.loginError')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text h3 style={styles.title}>
            {t('auth.appTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {t('auth.appSubtitle')}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder={t('auth.email')}
            leftIcon={{ type: 'material', name: 'email' }}
            value={email}
            onChangeText={setEmail}
            errorMessage={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Input
            placeholder={t('auth.password')}
            leftIcon={{ type: 'material', name: 'lock' }}
            value={password}
            onChangeText={setPassword}
            errorMessage={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <Button
            title={t('auth.loginButton')}
            onPress={handleLogin}
            loading={loading}
            buttonStyle={styles.loginButton}
            titleStyle={styles.loginButtonText}
          />

          <Button
            title={t('auth.forgotPassword')}
            type="clear"
            titleStyle={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword' as never)}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              {t('auth.noAccount')}{' '}
            </Text>
            <Button
              title={t('auth.registerButton')}
              type="clear"
              titleStyle={styles.registerButton}
              onPress={() => navigation.navigate('Register' as never)}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.gray50,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    color: '#2089dc',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: tokens.color.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: tokens.color.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButton: {
    backgroundColor: tokens.color.primary,
    borderRadius: 5,
    paddingVertical: 12,
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: tokens.color.primary,
    marginTop: 15,
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: tokens.color.textMuted,
    fontSize: 14,
  },
  registerButton: {
    color: tokens.color.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
