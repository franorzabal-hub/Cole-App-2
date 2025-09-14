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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSHeader from '@/components/IOSHeader';
import { tokens } from '@/theme/tokens';
import { showToast } from '@/utils/toast';

interface Attendee {
  id: string;
  name: string;
  avatar?: string;
  type: 'student' | 'parent' | 'teacher';
}

export default function EventDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
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

  const event = (route.params as any)?.event || {
    id: '1',
    title: 'Festival de Primavera',
    description: 'Gran festival con actividades para toda la familia. Habrá juegos, comida, música en vivo y muchas sorpresas más. No te pierdas esta celebración especial donde toda la comunidad escolar se reúne para disfrutar de un día inolvidable.',
    location: 'Patio Principal',
    date: new Date(Date.now() + 86400000 * 7),
    time: '10:00 - 18:00',
    category: 'Festival',
    imageUrl: 'https://via.placeholder.com/400x250',
    attendees: 45,
    maxAttendees: 100,
    isRegistered: false,
    organizer: 'Asociación de Padres',
    organizerEmail: 'eventos@colegio.edu',
    organizerPhone: '+54 11 1234-5678',
    requirements: 'Traer manta para sentarse, protector solar',
    price: 'Entrada libre',
  };

  const [isRegistered, setIsRegistered] = useState(event.isRegistered);
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [currentAttendees, setCurrentAttendees] = useState(event.attendees);

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

  const handleAttendanceToggle = () => {
    if (isRegistered) {
      Alert.alert(
        'Cancelar Asistencia',
        '¿Estás seguro de que deseas cancelar tu asistencia a este evento?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí, cancelar',
            style: 'destructive',
            onPress: () => {
              setIsRegistered(false);
              setCurrentAttendees(prev => Math.max(0, prev - 1));
              showToast('Tu asistencia ha sido cancelada');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Confirmar Asistencia',
        '¿Deseas confirmar tu asistencia a este evento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: () => {
              setIsRegistered(true);
              setCurrentAttendees(prev => Math.min(event.maxAttendees, prev + 1));
              showToast('Tu asistencia ha sido confirmada');
            },
          },
        ]
      );
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: event.title,
        message: `${event.title}\n${format(event.date, "d 'de' MMMM", { locale: es })} - ${event.time}\n${event.location}\n\n${event.description}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToCalendar = () => {
    Alert.alert('Agregar al Calendario', 'El evento ha sido agregado a tu calendario');
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
            <Text style={styles.sectionTitle}>Organizador</Text>
            <View style={styles.organizerCard}>
              <Icon name="business" size={24} color={tokens.color.primary} />
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{event.organizer}</Text>
                <TouchableOpacity onPress={() => Alert.alert('Contactar', `Email: ${event.organizerEmail}`)}>
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
