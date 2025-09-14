import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSHeader from '@/components/IOSHeader';
import FilterChip from '@/components/ui/FilterChip';
import { tokens } from '@/theme/tokens';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  preview: string;
  timestamp: Date;
  unread: boolean;
  avatar?: string;
  isTeacher?: boolean;
  studentId?: string;
  studentName?: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    senderName: 'Prof. María García',
    senderRole: 'Profesora de Matemáticas',
    preview: 'Recordatorio: La tarea de fracciones es para mañana',
    timestamp: new Date(Date.now() - 3600000),
    unread: true,
    isTeacher: true,
    studentId: '1',
    studentName: 'Juan Pérez',
  },
  {
    id: '2',
    senderName: 'Coordinación Académica',
    senderRole: 'Administración',
    preview: 'Se ha actualizado el calendario de exámenes del segundo trimestre',
    timestamp: new Date(Date.now() - 7200000),
    unread: true,
    isTeacher: false,
  },
  {
    id: '3',
    senderName: 'Prof. Juan Pérez',
    senderRole: 'Profesor de Educación Física',
    preview: 'Por favor traer el uniforme deportivo completo para la clase',
    timestamp: new Date(Date.now() - 86400000),
    unread: false,
    isTeacher: true,
    studentId: '2',
    studentName: 'María Pérez',
  },
  {
    id: '4',
    senderName: 'Dirección',
    senderRole: 'Directora',
    preview: 'Información importante sobre las actividades del mes',
    timestamp: new Date(Date.now() - 172800000),
    unread: false,
    isTeacher: false,
  },
  {
    id: '5',
    senderName: 'Prof. Ana Rodríguez',
    senderRole: 'Profesora de Inglés',
    preview: 'Great job on today\'s presentation! Keep up the good work',
    timestamp: new Date(Date.now() - 259200000),
    unread: false,
    isTeacher: true,
  },
];

export default function MessagesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Get the appropriate date locale based on current language
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'pt': return pt;
      case 'fr': return fr;
      case 'it': return it;
      default: return es;
    }
  };

  const filters = [
    { key: 'all', label: t('common.all'), icon: 'filter-list' },
    { key: 'unread', label: t('messages.unread'), icon: 'markunread' },
    { key: 'student-1', label: 'Juan Pérez', icon: 'face' },
    { key: 'student-2', label: 'María Pérez', icon: 'face' },
  ];

  const scrollY = useRef(new Animated.Value(0)).current;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const filteredMessages = useMemo(() => {
    if (selectedFilter === 'all') return mockMessages;
    if (selectedFilter === 'unread') return mockMessages.filter(msg => msg.unread);
    if (selectedFilter.startsWith('student-')) {
      const studentId = selectedFilter.split('-')[1];
      return mockMessages.filter(msg => msg.studentId === studentId);
    }
    return mockMessages;
  }, [selectedFilter]);

  const getTimeString = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 48) {
      return t('common.yesterday');
    } else if (diffInHours < 168) {
      return format(date, 'EEEE', { locale: getDateLocale() });
    } else {
      return format(date, 'd MMM', { locale: getDateLocale() });
    }
  };

  const renderMessage = (message: Message) => (
    <TouchableOpacity
      key={message.id}
      onPress={() => navigation.navigate('Chat' as never, {
        chatId: message.id,
        recipientName: message.senderName
      } as never)}
      style={styles.messageContainer}
    >
      <View style={styles.avatarContainer}>
        {message.avatar ? (
          <Image source={{ uri: message.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, message.isTeacher && styles.teacherAvatar]}>
            <Text style={styles.avatarText}>
              {message.senderName.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Text>
          </View>
        )}
        {message.unread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <Text style={[styles.senderName, message.unread && styles.unreadText]}>
              {message.senderName}
            </Text>
            <Text style={styles.senderRole}>{message.senderRole}</Text>
          </View>
          <Text style={[styles.timestamp, message.unread && styles.unreadTimestamp]}>
            {getTimeString(message.timestamp)}
          </Text>
        </View>
        <Text style={[styles.preview, message.unread && styles.unreadText]} numberOfLines={2}>
          {message.preview}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header Bar */}
      <IOSHeader title={t('messages.title')} scrollY={scrollY} />
      <Animated.FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderMessage(item)}
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 24 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <>
            <View style={styles.largeTitleContainer}>
              <Text style={styles.largeTitle}>{t('messages.title')}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
          {filters.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              icon={filter.icon}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              accessibilityLabel={`${t('messages.filterBy')} ${filter.label}`}
            />
          ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          refreshing ? (
            <View style={styles.emptyContainer}>
              <Icon name="mail-outline" size={64} color={tokens.color.gray300} />
              <Text style={styles.emptyText}>{t('messages.loadingMessages')}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="mail-outline" size={64} color={tokens.color.gray300} />
              <Text style={styles.emptyText}>{t('messages.empty')}</Text>
              <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('NewMessage' as never)}
                accessibilityRole="button"
                accessibilityLabel={t('messages.createMessage')}
              >
                <Icon name="edit" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewMessage' as never)}
        accessibilityRole="button"
        accessibilityLabel={t('messages.createMessage')}
      >
        <Icon name="edit" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.gray50,
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
    color: tokens.color.textPrimary,
  },
  filterContainer: {
    height: 44,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  filterText: {
    fontSize: 14,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: tokens.color.white,
  },
  badge: {
    backgroundColor: tokens.color.danger,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: {
    color: tokens.color.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  messagesList: {
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    backgroundColor: tokens.color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.color.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherAvatar: {
    backgroundColor: tokens.color.primary,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.color.white,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.color.primary,
    borderWidth: 2,
    borderColor: tokens.color.white,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  senderInfo: {
    flex: 1,
    marginRight: 8,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '500',
    color: tokens.color.textPrimary,
    marginBottom: 2,
  },
  senderRole: {
    fontSize: 12,
    color: tokens.color.textMuted,
  },
  timestamp: {
    fontSize: 13,
    color: tokens.color.textMuted,
  },
  unreadTimestamp: {
    color: tokens.color.primary,
    fontWeight: '600',
  },
  preview: {
    fontSize: 14,
    color: tokens.color.textSecondary,
    lineHeight: 18,
  },
  unreadText: {
    fontWeight: '600',
    color: tokens.color.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 17,
    color: tokens.color.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
