import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSHeader from '@/components/IOSHeader';
import { tokens } from '@/theme/tokens';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { NewsService } from '@/services/news.service';
import { News } from '@/config/api';
import { showToast } from '@/utils/toast';

type NewsDetailScreenRouteProp = RouteProp<RootStackParamList, 'NewsDetail'>;

// Adapter interface to match the existing NewsDetailScreen expectations
interface NewsDetailItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  date: Date;
  author: string;
  category: string;
}

export default function NewsDetailScreen() {
  const route = useRoute<NewsDetailScreenRouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { newsId } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;

  const [news, setNews] = useState<NewsDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadNewsDetail();
  }, [newsId]);

  // Transform backend news to match the screen's expected format
  const transformNews = (backendNews: News): NewsDetailItem => {
    const publishedDate = parseISO(backendNews.publishedAt);

    return {
      id: backendNews.id,
      title: backendNews.title,
      content: backendNews.content,
      imageUrl: undefined, // Backend doesn't provide images yet
      date: publishedDate,
      author: backendNews.author ? `${backendNews.author.firstName} ${backendNews.author.lastName}` : t('news.unknownAuthor'),
      category: determineCategory(backendNews.title, backendNews.content),
    };
  };

  const determineCategory = (title: string, content: string): string => {
    const lowercaseTitle = title.toLowerCase();
    const lowercaseContent = content.toLowerCase();

    if (lowercaseTitle.includes('evento') || lowercaseContent.includes('evento')) {
      return t('news.events');
    }
    if (lowercaseTitle.includes('academico') || lowercaseContent.includes('academico')) {
      return t('news.academic');
    }
    if (lowercaseTitle.includes('noticia') || lowercaseContent.includes('noticia')) {
      return t('news.news');
    }
    return t('news.general');
  };

  const loadNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const backendNews = await NewsService.getNewsById(newsId);
      if (backendNews) {
        const transformedNews = transformNews(backendNews);
        setNews(transformedNews);

        // Mark as read
        await NewsService.markAsRead(newsId);
      } else {
        setError(t('news.notFound'));
      }
    } catch (err) {
      console.error('Error loading news detail:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadNewsDetail();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <IOSHeader
          title={t('news.detail')}
          scrollY={scrollY}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 44 }]}>
          <ActivityIndicator size="large" color={tokens.color.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error || !news) {
    return (
      <View style={styles.container}>
        <IOSHeader
          title={t('news.detail')}
          scrollY={scrollY}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={[styles.errorContainer, { paddingTop: insets.top + 44 }]}>
          <Icon name="error-outline" size={64} color={tokens.color.gray400} />
          <Text style={styles.errorText}>{error || t('news.notFound')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Icon name="refresh" size={20} color={tokens.color.white} />
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <IOSHeader
        title={news.title}
        scrollY={scrollY}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: insets.top + 44 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {news.imageUrl && (
          <Image source={{ uri: news.imageUrl }} style={styles.image} />
        )}

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{news.category}</Text>
          </View>

          <Text style={styles.title}>{news.title}</Text>

          <View style={styles.metadata}>
            <Text style={styles.author}>{news.author}</Text>
            <Text style={styles.date}>
              {format(news.date, "d 'de' MMMM, yyyy", { locale: getDateLocale() })}
            </Text>
          </View>

          <Text style={styles.body}>{news.content}</Text>
        </View>
      </Animated.ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: tokens.color.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: tokens.color.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    backgroundColor: tokens.color.white,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadge: {
    backgroundColor: tokens.color.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: tokens.color.white,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: tokens.color.textPrimary,
    marginBottom: 12,
    lineHeight: 30,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.gray200,
  },
  author: {
    fontSize: 14,
    color: tokens.color.textSecondary,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: tokens.color.textSecondary,
    textTransform: 'capitalize',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.color.textPrimary,
  },
});