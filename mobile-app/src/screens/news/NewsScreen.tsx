import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format, parseISO } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSHeader from '@/components/IOSHeader';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import FilterChip from '@/components/ui/FilterChip';
import Card from '@/components/ui/Card';
import { tokens } from '@/theme/tokens';
import { CardSkeletonList } from '@/components/ui/Skeleton';
import { NewsService } from '@/services/news.service';
import { News } from '@/config/api';

const { width } = Dimensions.get('window');

// Adapter interface to match the existing NewsScreen expectations
interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  authorRole: string;
  category: string;
  publishedAt: Date;
  imageUrl?: string;
  priority: 'normal' | 'high' | 'urgent';
  attachments?: string[];
  isRead?: boolean;
  studentId?: string;
  studentName?: string;
}

export default function NewsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { totalHeaderHeight } = useHeaderHeight();
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  const scrollY = useRef(new Animated.Value(0)).current;

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

  // Load news from the backend
  const loadNews = async () => {
    try {
      setLoading(true);
      const backendNews = await NewsService.getNews('all');

      // Transform backend news to match the screen's expected format
      const transformedNews: NewsItem[] = backendNews.map(item => {
        const publishedDate = parseISO(item.publishedAt);

        return {
          id: item.id,
          title: item.title,
          content: item.content,
          summary: item.content.substring(0, 150) + '...', // Create summary from content
          author: item.author ? `${item.author.firstName} ${item.author.lastName}` : t('news.unknownAuthor'),
          authorRole: item.author?.role || t('news.staff'),
          category: determineCategory(item.title, item.content),
          publishedAt: publishedDate,
          imageUrl: undefined, // Backend doesn't provide images yet
          priority: mapPriority(item.priority),
          attachments: item.attachments,
          isRead: item.isRead,
          studentId: undefined, // Backend doesn't provide student association yet
          studentName: undefined,
        };
      });

      setNews(transformedNews);
    } catch (error) {
      console.error('Error loading news:', error);
      // Fall back to empty array on error
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Map backend priority to UI priority
  const mapPriority = (priority: string): 'normal' | 'high' | 'urgent' => {
    switch (priority) {
      case 'urgent':
        return 'urgent';
      case 'high':
        return 'high';
      default:
        return 'normal';
    }
  };

  // Determine category based on title and content
  const determineCategory = (title: string, content: string): string => {
    const text = (title + ' ' + content).toLowerCase();
    if (text.includes('académ') || text.includes('academic') || text.includes('nota') || text.includes('grade')) return t('news.categories.academic');
    if (text.includes('evento') || text.includes('event') || text.includes('festival')) return t('news.categories.events');
    if (text.includes('deporte') || text.includes('sport')) return t('news.categories.sports');
    if (text.includes('urgente') || text.includes('urgent') || text.includes('importante')) return t('news.categories.urgent');
    return t('news.categories.general');
  };

  // Load students for filtering
  const loadStudents = async () => {
    try {
      // TODO: Implement when students endpoint is available
      // For now, use empty array
      setStudents([]);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  useEffect(() => {
    loadNews();
    loadStudents();
  }, []);

  const filters = useMemo(() => {
    const baseFilters = [
      { key: 'all', label: t('news.categories.all'), icon: 'filter-list' },
      { key: 'unread', label: t('messages.unread'), icon: 'markunread' },
    ];

    // Add student filters if we have students
    const studentFilters = students.map(student => ({
      key: `student-${student.id}`,
      label: student.name,
      icon: 'face' as const
    }));

    return [...baseFilters, ...studentFilters];
  }, [students, t]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const filteredNews = useMemo(() => {
    if (selectedFilter === 'all') return news;
    if (selectedFilter === 'unread') return news.filter(item => !item.isRead);
    if (selectedFilter.startsWith('student-')) {
      const studentId = selectedFilter.split('-')[1];
      return news.filter(item => item.studentId === studentId);
    }
    return news;
  }, [selectedFilter, news]);

  const renderNewsCard = (item: NewsItem) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => navigation.navigate('NewsDetail' as never, { newsId: item.id } as never)}
      style={styles.cardTouchable}
    >
      <Card>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        )}
        <View style={styles.cardContent}>
          {item.priority === 'urgent' && (
            <View style={styles.urgentBadge}>
              <Icon name="priority-high" size={14} color="#fff" />
              <Text style={styles.urgentText}>{t('news.urgent')}</Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            <Text style={styles.cardCategory}>{item.category.toUpperCase()}</Text>
            {!item.isRead && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{t('common.new')}</Text>
              </View>
            )}
            {item.studentName && (
              <Text style={styles.studentTag}>{item.studentName}</Text>
            )}
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSummary} numberOfLines={2}>
            {item.summary}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.cardAuthor}>{item.author}</Text>
            <Text style={styles.cardDate}>
              {format(item.publishedAt, "d MMM", { locale: getDateLocale() })}
            </Text>
          </View>
        </View>
      </Card>
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
      <IOSHeader title={t('news.title')} scrollY={scrollY} />

      <Animated.FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderNewsCard(item)}
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: totalHeaderHeight, paddingBottom: 24 }}
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
              <Text style={styles.largeTitle}>{t('news.title')}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {filters.map((filter) => (
                <FilterChip
                  key={filter.key}
                  label={filter.label}
                  icon={filter.icon}
                  selected={selectedFilter === filter.key}
                  onPress={() => setSelectedFilter(filter.key)}
                  accessibilityLabel={`${t('news.filterBy')} ${filter.label}`}
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
              <Icon name="inbox" size={64} color={tokens.color.gray300} />
              <Text style={styles.emptyText}>{t('news.empty')}</Text>
            </View>
          )
        }
      />
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
  categoriesContainer: {
    height: 44,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  categoryChip: {
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
  categoryChipSelected: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: tokens.color.white,
  },
  newsList: {
    paddingHorizontal: 16,
  },
  cardTouchable: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  urgentText: {
    color: tokens.color.white,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  cardCategory: {
    fontSize: 12,
    color: tokens.color.textMuted,
    fontWeight: '600',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: tokens.color.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  unreadText: {
    fontSize: 10,
    color: tokens.color.white,
    fontWeight: 'bold',
  },
  studentTag: {
    fontSize: 11,
    color: tokens.color.gray500,
    backgroundColor: tokens.color.gray50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginBottom: 8,
  },
  cardSummary: {
    fontSize: 15,
    color: tokens.color.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAuthor: {
    fontSize: 13,
    color: tokens.color.textMuted,
  },
  cardDate: {
    fontSize: 13,
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
});