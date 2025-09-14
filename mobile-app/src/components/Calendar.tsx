import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { tokens } from '@/theme/tokens';

const { width } = Dimensions.get('window');

interface CalendarProps {
  events: Array<{
    id: string;
    date: Date;
    title: string;
  }>;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
}

export default function Calendar({ events, onDateSelect, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const hasEvent = (day: Date) => {
    return events.some(event => isSameDay(event.date, day));
  };

  const getEventCount = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day)).length;
  };

  const renderDay = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const isTodayDate = isToday(day);
    const eventCount = getEventCount(day);

    return (
      <TouchableOpacity
        key={day.toString()}
        style={[
          styles.dayContainer,
          !isCurrentMonth && styles.dayContainerInactive,
          isSelected && styles.dayContainerSelected,
          isTodayDate && styles.dayContainerToday,
        ]}
        onPress={() => onDateSelect && onDateSelect(day)}
        disabled={!isCurrentMonth}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.dayTextInactive,
            isSelected && styles.dayTextSelected,
            isTodayDate && styles.dayTextToday,
          ]}
        >
          {format(day, 'd')}
        </Text>
        {eventCount > 0 && isCurrentMonth && (
          <View style={styles.eventIndicatorContainer}>
            {eventCount <= 3 ? (
              <View style={styles.eventDots}>
                {Array.from({ length: eventCount }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.eventDot,
                      isSelected && styles.eventDotSelected,
                    ]}
                  />
                ))}
              </View>
            ) : (
              <View style={[styles.eventBadge, isSelected && styles.eventBadgeSelected]}>
                <Text style={styles.eventBadgeText}>{eventCount}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
          <Icon name="chevron-left" size={24} color={tokens.color.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday} style={styles.monthContainer}>
          <Text style={styles.monthText}>
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </Text>
          {!isSameMonth(new Date(), currentMonth) && (
            <Text style={styles.todayText}>Hoy</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <Icon name="chevron-right" size={24} color={tokens.color.primary} />
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <View style={styles.weekDaysContainer}>
        {weekDays.map(day => (
          <View key={day} style={styles.weekDayContainer}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Days */}
      <View style={styles.daysContainer}>
        {days.map(day => renderDay(day))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.color.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    textTransform: 'capitalize',
  },
  todayText: {
    fontSize: 12,
    color: tokens.color.primary,
    marginTop: 2,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.color.textMuted,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: (width - 64) / 7,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayContainerInactive: {
    opacity: 0.3,
  },
  dayContainerSelected: {
    backgroundColor: tokens.color.primary,
    borderRadius: 12,
  },
  dayContainerToday: {
    backgroundColor: '#E3F2FF',
    borderRadius: 12,
  },
  dayText: {
    fontSize: 16,
    color: tokens.color.textPrimary,
  },
  dayTextInactive: {
    color: tokens.color.gray300,
  },
  dayTextSelected: {
    color: tokens.color.white,
    fontWeight: '600',
  },
  dayTextToday: {
    color: tokens.color.primary,
    fontWeight: '600',
  },
  eventIndicatorContainer: {
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
  },
  eventDots: {
    flexDirection: 'row',
    gap: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.color.primary,
  },
  eventDotSelected: {
    backgroundColor: tokens.color.white,
  },
  eventBadge: {
    backgroundColor: tokens.color.primary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  eventBadgeSelected: {
    backgroundColor: tokens.color.white,
  },
  eventBadgeText: {
    fontSize: 9,
    color: tokens.color.white,
    fontWeight: 'bold',
  },
});
