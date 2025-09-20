import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  RefreshControl,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSHeader from '@/components/IOSHeader';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { tokens } from '@/theme/tokens';
import Constants from 'expo-constants';
import { changeLanguage, availableLanguages } from '@/i18n';
import { AuthService } from '@/services/auth.service';
import { User, Student } from '@/config/api';

interface ProfileSection {
  title: string;
  items: ProfileItem[];
}

interface ProfileItem {
  icon: string;
  label: string;
  value?: string;
  type: 'info' | 'action' | 'switch';
  onPress?: () => void;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { totalHeaderHeight } = useHeaderHeight();
  const { t, i18n, ready } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [children, setChildren] = useState<Student[]>([]);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Load user profile data
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [user, userChildren] = await Promise.all([
        AuthService.getCurrentUser(),
        AuthService.getUserChildren(),
      ]);

      setCurrentUser(user);
      setChildren(userChildren);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert(t('common.error'), t('auth.logoutError'));
            }
          },
        },
      ],
    );
  };

  const handleLanguageChange = async (language: string) => {
    try {
      const success = await changeLanguage(language);
      if (success) {
        setShowLanguageModal(false);
        Alert.alert(t('common.success'), t('profile.languageChanged'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to change language');
    }
  };

  const profileSections: ProfileSection[] = [
    {
      title: t('profile.personalInfo'),
      items: [
        {
          icon: 'person',
          label: t('auth.name'),
          value: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : t('common.loading'),
          type: 'info',
        },
        {
          icon: 'email',
          label: t('profile.email'),
          value: currentUser?.email || t('common.loading'),
          type: 'info',
        },
        {
          icon: 'phone',
          label: t('profile.phone'),
          value: currentUser?.phone || '-',
          type: 'info',
        },
        {
          icon: 'badge',
          label: t('profile.dni'),
          value: currentUser?.dni || '-',
          type: 'info',
        },
      ],
    },
    {
      title: t('profile.children'),
      items: children.map(child => ({
        icon: 'face' as const,
        label: `${child.firstName} ${child.lastName}`,
        value: child.grade ? `${child.grade}` : '-',
        type: 'action' as const,
        onPress: () => {
          // TODO: Navigate to child details
        },
      })),
    },
    {
      title: t('profile.settings'),
      items: [
        {
          icon: 'notifications',
          label: t('profile.notifications'),
          type: 'switch',
          switchValue: notificationsEnabled,
          onSwitchChange: setNotificationsEnabled,
        },
        {
          icon: 'mail',
          label: t('profile.emailNotifications'),
          type: 'switch',
          switchValue: emailNotifications,
          onSwitchChange: setEmailNotifications,
        },
        {
          icon: 'lock',
          label: t('profile.changePassword'),
          type: 'action',
          onPress: () => {},
        },
        {
          icon: 'language',
          label: t('profile.language'),
          value: t(`languages.${i18n.language}`),
          type: 'action',
          onPress: () => setShowLanguageModal(true),
        },
      ],
    },
    {
      title: t('profile.support'),
      items: [
        {
          icon: 'help',
          label: t('profile.helpCenter'),
          type: 'action',
          onPress: () => {},
        },
        {
          icon: 'chat',
          label: t('profile.contactSupport'),
          type: 'action',
          onPress: () => {},
        },
        {
          icon: 'description',
          label: t('profile.termsConditions'),
          type: 'action',
          onPress: () => {},
        },
        {
          icon: 'privacy-tip',
          label: t('profile.privacyPolicy'),
          type: 'action',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderProfileItem = (item: ProfileItem, isLast: boolean) => {
    if (item.type === 'switch') {
      return (
        <View key={item.label} style={[styles.itemContainer, !isLast && styles.itemBorder]}>
          <View style={styles.itemLeft}>
            <Icon name={item.icon} size={22} color={tokens.color.primary} />
            <Text style={styles.itemLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchChange}
            trackColor={{ false: tokens.color.gray200, true: tokens.color.success }}
            thumbColor="#fff"
          />
        </View>
      );
    }

    const content = (
      <View style={[styles.itemContainer, !isLast && styles.itemBorder]}>
        <View style={styles.itemLeft}>
          <Icon name={item.icon} size={22} color={tokens.color.primary} />
          <Text style={styles.itemLabel}>{item.label}</Text>
        </View>
        <View style={styles.itemRight}>
          {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
          {item.type === 'action' && (
            <Icon name="chevron-right" size={20} color="#C7C7CC" />
          )}
        </View>
      </View>
    );

    if (item.type === 'action') {
      return (
        <TouchableOpacity key={item.label} onPress={item.onPress}>
          {content}
        </TouchableOpacity>
      );
    }

    return <View key={item.label}>{content}</View>;
  };

  if ((loading && !refreshing) || !ready) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={tokens.color.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <IOSHeader
        title={t('profile.title')}
        scrollY={scrollY}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: totalHeaderHeight,
          paddingBottom: 100,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.largeTitleContainer}>
          <Text style={styles.largeTitle}>{t('profile.title')}</Text>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/120' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : t('common.loading')}
          </Text>
          <Text style={styles.userRole}>{t('profile.motherRole')}</Text>
        </View>

        {profileSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) =>
                renderProfileItem(item, index === section.items.length - 1)
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            {t('common.version')} {Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text style={styles.buildText}>
            {t('common.build')} {Constants.expoConfig?.ios?.buildNumber || '1'}
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Icon name="close" size={24} color={tokens.color.textSecondary} />
              </TouchableOpacity>
            </View>

            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageOption,
                  i18n.language === language && styles.selectedLanguageOption,
                ]}
                onPress={() => handleLanguageChange(language)}
              >
                <Text style={[
                  styles.languageText,
                  i18n.language === language && styles.selectedLanguageText,
                ]}>
                  {t(`languages.${language}`)}
                </Text>
                {i18n.language === language && (
                  <Icon name="check" size={20} color={tokens.color.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  largeTitleContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: tokens.color.black,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E5EA',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: tokens.color.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: tokens.color.black,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: tokens.color.gray400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.color.gray400,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  itemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 16,
    color: tokens.color.black,
    marginLeft: 12,
    flex: 1,
  },
  itemValue: {
    fontSize: 15,
    color: tokens.color.gray400,
    marginRight: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 13,
    color: tokens.color.gray400,
    marginBottom: 2,
  },
  buildText: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.color.black,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedLanguageOption: {
    backgroundColor: '#F2F2F7',
  },
  languageText: {
    fontSize: 16,
    color: tokens.color.black,
  },
  selectedLanguageText: {
    color: tokens.color.primary,
    fontWeight: '600',
  },
});