import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Modal,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';
import IOSHeader from '@/components/IOSHeader';
import { tokens } from '@/theme/tokens';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'parent' | 'school';
  senderName: string;
  senderRole?: string;
  type: 'announcement' | 'inquiry' | 'response' | 'notification';
  priority?: 'high' | 'normal' | 'low';
  allowReplies: boolean;
  attachments?: Array<{
    type: 'document' | 'image' | 'link';
    name: string;
    url: string;
  }>;
  readBy?: string[];
  replyTo?: string;
  subject?: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Estimados padres, les informamos que mañana viernes habrá una reunión extraordinaria a las 18:30 para discutir las actividades del próximo trimestre.',
    timestamp: new Date(Date.now() - 86400000 * 2),
    sender: 'school',
    senderName: 'Dirección Académica',
    senderRole: 'Administración',
    type: 'announcement',
    priority: 'high',
    allowReplies: false,
    subject: 'Reunión Extraordinaria - Viernes 18:30',
  },
  {
    id: '2',
    text: 'Buenas tardes. ¿Podrían confirmar si habrá servicio de transporte el día de la excursión?',
    timestamp: new Date(Date.now() - 86400000),
    sender: 'parent',
    senderName: 'Usted',
    type: 'inquiry',
    priority: 'normal',
    allowReplies: true,
  },
  {
    id: '3',
    text: 'Sí, el servicio de transporte estará disponible. Los buses saldrán a las 8:00 AM desde el colegio. Por favor, los estudiantes deben llegar 15 minutos antes.',
    timestamp: new Date(Date.now() - 3600000 * 18),
    sender: 'school',
    senderName: 'Prof. García',
    senderRole: 'Coordinación',
    type: 'response',
    priority: 'normal',
    allowReplies: true,
    replyTo: '2',
  },
  {
    id: '4',
    text: 'Perfecto, muchas gracias por la información.',
    timestamp: new Date(Date.now() - 3600000 * 12),
    sender: 'parent',
    senderName: 'Usted',
    type: 'response',
    priority: 'normal',
    allowReplies: true,
    replyTo: '3',
  },
];

export default function ChatScreen() {
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

  const { recipientName, recipientRole, chatId } = (route.params as any) || {
    recipientName: 'Colegio',
    recipientRole: 'Administración',
    chatId: '1',
  };

  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [messageType, setMessageType] = useState<'inquiry' | 'response'>('inquiry');
  const flatListRef = useRef<FlatList>(null);

  const canReply = messages.length > 0 && messages[messages.length - 1].allowReplies;

  // Auto-scroll when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: false });
      }
    });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [messages.length]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    if (!canReply) {
      Alert.alert(
        t('messages.cannotReplyTitle'),
        t('messages.cannotReplyMessage'),
        [{ text: t('common.understood') }]
      );
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date(),
      sender: 'parent',
      senderName: 'Usted',
      type: replyToMessage ? 'response' : messageType,
      priority: selectedPriority,
      allowReplies: true,
      replyTo: replyToMessage?.id,
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setReplyToMessage(null);
    setSelectedPriority('normal');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleLongPress = (message: Message) => {
    if (message.sender === 'school' && message.allowReplies) {
      Alert.alert(
        t('messages.options'),
        '',
        [
          {
            text: t('messages.reply'),
            onPress: () => setReplyToMessage(message),
          },
          {
            text: t('messages.copyText'),
            onPress: () => Alert.alert(t('messages.copied'), t('messages.copiedMessage')),
          },
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
        ]
      );
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return tokens.color.danger;
      case 'low':
        return tokens.color.gray400;
      default:
        return tokens.color.primary;
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isParent = item.sender === 'parent';
    const repliedMessage = item.replyTo ? messages.find(m => m.id === item.replyTo) : null;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        style={[
          styles.messageContainer,
          isParent && styles.messageContainerParent,
        ]}
      >
        {repliedMessage && (
          <View style={styles.replyContainer}>
            <View style={styles.replyBorder} />
            <View style={styles.replyContent}>
              <Text style={styles.replyName}>{repliedMessage.senderName}</Text>
              <Text style={styles.replyText} numberOfLines={1}>
                {repliedMessage.text}
              </Text>
            </View>
          </View>
        )}

        <View style={[
          styles.messageBubble,
          isParent && styles.messageBubbleParent,
          !item.allowReplies && styles.messageBubbleNoReply,
        ]}>
          {!isParent && (
            <View style={styles.messageHeader}>
              <Text style={styles.senderName}>{item.senderName}</Text>
              {item.senderRole && (
                <Text style={styles.senderRole}>{item.senderRole}</Text>
              )}
              {item.priority && item.priority !== 'normal' && (
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.priorityText}>
                    {item.priority === 'high' ? t('messages.urgent') : t('messages.lowPriority')}
                  </Text>
                </View>
              )}
            </View>
          )}

          {item.subject && (
            <Text style={styles.messageSubject}>{item.subject}</Text>
          )}

          <Text style={[styles.messageText, isParent && styles.messageTextParent]}>
            {item.text}
          </Text>

          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, isParent && styles.timestampParent]}>
              {format(item.timestamp, 'HH:mm')}
            </Text>
            {!item.allowReplies && (
              <View style={styles.noReplyBadge}>
                <Icon name="block" size={12} color={tokens.color.gray400} />
                <Text style={styles.noReplyText}>{t('messages.noReplies')}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateSeparator = (date: Date) => (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateText}>
        {format(date, "d 'de' MMMM", { locale: getDateLocale() })}
      </Text>
      <View style={styles.dateLine} />
    </View>
  );

  return (
    <View style={styles.container}>
      <IOSHeader
        title={recipientName}
        subtitle={recipientRole}
        scrollY={scrollY}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightButton={
          <TouchableOpacity onPress={() => setShowOptions(true)}>
            <Icon name="more-vert" size={24} color={tokens.color.primary} />
          </TouchableOpacity>
        }
      />

      <View style={[styles.contentContainer, { paddingTop: insets.top + 44 }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          inverted={false}
        />

        {replyToMessage && (
          <View style={styles.replyingToContainer}>
            <View style={styles.replyingToContent}>
              <Text style={styles.replyingToLabel}>{t('messages.replyingTo')} {replyToMessage.senderName}</Text>
              <Text style={styles.replyingToText} numberOfLines={1}>
                {replyToMessage.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyToMessage(null)}>
              <Icon name="close" size={20} color={tokens.color.gray400} />
            </TouchableOpacity>
          </View>
        )}

        {canReply ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.priorityButton}
                  onPress={() => {
                    const priorities: Array<'high' | 'normal' | 'low'> = ['high', 'normal', 'low'];
                    const currentIndex = priorities.indexOf(selectedPriority);
                    const nextIndex = (currentIndex + 1) % priorities.length;
                    setSelectedPriority(priorities[nextIndex]);
                  }}
                >
                  <Icon
                    name="flag"
                    size={20}
                    color={getPriorityColor(selectedPriority)}
                  />
                </TouchableOpacity>

                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={t('messages.typeMessage')}
                  placeholderTextColor={tokens.color.gray400}
                  multiline
                  maxLength={500}
                  onFocus={() => {
                    setTimeout(() => {
                      if (flatListRef.current) {
                        flatListRef.current.scrollToEnd({ animated: false });
                      }
                    }, 100);
                  }}
                />

                <TouchableOpacity
                  style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                  onPress={sendMessage}
                  disabled={!inputText.trim()}
                >
                  <Icon name="send" size={20} color={inputText.trim() ? tokens.color.primary : tokens.color.gray300} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputFooter}>
                <Text style={styles.charCount}>{inputText.length}/500</Text>
                <Text style={styles.messageTypeLabel}>
                  {t('messages.messageType')}: {messageType === 'inquiry' ? t('messages.inquiry') : t('messages.response')}
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.noReplyContainer}>
            <Icon name="lock" size={20} color={tokens.color.gray400} />
            <Text style={styles.noReplyMessage}>
              {t('messages.conversationLocked')}
            </Text>
            <TouchableOpacity
              style={styles.newConversationButton}
              onPress={() => navigation.navigate('NewMessage' as never)}
            >
              <Text style={styles.newConversationText}>{t('messages.createMessage')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showOptions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('messages.conversationOptions')}</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <Icon name="close" size={24} color={tokens.color.black} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.optionItem}>
              <Icon name="info" size={24} color={tokens.color.primary} />
              <Text style={styles.optionText}>{t('messages.viewContactInfo')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Icon name="notifications-off" size={24} color={tokens.color.primary} />
              <Text style={styles.optionText}>{t('messages.muteNotifications')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Icon name="archive" size={24} color={tokens.color.primary} />
              <Text style={styles.optionText}>{t('messages.archiveConversation')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionItem, styles.optionItemDanger]}>
              <Icon name="delete" size={24} color="#FF3B30" />
              <Text style={[styles.optionText, styles.optionTextDanger]}>
                {t('messages.deleteConversation')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageContainerParent: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
    shadowColor: tokens.color.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageBubbleParent: {
    backgroundColor: tokens.color.primary,
  },
  messageBubbleNoReply: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.color.black,
    marginRight: 8,
  },
  senderRole: {
    fontSize: 12,
    color: tokens.color.gray400,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  messageSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.color.black,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: tokens.color.black,
    lineHeight: 20,
  },
  messageTextParent: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: tokens.color.gray400,
  },
  timestampParent: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  noReplyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noReplyText: {
    fontSize: 11,
    color: tokens.color.gray400,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 8,
  },
  replyBorder: {
    width: 3,
    backgroundColor: tokens.color.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.color.primary,
  },
  replyText: {
    fontSize: 12,
    color: tokens.color.gray400,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  replyingToContent: {
    flex: 1,
  },
  replyingToLabel: {
    fontSize: 12,
    color: tokens.color.primary,
    fontWeight: '600',
  },
  replyingToText: {
    fontSize: 12,
    color: tokens.color.gray400,
  },
  inputContainer: {
    backgroundColor: tokens.color.white,
    borderTopWidth: 1,
    borderTopColor: tokens.color.gray200,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priorityButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: tokens.color.gray200,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  charCount: { fontSize: 11, color: tokens.color.textMuted },
  messageTypeLabel: { fontSize: 11, color: tokens.color.textMuted },
  noReplyContainer: {
    backgroundColor: tokens.color.gray50,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: tokens.color.gray200,
  },
  noReplyMessage: { fontSize: 14, color: tokens.color.textMuted, marginTop: 8, marginBottom: 12 },
  newConversationButton: {
    backgroundColor: tokens.color.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  newConversationText: { color: tokens.color.white, fontSize: 14, fontWeight: '600' },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: tokens.color.gray200 },
  dateText: { fontSize: 12, color: tokens.color.textMuted, marginHorizontal: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: tokens.color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.gray50,
  },
  optionItemDanger: {
    borderBottomWidth: 0,
  },
  optionText: { fontSize: 16, color: tokens.color.textPrimary, marginLeft: 16 },
  optionTextDanger: {
    color: '#FF3B30',
  },
});
