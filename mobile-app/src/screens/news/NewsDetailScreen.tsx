import React from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import { tokens } from '@/theme/tokens';
import { RootStackParamList } from '@/navigation/AppNavigator';

type NewsDetailScreenRouteProp = RouteProp<RootStackParamList, 'NewsDetail'>;

// Mock data - en producci�n vendr�a del backend
const mockNewsDetail = {
  id: '1',
  title: 'Evento Anual del Colegio 2024',
  content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  imageUrl: 'https://via.placeholder.com/400x200',
  date: new Date(),
  author: 'Administraci�n',
  category: 'Eventos',
};

export default function NewsDetailScreen() {
  const route = useRoute<NewsDetailScreenRouteProp>();
  const { t, i18n } = useTranslation();
  const { newsId } = route.params;

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

  // En producci�n, aqu� har�as una llamada a la API con el newsId
  const news = mockNewsDetail;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: news.imageUrl }} style={styles.image} />

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
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
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  author: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});