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
import { tokens } from '@/theme/tokens';
import { ReportsService } from '@/services/reports.service';
import { AuthService } from '@/services/auth.service';
import { Report } from '@/config/api';
import { showToast } from '@/utils/toast';

const { width } = Dimensions.get('window');

// Adapter interface to match the existing ReportsScreen expectations
interface ReportItem {
  id: string;
  title: string;
  type: 'bulletin' | 'attendance' | 'behavior' | 'medical' | 'progress';
  studentName: string;
  studentId?: string;
  grade: string;
  period: string;
  date: Date;
  status: 'available' | 'pending' | 'draft';
  downloadUrl?: string;
  summary?: string;
  isRead?: boolean;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}


export default function ReportsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  const filters = useMemo(() => {
    const baseFilters = [
      { key: 'all', label: t('common.all'), icon: 'filter-list' },
      { key: 'unread', label: t('messages.unread'), icon: 'markunread' },
    ];

    const studentFilters = students.map(student => ({
      key: `student-${student.id}`,
      label: `${student.firstName} ${student.lastName}`,
      icon: 'face',
    }));

    return [...baseFilters, ...studentFilters];
  }, [students, t]);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadInitialData();
  }, []);

  // Transform backend report to match the screen's expected format
  const transformReport = (backendReport: Report, student?: Student): ReportItem => {
    const reportDate = parseISO(backendReport.createdAt);

    return {
      id: backendReport.id,
      title: generateReportTitle(backendReport),
      type: mapReportType(backendReport.type),
      studentName: student ? `${student.firstName} ${student.lastName}` : t('reports.unknownStudent'),
      studentId: backendReport.studentId,
      grade: student?.grade || t('reports.unknownGrade'),
      period: backendReport.period || t('reports.currentPeriod'),
      date: reportDate,
      status: mapReportStatus(backendReport.status),
      downloadUrl: backendReport.fileUrl,
      summary: backendReport.summary,
      isRead: true, // Backend doesn't track read status yet
    };
  };

  const generateReportTitle = (report: Report): string => {
    switch (report.type) {
      case 'grade_report':
        return t('reports.gradeReport');
      case 'attendance_report':
        return t('reports.attendanceReport');
      case 'behavior_report':
        return t('reports.behaviorReport');
      case 'general_report':
      default:
        return t('reports.generalReport');
    }
  };

  const mapReportType = (backendType: string): ReportItem['type'] => {
    switch (backendType) {
      case 'grade_report':
        return 'bulletin';
      case 'attendance_report':
        return 'attendance';
      case 'behavior_report':
        return 'behavior';
      case 'general_report':
      default:
        return 'progress';
    }
  };

  const mapReportStatus = (backendStatus: string): ReportItem['status'] => {
    switch (backendStatus) {
      case 'published':
        return 'available';
      case 'draft':
        return 'draft';
      case 'pending':
      default:
        return 'pending';
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStudents(), loadReports()]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const children = await AuthService.getUserChildren();
      setStudents(children);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadReports = async () => {
    try {
      const backendReports = await ReportsService.getReports();
      const children = await AuthService.getUserChildren();

      // Create a map of students for quick lookup
      const studentMap = new Map(children.map(student => [student.id, student]));

      // Transform backend reports to match screen format
      const transformedReports = backendReports.map(report =>
        transformReport(report, studentMap.get(report.studentId))
      );

      setReports(transformedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      showToast(t('common.error'), 'error');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadReports();
    } catch (error) {
      console.error('Error refreshing reports:', error);
      showToast(t('common.error'), 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredReports = useMemo(() => {
    if (selectedFilter === 'all') return reports;
    if (selectedFilter === 'unread') return reports.filter(report => !report.isRead);
    if (selectedFilter.startsWith('student-')) {
      const studentId = selectedFilter.split('-')[1];
      return reports.filter(report => report.studentId === studentId);
    }
    return reports;
  }, [selectedFilter, reports]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bulletin':
        return 'school';
      case 'attendance':
        return 'event-available';
      case 'behavior':
        return 'psychology';
      case 'medical':
        return 'local-hospital';
      case 'progress':
        return 'trending-up';
      default:
        return 'description';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bulletin':
        return tokens.color.primary;
      case 'attendance':
        return tokens.color.success;
      case 'behavior':
        return tokens.color.warning;
      case 'medical':
        return tokens.color.danger;
      case 'progress':
        return tokens.color.info;
      default:
        return tokens.color.gray400;
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const fileUrl = await ReportsService.downloadReport(reportId);
      if (fileUrl) {
        // Here you would implement the actual file download
        // For now, just show a success message
        showToast(t('reports.downloadStarted'), 'success');
      } else {
        showToast(t('reports.downloadFailed'), 'error');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      showToast(t('reports.downloadFailed'), 'error');
    }
  };

  const renderReportCard = (report: ReportItem) => (
    <TouchableOpacity
      key={report.id}
      style={styles.card}
      onPress={() => {}}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor(report.type)}15` }]}>
          <Icon name={getTypeIcon(report.type)} size={24} color={getTypeColor(report.type)} />
        </View>

        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.studentName}>{report.studentName} - {report.grade}</Text>
          <Text style={styles.period}>{report.period}</Text>

          {report.summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summary}>{report.summary}</Text>
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={styles.date}>
              {format(report.date, "d 'de' MMMM", { locale: getDateLocale() })}
            </Text>

            {report.status === 'available' && report.downloadUrl && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownloadReport(report.id)}
              >
                <Icon name="download" size={18} color={tokens.color.primary} />
                <Text style={styles.downloadText}>{t('reports.download')}</Text>
              </TouchableOpacity>
            )}

            {report.status === 'pending' && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>{t('reports.pending')}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header Bar */}
      <IOSHeader title={t('reports.title')} scrollY={scrollY} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.color.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <Animated.FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderReportCard(item)}
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
              <Text style={styles.largeTitle}>{t('reports.title')}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setSelectedFilter(filter.key)}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter.key && styles.filterChipSelected
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('events.filterBy')} ${filter.label}`}
                >
                  <Icon
                    name={filter.icon}
                    size={16}
                    color={selectedFilter === filter.key ? '#fff' : '#666'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[
                    styles.filterChipText,
                    selectedFilter === filter.key && styles.filterChipTextSelected
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="folder-open" size={64} color="#C7C7CC" />
              <Text style={styles.emptyText}>{t('reports.empty')}</Text>
            </View>
          }
        />
      )}
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
  reportsList: {
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
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 14,
    color: tokens.color.textSecondary,
    marginBottom: 2,
  },
  period: {
    fontSize: 13,
    color: tokens.color.textMuted,
    marginBottom: 8,
  },
  summaryContainer: {
    backgroundColor: tokens.color.gray50,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  summary: {
    fontSize: 13,
    color: tokens.color.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: tokens.color.textMuted,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  downloadText: {
    fontSize: 13,
    color: tokens.color.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  pendingBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pendingText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: tokens.color.textSecondary,
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
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
    gap: 8,
  },
  reloadButtonText: {
    color: tokens.color.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
