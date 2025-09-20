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
import { format, isSameDay, parseISO } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSHeader from '@/components/IOSHeader';
import Calendar from '@/components/Calendar';
import FilterChip from '@/components/ui/FilterChip';
import Card from '@/components/ui/Card';
import { tokens } from '@/theme/tokens';
import { CardSkeletonList } from '@/components/ui/Skeleton';
import { EventsService } from '@/services/events.service';
import { Event } from '@/config/api';
import { AuthService } from '@/services/auth.service';

const { width } = Dimensions.get('window');

// Adapter interface to match the existing EventsScreen expectations
interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  category: string;
  imageUrl?: string;
  attendees?: number;
  maxAttendees?: number;
  isRegistered?: boolean;
  isRead?: boolean;
  studentId?: string;
  studentName?: string;
}

export default function EventsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

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

  // Load events from the backend
  const loadEvents = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const backendEvents = await EventsService.getEvents(month, year);

      // Transform backend events to match the screen's expected format
      const transformedEvents: EventItem[] = backendEvents.map(event => {
        const startDate = parseISO(event.startDate);
        const endDate = parseISO(event.endDate);

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          date: startDate,
          time: format(startDate, 'HH:mm') + ' - ' + format(endDate, 'HH:mm'),
          category: determineCategory(event.title, event.description),
          imageUrl: undefined, // Backend doesn't provide images yet
          attendees: event.attendeeCount,
          maxAttendees: undefined, // Backend doesn't provide max attendees yet
          isRegistered: event.isRegistered,
          isRead: true, // Default to read for now
          studentId: undefined, // Backend doesn't provide student association yet
          studentName: undefined,
        };
      });

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      // Fall back to empty array on error
      setEvents([]);
    } finally {
      setLoading(false);
    }
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

  // Determine category based on title and description
  const determineCategory = (title: string, description: string): string => {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('festival') || text.includes('fiesta')) return 'Festival';
    if (text.includes('reunión') || text.includes('meeting') || text.includes('junta')) return 'Reunión';
    if (text.includes('deporte') || text.includes('sport') || text.includes('fútbol') || text.includes('basket')) return 'Deportes';
    if (text.includes('cultur') || text.includes('arte') || text.includes('música')) return 'Cultural';
    return 'General';
  };

  useEffect(() => {
    loadEvents();
    loadStudents();
  }, []);

  const filters = useMemo(() => {
    const baseFilters = [
      { key: 'all', label: t('events.filters.all'), icon: 'filter-list' },
      { key: 'unread', label: t('events.filters.unread'), icon: 'markunread' },
    ];

    // Add student filters if we have students
    const studentFilters = students.map((student, index) => ({
      key: `student-${student.id || index}`,
      label: student.name || `Student ${index + 1}`,
      icon: 'face',
    }));

    return [...baseFilters, ...studentFilters];
  }, [students, t]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (selectedFilter === 'unread') {
      filtered = filtered.filter(item => !item.isRead);
    } else if (selectedFilter.startsWith('student-')) {
      const studentId = selectedFilter.split('-')[1];
      filtered = filtered.filter(item => item.studentId === studentId);
    }

    if (selectedDate) {
      filtered = filtered.filter(item => isSameDay(item.date, selectedDate));
    }

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, selectedFilter, selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Scroll to events section
    scrollViewRef.current?.scrollTo({ y: 400, animated: true });
  };

  const getCategoryLabel = (category: string) => {
    const categoryKey = category.toLowerCase();
    switch (categoryKey) {
      case 'festival':
        return t('events.categories.festival');
      case 'reunión':
      case 'meeting':
        return t('events.categories.meeting');
      case 'deportes':
      case 'sports':
        return t('events.categories.sports');
      case 'cultural':
        return t('events.categories.cultural');
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Festival':
        return tokens.color.warning;
      case 'Reunión':
        return tokens.color.primary;
      case 'Deportes':
        return tokens.color.success;
      case 'Cultural':
        return tokens.color.info;
      default:
        return tokens.color.gray400;
    }
  };

  const renderEventCard = (item: EventItem) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => navigation.navigate('EventDetail' as never, { eventId: item.id, event: item } as never)}
      style={styles.cardTouchable}
    >
      <Card>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.categoryText}>{getCategoryLabel(item.category).toUpperCase()}</Text>
            </View>
            {!item.isRead && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{t('common.new')}</Text>
              </View>
            )}
            {item.isRegistered && (
              <View style={styles.registeredBadge}>
                <Icon name="check-circle" size={14} color={tokens.color.success} />
                <Text style={styles.registeredText}>{t('events.registered')}</Text>
              </View>
            )}
            {item.studentName && (
              <Text style={styles.studentTag}>{item.studentName}</Text>
            )}
          </View>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Icon name="event" size={16} color={tokens.color.gray400} />
              <Text style={styles.detailText}>
                {format(item.date, "d 'de' MMMM", { locale: getDateLocale() })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="access-time" size={16} color={tokens.color.gray400} />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={tokens.color.gray400} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          </View>

          {item.maxAttendees && item.attendees !== undefined && (
            <View style={styles.attendeesContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(item.attendees / item.maxAttendees) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.attendeesText}>
                {t('events.attendees', { current: item.attendees, max: item.maxAttendees })}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const calendarEvents = events.map(event => ({
    id: event.id,
    date: event.date,
    title: event.title,
  }));

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={tokens.color.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <IOSHeader title={t('events.title')} scrollY={scrollY} />

      <Animated.FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderEventCard(item)}
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
              <Text style={styles.largeTitle}>{t('events.title')}</Text>
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
                  accessibilityLabel={`${t('events.filterBy')} ${filter.label}`}
                />
              ))}
            </ScrollView>
            <Calendar
              events={calendarEvents}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
            {selectedDate && (
              <View style={styles.selectedDateHeader}>
                <Text style={styles.selectedDateText}>
                  {t('events.eventsOn', { date: format(selectedDate, "d 'de' MMMM", { locale: getDateLocale() }) })}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDate(null)} accessibilityRole="button" accessibilityLabel={t('events.viewAll')}>
                  <Text style={styles.clearDateText}>{t('events.viewAll')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          refreshing ? (
            <CardSkeletonList />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="event-busy" size={64} color={tokens.color.gray300} />
              <Text style={styles.emptyText}>
                {selectedDate
                  ? t('events.emptyDate', { date: format(selectedDate, "d 'de' MMMM", { locale: getDateLocale() }) })
                  : t('events.empty')}
              </Text>
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
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.color.textPrimary,
  },
  clearDateText: {
    fontSize: 14,
    color: tokens.color.primary,
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
  eventsList: {
    paddingHorizontal: 16,
  },
  cardTouchable: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: tokens.color.white,
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
  cardHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    color: tokens.color.white,
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: tokens.color.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unreadText: {
    fontSize: 10,
    color: tokens.color.white,
    fontWeight: 'bold',
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  registeredText: {
    color: tokens.color.success,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
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
  cardDescription: {
    fontSize: 15,
    color: tokens.color.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: tokens.color.textMuted,
    marginLeft: 8,
  },
  attendeesContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: tokens.color.gray200,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.primary,
    borderRadius: 2,
  },
  attendeesText: {
    fontSize: 11,
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
    textAlign: 'center',
  },
});