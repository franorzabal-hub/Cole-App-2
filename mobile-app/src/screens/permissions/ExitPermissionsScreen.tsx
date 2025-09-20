import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format, parseISO } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSHeader from '@/components/IOSHeader';
import FilterChip from '@/components/ui/FilterChip';
import { tokens } from '@/theme/tokens';
import { ExitsService } from '@/services/exits.service';
import { AuthService } from '@/services/auth.service';
import { ExitPermission as BackendExitPermission, Student } from '@/config/api';
import { CardSkeletonList } from '@/components/ui/Skeleton';

const { width } = Dimensions.get('window');

// Adapter interface to match the existing ExitPermissionsScreen expectations
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

export default function ExitPermissionsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [permissions, setPermissions] = useState<ExitPermission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

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

  // Transform backend exit permission to screen format
  const transformExitPermission = (backendPermission: BackendExitPermission): ExitPermission => {
    const createdDate = parseISO(backendPermission.createdAt);
    const exitDate = parseISO(backendPermission.exitDate);

    return {
      id: backendPermission.id,
      studentName: `${backendPermission.student.firstName} ${backendPermission.student.lastName}`,
      studentId: backendPermission.student.id,
      grade: backendPermission.student.grade || t('profile.noGradeInfo'),
      requestDate: createdDate,
      exitDate: exitDate,
      exitTime: backendPermission.exitTime || '',
      returnTime: backendPermission.returnTime || undefined,
      authorizedPerson: backendPermission.authorizedPersonName,
      authorizedPersonDNI: backendPermission.authorizedPersonDocument || '',
      reason: backendPermission.reason || '',
      status: backendPermission.status as 'pending' | 'approved' | 'rejected',
      comments: undefined, // Backend doesn't provide comments field yet
      isRead: true, // Default to read for now
    };
  };

  // Load exit permissions from the backend
  const loadExitPermissions = async () => {
    try {
      setLoading(true);
      const backendPermissions = await ExitsService.getExitPermissions('all');

      // Transform backend permissions to match the screen's expected format
      const transformedPermissions = backendPermissions.map(transformExitPermission);

      setPermissions(transformedPermissions);
    } catch (error) {
      console.error('Error loading exit permissions:', error);
      // Fall back to empty array on error
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load students for filtering
  const loadStudents = async () => {
    try {
      const userChildren = await AuthService.getUserChildren();
      setStudents(userChildren);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    }
  };

  useEffect(() => {
    loadExitPermissions();
    loadStudents();
  }, []);

  const filters = useMemo(() => {
    const baseFilters = [
      { key: 'all', label: t('common.all'), icon: 'filter-list' },
      { key: 'pending', label: t('permissions.status.pending'), icon: 'schedule' },
      { key: 'approved', label: t('permissions.status.approved'), icon: 'check-circle' },
      { key: 'rejected', label: t('permissions.status.rejected'), icon: 'cancel' },
    ];

    // Add student filters if we have students
    const studentFilters = students.map(student => ({
      key: `student-${student.id}`,
      label: `${student.firstName} ${student.lastName}`,
      icon: 'face' as const
    }));

    return [...baseFilters, ...studentFilters];
  }, [students, t]);

  const scrollY = useRef(new Animated.Value(0)).current;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExitPermissions();
    setRefreshing(false);
  };

  const filteredPermissions = useMemo(() => {
    if (selectedFilter === 'all') return permissions;
    if (selectedFilter === 'pending') return permissions.filter(p => p.status === 'pending');
    if (selectedFilter === 'approved') return permissions.filter(p => p.status === 'approved');
    if (selectedFilter === 'rejected') return permissions.filter(p => p.status === 'rejected');
    if (selectedFilter.startsWith('student-')) {
      const studentId = selectedFilter.split('-')[1];
      return permissions.filter(p => p.studentId === studentId);
    }
    return permissions;
  }, [selectedFilter, permissions]);

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

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={tokens.color.primary} />
      </View>
    );
  }

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
          refreshing ? (
            <CardSkeletonList />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="assignment" size={64} color="#C7C7CC" />
              <Text style={styles.emptyText}>{t('permissions.empty')}</Text>
            </View>
          )
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
