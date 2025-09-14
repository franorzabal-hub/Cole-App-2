import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import IOSHeader from '@/components/IOSHeader';
import { tokens } from '@/theme/tokens';

interface Recipient {
  id: string;
  name: string;
  role: string;
  type: 'teacher' | 'admin' | 'support';
}

const availableRecipients: Recipient[] = [
  { id: '1', name: 'Prof. García', role: 'Profesor de Matemáticas', type: 'teacher' },
  { id: '2', name: 'Prof. López', role: 'Profesora de Lengua', type: 'teacher' },
  { id: '3', name: 'Dirección Académica', role: 'Administración', type: 'admin' },
  { id: '4', name: 'Coordinación', role: 'Coordinación General', type: 'admin' },
  { id: '5', name: 'Soporte Técnico', role: 'Asistencia Técnica', type: 'support' },
  { id: '6', name: 'Psicopedagogía', role: 'Departamento de Orientación', type: 'support' },
];

const messageTemplates = [
  { id: '1', title: 'Justificación de Ausencia', category: 'Asistencia' },
  { id: '2', title: 'Solicitud de Reunión', category: 'Reunión' },
  { id: '3', title: 'Consulta Académica', category: 'Académico' },
  { id: '4', title: 'Reporte de Problema', category: 'Soporte' },
];

export default function NewMessageScreen() {
  const navigation = useNavigation();
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

  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'inquiry' | 'notification'>('inquiry');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [allowReplies, setAllowReplies] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>('Juan Pérez');
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    switch (templateId) {
      case '1':
        setSubject('Justificación de Ausencia');
        setMessage('Estimado/a profesor/a,\n\nPor medio de la presente, justifico la ausencia de mi hijo/a [NOMBRE] el día [FECHA] debido a [MOTIVO].\n\nAgradezco su comprensión.\n\nAtentamente,');
        setMessageType('notification');
        break;
      case '2':
        setSubject('Solicitud de Reunión');
        setMessage('Estimado/a profesor/a,\n\nMe gustaría solicitar una reunión para conversar sobre el progreso académico de mi hijo/a.\n\n¿Cuándo tendría disponibilidad?\n\nSaludos cordiales,');
        setMessageType('inquiry');
        break;
      case '3':
        setSubject('Consulta Académica');
        setMessage('Estimado/a profesor/a,\n\nTengo una consulta sobre [TEMA].\n\n[DETALLES DE LA CONSULTA]\n\nQuedo atento/a a su respuesta.\n\nSaludos,');
        setMessageType('inquiry');
        break;
      case '4':
        setSubject('Reporte de Problema');
        setMessage('Estimado equipo,\n\nQuisiera reportar el siguiente problema:\n\n[DESCRIPCIÓN DEL PROBLEMA]\n\nAgradezco su pronta atención.\n\nAtentamente,');
        setMessageType('inquiry');
        setPriority('high');
        break;
    }
  };

  const validateMessage = () => {
    if (!selectedRecipient) {
      Alert.alert(t('common.error'), t('messages.validation.selectRecipient'));
      return false;
    }
    if (!subject.trim()) {
      Alert.alert(t('common.error'), t('messages.validation.enterSubject'));
      return false;
    }
    if (!message.trim()) {
      Alert.alert(t('common.error'), t('messages.validation.writeMessage'));
      return false;
    }
    if (message.length < 10) {
      Alert.alert(t('common.error'), t('messages.validation.messageMinLength'));
      return false;
    }
    return true;
  };

  const sendMessage = () => {
    if (!validateMessage()) return;

    Alert.alert(
      t('messages.confirmSend'),
      t('messages.confirmSendMessage', { recipient: selectedRecipient?.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('messages.send'),
          onPress: () => {
            Alert.alert(
              t('messages.messageSent'),
              t('messages.messageSentDescription'),
              [
                {
                  text: t('common.ok'),
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return tokens.color.danger;
      case 'low':
        return tokens.color.gray400;
      default:
        return tokens.color.primary;
    }
  };

  return (
    <View style={styles.container}>
      <IOSHeader
        title={t('messages.createMessage')}
        scrollY={scrollY}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightButton={
          <TouchableOpacity onPress={sendMessage}>
            <Text style={styles.sendButtonText}>{t('messages.send')}</Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 44}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingTop: insets.top + 44,
            paddingBottom: 40,
          }}
          scrollEventThrottle={16}
        >
          {/* Recipient Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('messages.recipient')}</Text>
            <TouchableOpacity
              style={styles.recipientSelector}
              onPress={() => setShowRecipientPicker(!showRecipientPicker)}
            >
              {selectedRecipient ? (
                <View style={styles.recipientInfo}>
                  <Icon
                    name={
                      selectedRecipient.type === 'teacher'
                        ? 'school'
                        : selectedRecipient.type === 'admin'
                        ? 'business'
                        : 'support-agent'
                    }
                    size={24}
                    color={tokens.color.primary}
                  />
                  <View style={styles.recipientText}>
                    <Text style={styles.recipientName}>{selectedRecipient.name}</Text>
                    <Text style={styles.recipientRole}>{selectedRecipient.role}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.placeholderText}>{t('messages.selectRecipient')}</Text>
              )}
              <Icon name="expand-more" size={24} color={tokens.color.gray400} />
            </TouchableOpacity>

            {showRecipientPicker && (
              <View style={styles.recipientList}>
                {availableRecipients.map(recipient => (
                  <TouchableOpacity
                    key={recipient.id}
                    style={styles.recipientItem}
                    onPress={() => {
                      setSelectedRecipient(recipient);
                      setShowRecipientPicker(false);
                    }}
                  >
                    <Icon
                      name={
                        recipient.type === 'teacher'
                          ? 'school'
                          : recipient.type === 'admin'
                          ? 'business'
                          : 'support-agent'
                      }
                      size={20}
                      color={tokens.color.primary}
                    />
                    <View style={styles.recipientItemText}>
                      <Text style={styles.recipientItemName}>{recipient.name}</Text>
                      <Text style={styles.recipientItemRole}>{recipient.role}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Student Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('messages.relatedStudent')}</Text>
            <View style={styles.studentSelector}>
              <TouchableOpacity
                style={[
                  styles.studentChip,
                  selectedStudent === 'Juan Pérez' && styles.studentChipSelected,
                ]}
                onPress={() => setSelectedStudent('Juan Pérez')}
              >
                <Text
                  style={[
                    styles.studentChipText,
                    selectedStudent === 'Juan Pérez' && styles.studentChipTextSelected,
                  ]}
                >
                  Juan Pérez
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.studentChip,
                  selectedStudent === 'María Pérez' && styles.studentChipSelected,
                ]}
                onPress={() => setSelectedStudent('María Pérez')}
              >
                <Text
                  style={[
                    styles.studentChipText,
                    selectedStudent === 'María Pérez' && styles.studentChipTextSelected,
                  ]}
                >
                  María Pérez
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('messages.quickTemplates')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {messageTemplates.map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateChip,
                    selectedTemplate === template.id && styles.templateChipSelected,
                  ]}
                  onPress={() => handleTemplateSelect(template.id)}
                >
                  <Text
                    style={[
                      styles.templateChipText,
                      selectedTemplate === template.id && styles.templateChipTextSelected,
                    ]}
                  >
                    {template.title}
                  </Text>
                  <Text
                    style={[
                      styles.templateChipCategory,
                      selectedTemplate === template.id && styles.templateChipCategorySelected,
                    ]}
                  >
                    {template.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Subject */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('messages.subject')} *</Text>
            <TextInput
              style={styles.subjectInput}
              value={subject}
              onChangeText={setSubject}
              placeholder={t('messages.enterSubject')}
              placeholderTextColor={tokens.color.gray400}
              maxLength={100}
            />
            <Text style={styles.charCount}>{subject.length}/100</Text>
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('messages.message')} *</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder={t('messages.writeMessageHere')}
              placeholderTextColor={tokens.color.gray400}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{message.length}/1000</Text>
          </View>

          {/* Message Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('messages.messageOptions')}</Text>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>{t('messages.priority')}</Text>
              <View style={styles.priorityButtons}>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'low' && styles.priorityButtonSelected,
                  ]}
                  onPress={() => setPriority('low')}
                >
                  <Icon name="flag" size={16} color={priority === 'low' ? '#fff' : tokens.color.gray400} />
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === 'low' && styles.priorityButtonTextSelected,
                    ]}
                  >
                    {t('messages.lowPriority')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'normal' && styles.priorityButtonSelected,
                  ]}
                  onPress={() => setPriority('normal')}
                >
                  <Icon name="flag" size={16} color={priority === 'normal' ? '#fff' : tokens.color.primary} />
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === 'normal' && styles.priorityButtonTextSelected,
                    ]}
                  >
                    {t('messages.normalPriority')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'high' && styles.priorityButtonSelected,
                  ]}
                  onPress={() => setPriority('high')}
                >
                  <Icon name="flag" size={16} color={priority === 'high' ? '#fff' : '#FF3B30'} />
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === 'high' && styles.priorityButtonTextSelected,
                    ]}
                  >
                    {t('messages.highPriority')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionRow}>
              <View style={styles.optionLabelContainer}>
                <Text style={styles.optionLabel}>{t('messages.allowReplies')}</Text>
                <Text style={styles.optionDescription}>
                  {t('messages.allowRepliesDescription')}
                </Text>
              </View>
              <Switch
                value={allowReplies}
                onValueChange={setAllowReplies}
                trackColor={{ false: tokens.color.gray200, true: tokens.color.primary }}
              />
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>{t('messages.messageType')}</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    messageType === 'inquiry' && styles.typeButtonSelected,
                  ]}
                  onPress={() => setMessageType('inquiry')}
                >
                  <Icon
                    name="help-outline"
                    size={16}
                    color={messageType === 'inquiry' ? '#fff' : tokens.color.primary}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      messageType === 'inquiry' && styles.typeButtonTextSelected,
                    ]}
                  >
                    {t('messages.inquiry')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    messageType === 'notification' && styles.typeButtonSelected,
                  ]}
                  onPress={() => setMessageType('notification')}
                >
                  <Icon
                    name="info-outline"
                    size={16}
                    color={messageType === 'notification' ? '#fff' : tokens.color.primary}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      messageType === 'notification' && styles.typeButtonTextSelected,
                    ]}
                  >
                    {t('messages.notification')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelines}>
            <Icon name="info" size={20} color={tokens.color.gray400} />
            <View style={styles.guidelinesText}>
              <Text style={styles.guidelinesTitle}>{t('messages.communicationGuidelines')}</Text>
              <Text style={styles.guidelinesContent}>
                {t('messages.guidelinesBeClearConcise')}{'\n'}
                {t('messages.guidelinesUseRespectfulTone')}{'\n'}
                {t('messages.guidelinesIncludeRelevantInfo')}{'\n'}
                {t('messages.guidelinesUrgentFirst')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sendButtonText: {
    color: tokens.color.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.color.black,
    marginBottom: 12,
  },
  recipientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientText: {
    marginLeft: 12,
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: tokens.color.black,
  },
  recipientRole: {
    fontSize: 13,
    color: tokens.color.gray400,
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: tokens.color.gray400,
  },
  recipientList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recipientItemText: {
    marginLeft: 12,
    flex: 1,
  },
  recipientItemName: {
    fontSize: 15,
    color: tokens.color.black,
  },
  recipientItemRole: {
    fontSize: 12,
    color: tokens.color.gray400,
  },
  studentSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  studentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  studentChipSelected: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  studentChipText: {
    fontSize: 14,
    color: tokens.color.black,
  },
  studentChipTextSelected: {
    color: '#fff',
  },
  templateChip: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: 120,
  },
  templateChipSelected: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  templateChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.color.black,
  },
  templateChipTextSelected: {
    color: '#fff',
  },
  templateChipCategory: {
    fontSize: 11,
    color: tokens.color.gray400,
    marginTop: 2,
  },
  templateChipCategorySelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: tokens.color.black,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: tokens.color.black,
    minHeight: 150,
  },
  charCount: {
    fontSize: 11,
    color: tokens.color.gray400,
    marginTop: 4,
    textAlign: 'right',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 15,
    color: tokens.color.black,
  },
  optionDescription: {
    fontSize: 12,
    color: tokens.color.gray400,
    marginTop: 2,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    gap: 4,
  },
  priorityButtonSelected: {
    backgroundColor: tokens.color.primary,
  },
  priorityButtonText: {
    fontSize: 13,
    color: tokens.color.black,
  },
  priorityButtonTextSelected: {
    color: '#fff',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    gap: 4,
  },
  typeButtonSelected: {
    backgroundColor: tokens.color.primary,
  },
  typeButtonText: {
    fontSize: 13,
    color: tokens.color.black,
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  guidelines: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  guidelinesText: {
    flex: 1,
    marginLeft: 12,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.color.black,
    marginBottom: 4,
  },
  guidelinesContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});