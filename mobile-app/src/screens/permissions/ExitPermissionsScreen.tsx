import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Animated,
  TouchableOpacity,
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

interface ExitPermission {
  id: string;
  studentName: string;
  studentId?: string;
  grade: string;
  requestDate: Date;
  exitDate: Date;
  exitTime: string;
  returnTime?: string;
  authorizedPerson: string;
  authorizedPersonDNI: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  isRead?: boolean;
}

const mockPermissions: ExitPermission[] = [
  {
    id: '1',
    studentName: 'Juan Pérez',
    studentId: '1',
    grade: '3er Grado B',
    requestDate: new Date(Date.now() - 86400000),
    exitDate: new Date(Date.now() + 86400000),
    exitTime: '14:00',
    returnTime: '16:00',
    authorizedPerson: 'María Pérez',
    authorizedPersonDNI: '12345678',
    reason: 'Cita médica',
    status: 'approved',
    isRead: true,
  },
  {
    id: '2',
    studentName: 'María Pérez',
    studentId: '2',
    grade: '5to Grado A',
    requestDate: new Date(),
    exitDate: new Date(Date.now() + 172800000),
    exitTime: '11:30',
    authorizedPerson: 'Carlos García',
    authorizedPersonDNI: '87654321',
    reason: 'Trámite familiar urgente',
    status: 'pending',
    isRead: false,
  },
  {
    id: '3',
    studentName: 'Luis Rodríguez',
    grade: '2do Grado C',
    requestDate: new Date(Date.now() - 172800000),
    exitDate: new Date(Date.now() - 86400000),
    exitTime: '15:00',
    authorizedPerson: 'Ana Rodríguez',
    authorizedPersonDNI: '11223344',
    reason: 'Viaje familiar',
    status: 'rejected',
    comments: 'No se presentó documentación requerida',
  },
  {
    id: '4',
    studentName: 'María López',
    grade: '4to Grado B',
    requestDate: new Date(Date.now() - 259200000),
    exitDate: new Date(Date.now() - 172800000),
    exitTime: '12:00',
    returnTime: '14:30',
    authorizedPerson: 'Pedro López',
    authorizedPersonDNI: '44556677',
    reason: 'Cita con especialista',
    status: 'approved',
  },
];

export default function ExitPermissionsScreen() {
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

  const filteredPermissions = useMemo(() => {
    if (selectedFilter === 'all') return mockPermissions;
    if (selectedFilter === 'unread') return mockPermissions.filter(p => !p.isRead);
    if (selectedFilter.startsWith('student-')) {
      const studentId = selectedFilter.split('-')[1];
      return mockPermissions.filter(p => p.studentId === studentId);
    }
    return mockPermissions;
  }, [selectedFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return tokens.color.success;
      case 'rejected':
        return tokens.color.danger;
      case 'pending':
        return tokens.color.warning;
      default:
        return tokens.color.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return t('permissions.status.approved');
      case 'rejected':
        return t('permissions.status.rejected');
      case 'pending':
        return t('permissions.status.pending');
      default:
        return status;
    }
  };

  const renderPermissionCard = (permission: ExitPermission) => (
    <TouchableOpacity
      key={permission.id}
      style={styles.card}
      onPress={() => {}}
    >
      <View style={styles.cardHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{permission.studentName}</Text>
          <Text style={styles.grade}>{permission.grade}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(permission.status) }]}>
          <Text style={styles.statusText}>{getStatusText(permission.status)}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Icon name="event" size={16} color={tokens.color.gray400} />
          <Text style={styles.infoText}>
            {t('permissions.exitDate')}: {format(permission.exitDate, "d MMM", { locale: getDateLocale() })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="access-time" size={16} color={tokens.color.gray400} />
          <Text style={styles.infoText}>
            {permission.exitTime}
            {permission.returnTime && ` - ${permission.returnTime}`}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="person" size={16} color={tokens.color.gray400} />
          <Text style={styles.infoText}>
            {permission.authorizedPerson} ({t('permissions.dni')}: {permission.authorizedPersonDNI})
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="info-outline" size={16} color={tokens.color.gray400} />
          <Text style={styles.infoText}>{permission.reason}</Text>
        </View>

        {permission.comments && (
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsLabel}>{t('permissions.comments')}:</Text>
            <Text style={styles.commentsText}>{permission.comments}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.requestDate}>
          {t('permissions.requestedDate')} {format(permission.requestDate, "d MMM 'a las' HH:mm", { locale: getDateLocale() })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header Bar */}
      <IOSHeader title={t('permissions.title')} scrollY={scrollY} />
      <Animated.FlatList
        data={filteredPermissions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderPermissionCard(item)}
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
              <Text style={styles.largeTitle}>{t('permissions.title')}</Text>
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
              accessibilityLabel={`${t('events.filterBy')} ${filter.label}`}
            />
          ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>{t('permissions.empty')}</Text>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => navigation.navigate('CreateExitPermission' as never)}
              accessibilityRole="button"
              accessibilityLabel={t('permissions.create')}
            >
              <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateExitPermission' as never)}
        accessibilityRole="button"
        accessibilityLabel={t('permissions.create')}
      >
        <Icon name="add" size={24} color="#fff" />
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
  filterChip: {
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
  filterChipSelected: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: tokens.color.white,
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  permissionsList: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: tokens.color.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.color.black,
    marginBottom: 4,
  },
  grade: {
    fontSize: 14,
    color: tokens.color.gray400,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: tokens.color.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: tokens.color.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  commentsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
  },
  commentsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  commentsText: {
    fontSize: 13,
    color: '#856404',
  },
  cardFooter: {
    padding: 16,
    paddingTop: 0,
  },
  requestDate: {
    fontSize: 12,
    color: tokens.color.textMuted,
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
