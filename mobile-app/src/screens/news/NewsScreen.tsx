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
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import FilterChip from '@/components/ui/FilterChip';
import Card from '@/components/ui/Card';
import { tokens } from '@/theme/tokens';
import { CardSkeletonList } from '@/components/ui/Skeleton';
import { mockNews, mockStudents, type MockNewsItem } from '@/data/mockData';

const { width } = Dimensions.get('window');

export default function NewsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { totalHeaderHeight } = useHeaderHeight();
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

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

  const filters = [
    { key: 'all', label: t('news.categories.all'), icon: 'filter-list' },
    { key: 'unread', label: t('common.new'), icon: 'markunread' },
    ...mockStudents.map(student => ({
      key: `student-${student.id}`,
      label: student.name,
      icon: 'face' as const
    }))
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const filteredNews = useMemo(() => {
    if (selectedFilter === 'all') return mockNews;
    if (selectedFilter === 'unread') return mockNews.filter(item => !item.isRead);
    if (selectedFilter.startsWith('student-')) {
      const studentId = selectedFilter.split('-')[1];
      return mockNews.filter(item => item.studentId === studentId);
    }
    return mockNews as MockNewsItem[];
  }, [selectedFilter]);

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
