import { apiClient, queries, Message, SendMessageInput } from '../config/api';
import { AuthService } from './auth.service';

export class MessagesService {
  /**
   * Get messages for current user
   */
  static async getMessages(
    filter: 'all' | 'unread' | 'sent' = 'all'
  ): Promise<Message[]> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return [];

      const response = await apiClient.graphql(queries.GET_MESSAGES, {
        tenantId,
        filter,
      });

      return response.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Get single message with replies
   */
  static async getMessageById(messageId: string): Promise<Message | null> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return null;

      const response = await apiClient.graphql(queries.GET_MESSAGE, {
        id: messageId,
        tenantId,
      });

      return response.message || null;
    } catch (error) {
      console.error('Error fetching message:', error);
      return null;
    }
  }

  /**
   * Send a new message
   */
  static async sendMessage(
    subject: string,
    content: string,
    recipientIds?: string[],
    priority: 'low' | 'normal' | 'high' = 'normal',
    type: 'announcement' | 'inquiry' | 'response' | 'notification' = 'announcement',
    parentMessageId?: string
  ): Promise<string | null> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return null;

      const messageInput: SendMessageInput = {
        tenantId,
        subject,
        content,
        recipientIds,
        priority,
        type,
        parentMessageId,
      };

      const response = await apiClient.graphql(queries.SEND_MESSAGE, {
        input: messageInput,
      });

      return response.sendMessage?.id || null;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Reply to a message
   */
  static async replyToMessage(
    parentMessageId: string,
    content: string
  ): Promise<string | null> {
    try {
      // Get parent message to construct reply subject
      const parentMessage = await this.getMessageById(parentMessageId);
      if (!parentMessage) return null;

      const subject = parentMessage.subject.startsWith('Re: ')
        ? parentMessage.subject
        : `Re: ${parentMessage.subject}`;

      return await this.sendMessage(
        subject,
        content,
        [parentMessage.sender.id],
        'normal',
        'response',
        parentMessageId
      );
    } catch (error) {
      console.error('Error replying to message:', error);
      return null;
    }
  }

  /**
   * Mark message as read
   */
  static async markAsRead(messageId: string): Promise<boolean> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return false;

      await apiClient.graphql(queries.MARK_MESSAGE_AS_READ, {
        messageId,
        tenantId,
      });

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  /**
   * Get conversation thread
   */
  static async getConversationThread(messageId: string): Promise<Message[]> {
    try {
      // Get the specific message first
      const message = await this.getMessageById(messageId);
      if (!message) return [];

      // For now, return the message and its replies
      // In a full implementation, you'd want to trace up to find the root message
      const messages: Message[] = [message];

      if (message.replies) {
        messages.push(...message.replies.map(reply => ({
          id: reply.id,
          subject: message.subject,
          content: reply.content,
          sentAt: reply.sentAt,
          isRead: true, // Replies are considered read when viewing the thread
          sender: reply.sender,
        }) as Message));
      }

      return messages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    } catch (error) {
      console.error('Error fetching conversation thread:', error);
      return [];
    }
  }

  /**
   * Search messages
   */
  static async searchMessages(query: string): Promise<Message[]> {
    try {
      // Get all messages and filter locally
      // In a real implementation, this would be handled by the backend
      const allMessages = await this.getMessages('all');

      return allMessages.filter(message =>
        message.subject.toLowerCase().includes(query.toLowerCase()) ||
        message.content.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Get unread messages
   */
  static async getUnreadMessages(): Promise<Message[]> {
    try {
      return await this.getMessages('unread');
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      return [];
    }
  }

  /**
   * Get sent messages
   */
  static async getSentMessages(): Promise<Message[]> {
    try {
      return await this.getMessages('sent');
    } catch (error) {
      console.error('Error fetching sent messages:', error);
      return [];
    }
  }

  /**
   * Get message templates
   */
  static getMessageTemplates(): Array<{ title: string; content: string }> {
    return [
      {
        title: 'Solicitud de reunión',
        content: 'Estimado/a [Nombre],\n\nMe gustaría solicitar una reunión para discutir [tema]. ¿Podría indicarme su disponibilidad?\n\nGracias,\n[Su nombre]',
      },
      {
        title: 'Justificación de ausencia',
        content: 'Estimado/a profesor/a,\n\nPor medio de la presente, justifico la ausencia de mi hijo/a [Nombre] el día [fecha] debido a [motivo].\n\nAtentamente,\n[Su nombre]',
      },
      {
        title: 'Consulta académica',
        content: 'Estimado/a [Nombre],\n\nMe gustaría realizar una consulta sobre [tema académico]. [Detalles de la consulta]\n\nQuedo a la espera de su respuesta.\n\nSaludos cordiales,\n[Su nombre]',
      },
      {
        title: 'Agradecimiento',
        content: 'Estimado/a [Nombre],\n\nQuiero agradecerle por [motivo del agradecimiento]. [Detalles adicionales]\n\nMuchas gracias,\n[Su nombre]',
      },
    ];
  }
}