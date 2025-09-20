import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Modal,
  FlatList,
  Alert,
  Share,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format, parseISO } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSHeader from '@/components/IOSHeader';
import { tokens } from '@/theme/tokens';
import { showToast } from '@/utils/toast';
import { EventsService } from '@/services/events.service';
import { Event } from '@/config/api';
import { RootStackParamList } from '@/navigation/AppNavigator';

type EventDetailScreenRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

interface Attendee {
  id: string;
  name: string;
  avatar?: string;
  type: 'student' | 'parent' | 'teacher';
}

// Adapter interface to match the existing EventDetailScreen expectations
interface EventDetailItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  category: string;
  imageUrl?: string;
  attendees: number;
  maxAttendees: number;
  isRegistered: boolean;
  organizer: string;
  organizerEmail: string;
  organizerPhone?: string;
  requirements?: string;
  price?: string;
}

export default function EventDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<EventDetailScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [event, setEvent] = useState<EventDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [currentAttendees, setCurrentAttendees] = useState(0);

  const { eventId } = route.params || {};

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
    if (eventId) {
      loadEventDetail();
    } else {
      setError(t('events.eventNotFound'));
      setLoading(false);
    }
  }, [eventId]);

  // Transform backend event to match the screen's expected format
  const transformEvent = (backendEvent: Event): EventDetailItem => {
    const startDate = parseISO(backendEvent.startDate);
    const endDate = backendEvent.endDate ? parseISO(backendEvent.endDate) : null;

    const timeString = endDate
      ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`
      : format(startDate, 'HH:mm');

    return {
      id: backendEvent.id,
      title: backendEvent.title,
      description: backendEvent.description,
      location: backendEvent.location || t('events.noLocation'),
      date: startDate,
      time: timeString,
      category: backendEvent.category || t('events.general'),
      imageUrl: undefined, // Backend doesn't provide images yet
      attendees: 0, // Backend doesn't provide attendee count yet
      maxAttendees: 100, // Default max attendees
      isRegistered: backendEvent.isRegistered || false,
      organizer: t('events.schoolAdmin'),
      organizerEmail: 'eventos@colegio.edu',
      organizerPhone: undefined,
      requirements: backendEvent.requirements,
      price: t('events.freeEntry'),
    };
  };

  const loadEventDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const backendEvent = await EventsService.getEventById(eventId!);
      if (backendEvent) {
        const transformedEvent = transformEvent(backendEvent);
        setEvent(transformedEvent);
        setIsRegistered(transformedEvent.isRegistered);
        setCurrentAttendees(transformedEvent.attendees);
      } else {
        setError(t('events.eventNotFound'));
      }
    } catch (err) {
      console.error('Error loading event detail:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const mockAttendees: Attendee[] = [
    { id: '1', name: 'María García', type: 'parent' },
    { id: '2', name: 'Juan Pérez', type: 'student' },
    { id: '3', name: 'Carlos López', type: 'parent' },
    { id: '4', name: 'Ana Martínez', type: 'teacher' },
    { id: '5', name: 'Luis Rodríguez', type: 'parent' },
  ];

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

  const handleAttendanceToggle = async () => {
    if (!event) return;

    if (isRegistered) {
      Alert.alert(
        t('events.cancelAttendance'),
        t('events.cancelAttendanceConfirm'),
        [
          { text: t('common.no'), style: 'cancel' },
          {
            text: t('common.yes'),
            style: 'destructive',
            onPress: async () => {
              try {
                const success = await EventsService.cancelRegistration(event.id);
                if (success) {
                  setIsRegistered(false);
                  setCurrentAttendees(prev => Math.max(0, prev - 1));
                  showToast(t('events.attendanceCanceled'), 'success');
                } else {
                  showToast(t('common.error'), 'error');
                }
              } catch (error) {
                console.error('Error canceling registration:', error);
                showToast(t('common.error'), 'error');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        t('events.confirmAttendance'),
        t('events.confirmAttendanceMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.confirm'),
            onPress: async () => {
              try {
                const success = await EventsService.registerForEvent(event.id);
                if (success) {
                  setIsRegistered(true);
                  setCurrentAttendees(prev => Math.min(event.maxAttendees, prev + 1));
                  showToast(t('events.attendanceConfirmed'), 'success');
                } else {
                  showToast(t('common.error'), 'error');
                }
              } catch (error) {
                console.error('Error registering for event:', error);
                showToast(t('common.error'), 'error');
              }
            },
          },
        ]
      );
    }
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      await Share.share({
        title: event.title,
        message: `${event.title}\n${format(event.date, "d 'de' MMMM", { locale: getDateLocale() })} - ${event.time}\n${event.location}\n\n${event.description}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToCalendar = () => {
    Alert.alert(t('events.addToCalendar'), t('events.addedToCalendar'));
  };

  const handleRefresh = () => {
    if (eventId) {
      loadEventDetail();
    }
  };

  const renderAttendee = ({ item }: { item: Attendee }) => (
    <View style={styles.attendeeItem}>
      <View style={styles.attendeeAvatar}>
        <Icon
          name={item.type === 'student' ? 'face' : item.type === 'teacher' ? 'school' : 'person'}
          size={24}
          color="#666"
        />
      </View>
      <View style={styles.attendeeInfo}>
        <Text style={styles.attendeeName}>{item.name}</Text>
        <Text style={styles.attendeeType}>
          {item.type === 'student' ? 'Estudiante' : item.type === 'teacher' ? 'Profesor' : 'Padre/Madre'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <IOSHeader
          title={t('events.eventDetail')}
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

  if (error || !event) {
    return (
      <View style={styles.container}>
        <IOSHeader
          title={t('events.eventDetail')}
          scrollY={scrollY}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={[styles.errorContainer, { paddingTop: insets.top + 44 }]}>
          <Icon name="error-outline" size={64} color={tokens.color.gray400} />
          <Text style={styles.errorText}>{error || t('events.eventNotFound')}</Text>
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
        title={event.title}
        scrollY={scrollY}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 44,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.headerImage} />
        )}

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{event.title}</Text>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
                  <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                <Icon name="share" size={24} color={tokens.color.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.detailRow}>
              <Icon name="event" size={20} color={tokens.color.gray400} />
              <Text style={styles.detailText}>
                {format(event.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: getDateLocale() })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="access-time" size={20} color={tokens.color.gray400} />
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={20} color={tokens.color.gray400} />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
            {event.price && (
              <View style={styles.detailRow}>
                <Icon name="attach-money" size={20} color={tokens.color.gray400} />
                <Text style={styles.detailText}>{event.price}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('events.description')}</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {event.requirements && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('events.requirements')}</Text>
              <Text style={styles.requirements}>{event.requirements}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('events.attendance')}</Text>
            <TouchableOpacity
              style={styles.attendeesInfo}
              onPress={() => setAttendeesModalVisible(true)}
            >
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(currentAttendees / event.maxAttendees) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.attendeesText}>
                  {currentAttendees}/{event.maxAttendees} asistentes confirmados
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={tokens.color.gray300} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('events.organizer')}</Text>
            <View style={styles.organizerCard}>
              <Icon name="business" size={24} color={tokens.color.primary} />
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{event.organizer}</Text>
                <TouchableOpacity onPress={() => Alert.alert(t('events.contact'), `Email: ${event.organizerEmail}`)}>
                  <Text style={styles.organizerContact}>{event.organizerEmail}</Text>
                </TouchableOpacity>
                {event.organizerPhone && (
                  <TouchableOpacity onPress={() => Alert.alert('Contactar', `Teléfono: ${event.organizerPhone}`)}>
                    <Text style={styles.organizerContact}>{event.organizerPhone}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isRegistered && styles.primaryButtonRegistered,
              ]}
              onPress={handleAttendanceToggle}
            >
              <Icon
                name={isRegistered ? 'check-circle' : 'add-circle'}
                size={20}
                color="#fff"
              />
              <Text style={styles.primaryButtonText}>
                {isRegistered ? 'Asistencia Confirmada' : 'Confirmar Asistencia'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAddToCalendar}
            >
              <Icon name="calendar-today" size={20} color={tokens.color.primary} />
              <Text style={styles.secondaryButtonText}>Agregar al Calendario</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>

      <Modal
        visible={attendeesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAttendeesModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Asistentes Confirmados</Text>
              <TouchableOpacity
                onPress={() => setAttendeesModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={tokens.color.black} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={mockAttendees}
              renderItem={renderAttendee}
              keyExtractor={item => item.id}
              style={styles.attendeesList}
            />
          </View>
        </View>
      </Modal>
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
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: tokens.color.textPrimary,
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    color: tokens.color.white,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: 8,
  },
  section: {
    backgroundColor: tokens.color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: tokens.color.textSecondary,
    marginLeft: 12,
    flex: 1,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 15,
    color: tokens.color.textSecondary,
    lineHeight: 22,
  },
  requirements: {
    fontSize: 15,
    color: tokens.color.textSecondary,
    lineHeight: 22,
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: tokens.color.gray200,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.primary,
    borderRadius: 3,
  },
  attendeesText: {
    fontSize: 14,
    color: tokens.color.textMuted,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  organizerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginBottom: 4,
  },
  organizerContact: {
    fontSize: 14,
    color: tokens.color.primary,
    marginBottom: 2,
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: tokens.color.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonRegistered: {
    backgroundColor: tokens.color.success,
  },
  primaryButtonText: {
    color: tokens.color.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: tokens.color.white,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.color.primary,
  },
  secondaryButtonText: {
    color: tokens.color.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: tokens.color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.color.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  attendeesList: {
    padding: 16,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.gray50,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.color.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  attendeeName: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.color.textPrimary,
  },
  attendeeType: {
    fontSize: 13,
    color: tokens.color.textMuted,
    marginTop: 2,
  },
});
