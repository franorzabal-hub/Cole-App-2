import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSHeader from '@/components/IOSHeader';
import { tokens } from '@/theme/tokens';
import { showToast } from '@/utils/toast';
import { ExitsService } from '@/services/exits.service';
import { AuthService } from '@/services/auth.service';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export default function CreateExitPermissionScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Form state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [authorizedPersonName, setAuthorizedPersonName] = useState('');
  const [authorizedPersonDocument, setAuthorizedPersonDocument] = useState('');
  const [authorizedPersonPhone, setAuthorizedPersonPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [exitDate, setExitDate] = useState(new Date());
  const [exitTime, setExitTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [reason, setReason] = useState('');
  const [transportationMethod, setTransportationMethod] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);

  // Temporary state for date picker modal
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth() + 1);
  const [tempDay, setTempDay] = useState(new Date().getDate());

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
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const children = await AuthService.getUserChildren();
      setStudents(children);
      if (children.length === 1) {
        setSelectedStudentId(children[0].id);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      showToast(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedStudentId) {
      showToast(t('permissions.selectStudent'), 'error');
      return false;
    }
    if (!authorizedPersonName.trim()) {
      showToast(t('permissions.enterAuthorizedPerson'), 'error');
      return false;
    }
    if (!exitDate) {
      showToast(t('permissions.selectExitDate'), 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const exitPermissionId = await ExitsService.requestExitPermission(selectedStudentId, {
        authorizedPersonName,
        authorizedPersonDocument: authorizedPersonDocument || undefined,
        authorizedPersonPhone: authorizedPersonPhone || undefined,
        relationship: relationship || undefined,
        exitDate: exitDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        exitTime: exitTime || undefined,
        returnTime: returnTime || undefined,
        reason: reason || undefined,
        transportationMethod: transportationMethod || undefined,
      });

      if (exitPermissionId) {
        showToast(t('permissions.requestSent'), 'success');
        navigation.goBack();
      } else {
        showToast(t('common.error'), 'error');
      }
    } catch (error) {
      console.error('Error creating exit permission:', error);
      showToast(t('common.error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate arrays for date picker
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const generateDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const openDatePicker = () => {
    setTempYear(exitDate.getFullYear());
    setTempMonth(exitDate.getMonth() + 1);
    setTempDay(exitDate.getDate());
    setShowDatePicker(true);
  };

  const confirmDateSelection = () => {
    const newDate = new Date(tempYear, tempMonth - 1, tempDay);
    setExitDate(newDate);
    setShowDatePicker(false);
  };

  const cancelDateSelection = () => {
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <IOSHeader title={t('permissions.create')} scrollY={scrollY} showBackButton onBackPress={() => navigation.goBack()} />
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 44 }]}>
          <ActivityIndicator size="large" color={tokens.color.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <IOSHeader
        title={t('permissions.create')}
        scrollY={scrollY}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 64,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Student Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('permissions.student')}</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowStudentPicker(true)}
          >
            <Text style={styles.selectorButtonText}>
              {selectedStudentId
                ? students.find(s => s.id === selectedStudentId)
                  ? `${students.find(s => s.id === selectedStudentId)!.firstName} ${students.find(s => s.id === selectedStudentId)!.lastName}`
                  : t('permissions.selectStudent')
                : t('permissions.selectStudent')
              }
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color={tokens.color.gray400} />
          </TouchableOpacity>
        </View>

        {/* Authorized Person */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('permissions.authorizedPerson')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('permissions.enterFullName')}
            value={authorizedPersonName}
            onChangeText={setAuthorizedPersonName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder={t('permissions.documentNumber')}
            value={authorizedPersonDocument}
            onChangeText={setAuthorizedPersonDocument}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder={t('permissions.phoneNumber')}
            value={authorizedPersonPhone}
            onChangeText={setAuthorizedPersonPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder={t('permissions.relationship')}
            value={relationship}
            onChangeText={setRelationship}
            autoCapitalize="words"
          />
        </View>

        {/* Exit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('permissions.exitDetails')}</Text>

          {/* Exit Date */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={openDatePicker}
          >
            <Icon name="event" size={20} color={tokens.color.gray400} />
            <Text style={styles.dateButtonText}>
              {format(exitDate, "d 'de' MMMM, yyyy", { locale: getDateLocale() })}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color={tokens.color.gray400} />
          </TouchableOpacity>


          <TextInput
            style={styles.input}
            placeholder={t('permissions.exitTime')}
            value={exitTime}
            onChangeText={setExitTime}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder={t('permissions.returnTime')}
            value={returnTime}
            onChangeText={setReturnTime}
            keyboardType="numeric"
          />
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('permissions.additionalInfo')}</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('permissions.reason')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TextInput
            style={styles.input}
            placeholder={t('permissions.transportation')}
            value={transportationMethod}
            onChangeText={setTransportationMethod}
          />
        </View>
      </Animated.ScrollView>

      {/* Submit Button */}
      <View style={[styles.submitContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={tokens.color.white} />
          ) : (
            <>
              <Icon name="send" size={20} color={tokens.color.white} />
              <Text style={styles.submitButtonText}>{t('permissions.sendRequest')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelDateSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('permissions.selectDate')}</Text>

            <View style={styles.datePickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>{t('permissions.year')}</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowYearPicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>{tempYear}</Text>
                  <Icon name="keyboard-arrow-down" size={16} color={tokens.color.gray400} />
                </TouchableOpacity>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>{t('permissions.month')}</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowMonthPicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>
                    {format(new Date(2000, tempMonth - 1, 1), "MMM", { locale: getDateLocale() })}
                  </Text>
                  <Icon name="keyboard-arrow-down" size={16} color={tokens.color.gray400} />
                </TouchableOpacity>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>{t('permissions.day')}</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDayPicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>{tempDay}</Text>
                  <Icon name="keyboard-arrow-down" size={16} color={tokens.color.gray400} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDateSelection}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDateSelection}
              >
                <Text style={styles.confirmButtonText}>{t('common.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Student Selection Modal */}
      <Modal
        visible={showStudentPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStudentPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('permissions.selectStudent')}</Text>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  !selectedStudentId && styles.optionItemSelected
                ]}
                onPress={() => {
                  setSelectedStudentId('');
                  setShowStudentPicker(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  !selectedStudentId && styles.optionTextSelected
                ]}>
                  {t('permissions.selectStudent')}
                </Text>
                {!selectedStudentId && (
                  <Icon name="check" size={20} color={tokens.color.primary} />
                )}
              </TouchableOpacity>
              {students.map(student => (
                <TouchableOpacity
                  key={student.id}
                  style={[
                    styles.optionItem,
                    selectedStudentId === student.id && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setSelectedStudentId(student.id);
                    setShowStudentPicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    selectedStudentId === student.id && styles.optionTextSelected
                  ]}>
                    {`${student.firstName} ${student.lastName}`}
                  </Text>
                  {selectedStudentId === student.id && (
                    <Icon name="check" size={20} color={tokens.color.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowStudentPicker(false)}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('permissions.year')}</Text>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {generateYears().map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.optionItem,
                    tempYear === year && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setTempYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    tempYear === year && styles.optionTextSelected
                  ]}>
                    {year.toString()}
                  </Text>
                  {tempYear === year && (
                    <Icon name="check" size={20} color={tokens.color.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowYearPicker(false)}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('permissions.month')}</Text>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.optionItem,
                    tempMonth === month && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setTempMonth(month);
                    // Adjust day if current day doesn't exist in new month
                    const daysInNewMonth = new Date(tempYear, month, 0).getDate();
                    if (tempDay > daysInNewMonth) {
                      setTempDay(daysInNewMonth);
                    }
                    setShowMonthPicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    tempMonth === month && styles.optionTextSelected
                  ]}>
                    {format(new Date(2000, month - 1, 1), "MMMM", { locale: getDateLocale() })}
                  </Text>
                  {tempMonth === month && (
                    <Icon name="check" size={20} color={tokens.color.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowMonthPicker(false)}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Day Picker Modal */}
      <Modal
        visible={showDayPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('permissions.day')}</Text>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {generateDays(tempYear, tempMonth).map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.optionItem,
                    tempDay === day && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setTempDay(day);
                    setShowDayPicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    tempDay === day && styles.optionTextSelected
                  ]}>
                    {day.toString()}
                  </Text>
                  {tempDay === day && (
                    <Icon name="check" size={20} color={tokens.color.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDayPicker(false)}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
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
  section: {
    backgroundColor: tokens.color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.color.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: tokens.color.textPrimary,
    backgroundColor: tokens.color.white,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    maxHeight: 120,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: tokens.color.gray300,
    borderRadius: 8,
    padding: 12,
    backgroundColor: tokens.color.white,
    minHeight: 50,
  },
  selectorButtonText: {
    flex: 1,
    fontSize: 16,
    color: tokens.color.textPrimary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: tokens.color.gray300,
    borderRadius: 8,
    padding: 12,
    backgroundColor: tokens.color.white,
    marginBottom: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: tokens.color.textPrimary,
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.color.white,
    borderTopWidth: 1,
    borderTopColor: tokens.color.gray200,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: tokens.color.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: tokens.color.gray400,
  },
  submitButtonText: {
    color: tokens.color.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: tokens.color.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: tokens.color.gray300,
    borderRadius: 6,
    padding: 8,
    backgroundColor: tokens.color.white,
    minHeight: 40,
  },
  datePickerButtonText: {
    fontSize: 14,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  optionsList: {
    maxHeight: 250,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.gray200,
  },
  optionItemSelected: {
    backgroundColor: tokens.color.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: tokens.color.textPrimary,
  },
  optionTextSelected: {
    color: tokens.color.primary,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: tokens.color.gray200,
  },
  confirmButton: {
    backgroundColor: tokens.color.primary,
  },
  cancelButtonText: {
    color: tokens.color.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: tokens.color.white,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
