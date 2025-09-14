import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  private mapMessageToGraphQL(message: any, userId?: string): any {
    const recipientInfo = userId
      ? message.recipients?.find(
          (r: any) =>
            (r.recipientType === 'teacher' && r.recipientId === userId) ||
            (r.recipientType === 'parent' && r.recipientId === userId),
        )
      : null;

    return {
      ...message,
      senderName: message.sender?.person
        ? `${message.sender.person.firstName} ${message.sender.person.lastName}`
        : null,
      isRead: recipientInfo ? recipientInfo.isRead : null,
      readAt: recipientInfo ? recipientInfo.readAt : null,
      replyCount: message._count?.replies || message.replies?.length || null,
    };
  }

  async create(
    tenantId: string,
    senderId: string,
    createMessageDto: CreateMessageDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Validate sender is a teacher
    const sender = await tenantClient.teacher.findUnique({
      where: { id: senderId },
    });

    if (!sender) {
      throw new BadRequestException('Only teachers can send messages');
    }

    // Validate parent message if provided
    if (createMessageDto.parentMessageId) {
      const parentMessage = await tenantClient.message.findUnique({
        where: { id: createMessageDto.parentMessageId },
      });

      if (!parentMessage) {
        throw new BadRequestException('Parent message not found');
      }

      if (!parentMessage.allowReplies) {
        throw new BadRequestException('Replies not allowed for this message');
      }
    }

    // Create message
    const message = await tenantClient.message.create({
      data: {
        senderId,
        parentMessageId: createMessageDto.parentMessageId,
        subject: createMessageDto.subject,
        content: createMessageDto.content,
        priority: createMessageDto.priority || 'normal',
        type: createMessageDto.type || 'announcement',
        allowReplies: createMessageDto.allowReplies ?? true,
        attachmentUrls: createMessageDto.attachmentUrls || [],
      },
      include: {
        sender: {
          include: {
            person: true,
          },
        },
      },
    });

    // Create message recipients
    const recipientData = await this.processRecipients(
      tenantClient,
      createMessageDto.recipients,
    );

    await tenantClient.messageRecipient.createMany({
      data: recipientData.map((recipient) => ({
        messageId: message.id,
        recipientType: recipient.recipientType,
        recipientId: recipient.recipientId,
      })),
    });

    return this.findOne(message.id, tenantId);
  }

  private async processRecipients(
    tenantClient: any,
    recipients: any[],
  ): Promise<any[]> {
    const processedRecipients: any[] = [];

    for (const recipient of recipients) {
      if (recipient.recipientType === 'class') {
        // Get all students in the class
        const studentClasses = await tenantClient.studentClass.findMany({
          where: { classId: recipient.recipientId },
          include: {
            student: {
              include: {
                familyRelations: {
                  include: {
                    parent: true,
                  },
                },
              },
            },
          },
        });

        // Add all parents of students in the class
        for (const studentClass of studentClasses) {
          for (const relation of studentClass.student.familyRelations) {
            processedRecipients.push({
              recipientType: 'parent',
              recipientId: relation.parent.id,
            });
          }
        }
      } else if (recipient.recipientType === 'grade') {
        // Get all students in the grade
        const students = await tenantClient.student.findMany({
          where: { gradeLevel: recipient.recipientId },
          include: {
            familyRelations: {
              include: {
                parent: true,
              },
            },
          },
        });

        // Add all parents of students in the grade
        for (const student of students) {
          for (const relation of student.familyRelations) {
            processedRecipients.push({
              recipientType: 'parent',
              recipientId: relation.parent.id,
            });
          }
        }
      } else {
        // Direct recipient
        processedRecipients.push(recipient);
      }
    }

    return processedRecipients;
  }

  async findAll(
    tenantId: string,
    userId: string,
    options: {
      type?: string;
      priority?: string;
      unreadOnly?: boolean;
      parentMessageId?: string;
      skip?: number;
      take?: number;
    } = {},
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // First find the user's context (parent, teacher, etc.)
    const userContext = await this.getUserContext(tenantClient, userId);

    const where: any = {
      recipients: {
        some: {
          recipientType: userContext.type,
          recipientId: userContext.id,
        },
      },
    };

    if (options.type) {
      where.type = options.type;
    }

    if (options.priority) {
      where.priority = options.priority;
    }

    if (options.unreadOnly) {
      where.recipients = {
        some: {
          recipientType: userContext.type,
          recipientId: userContext.id,
          isRead: false,
        },
      };
    }

    if (options.parentMessageId) {
      where.parentMessageId = options.parentMessageId;
    }

    const messages = await tenantClient.message.findMany({
      where,
      include: {
        sender: {
          include: {
            person: true,
          },
        },
        recipients: {
          where: {
            recipientType: userContext.type,
            recipientId: userContext.id,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      skip: options.skip,
      take: options.take,
    });

    return messages.map((message) => this.mapMessageToGraphQL(message, userId));
  }

  async findOne(id: string, tenantId: string, userId?: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const message = await tenantClient.message.findUnique({
      where: { id },
      include: {
        sender: {
          include: {
            person: true,
          },
        },
        recipients: true,
        replies: {
          include: {
            sender: {
              include: {
                person: true,
              },
            },
            recipients: true,
          },
          orderBy: {
            sentAt: 'asc',
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // If userId provided, check if user has access
    if (userId) {
      const userContext = await this.getUserContext(tenantClient, userId);
      const hasAccess = message.recipients.some(
        (r) =>
          r.recipientType === userContext.type &&
          r.recipientId === userContext.id,
      );

      if (!hasAccess && message.senderId !== userContext.id) {
        throw new ForbiddenException('Access denied to this message');
      }
    }

    return this.mapMessageToGraphQL(message, userId);
  }

  async update(
    id: string,
    tenantId: string,
    senderId: string,
    updateMessageDto: UpdateMessageDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const message = await tenantClient.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== senderId) {
      throw new ForbiddenException('Only the sender can update this message');
    }

    const updatedMessage = await tenantClient.message.update({
      where: { id },
      data: updateMessageDto,
      include: {
        sender: {
          include: {
            person: true,
          },
        },
        recipients: true,
      },
    });

    return this.mapMessageToGraphQL(updatedMessage);
  }

  async remove(id: string, tenantId: string, senderId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const message = await tenantClient.message.findUnique({
      where: { id },
      include: {
        replies: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== senderId) {
      throw new ForbiddenException('Only the sender can delete this message');
    }

    // Check if message has replies
    if (message.replies.length > 0) {
      throw new BadRequestException('Cannot delete message with replies');
    }

    // Delete recipients first
    await tenantClient.messageRecipient.deleteMany({
      where: { messageId: id },
    });

    // Delete message
    await tenantClient.message.delete({
      where: { id },
    });

    return true;
  }

  async markAsRead(messageId: string, tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const userContext = await this.getUserContext(tenantClient, userId);

    const recipient = await tenantClient.messageRecipient.findUnique({
      where: {
        messageId_recipientType_recipientId: {
          messageId,
          recipientType: userContext.type,
          recipientId: userContext.id,
        },
      },
    });

    if (!recipient) {
      throw new NotFoundException('Message recipient not found');
    }

    await tenantClient.messageRecipient.update({
      where: {
        messageId_recipientType_recipientId: {
          messageId,
          recipientType: userContext.type,
          recipientId: userContext.id,
        },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return true;
  }

  async getUnreadCount(tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const userContext = await this.getUserContext(tenantClient, userId);

    return tenantClient.messageRecipient.count({
      where: {
        recipientType: userContext.type,
        recipientId: userContext.id,
        isRead: false,
      },
    });
  }

  async reply(
    tenantId: string,
    parentMessageId: string,
    senderId: string,
    content: string,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const parentMessage = await tenantClient.message.findUnique({
      where: { id: parentMessageId },
      include: {
        recipients: true,
      },
    });

    if (!parentMessage) {
      throw new NotFoundException('Parent message not found');
    }

    if (!parentMessage.allowReplies) {
      throw new BadRequestException('Replies not allowed for this message');
    }

    // Check if sender has access to the parent message
    const userContext = await this.getUserContext(tenantClient, senderId);
    const hasAccess =
      parentMessage.recipients.some(
        (r) =>
          r.recipientType === userContext.type &&
          r.recipientId === userContext.id,
      ) || parentMessage.senderId === userContext.id;

    if (!hasAccess) {
      throw new ForbiddenException('Cannot reply to this message');
    }

    // Create reply
    const reply = await tenantClient.message.create({
      data: {
        senderId: userContext.id,
        parentMessageId,
        content,
        type: 'personal',
        priority: 'normal',
      },
      include: {
        sender: {
          include: {
            person: true,
          },
        },
      },
    });

    // Add sender and original sender as recipients
    const recipients = [
      {
        messageId: reply.id,
        recipientType: 'teacher',
        recipientId: parentMessage.senderId,
      },
    ];

    if (
      userContext.type !== 'teacher' ||
      userContext.id !== parentMessage.senderId
    ) {
      recipients.push({
        messageId: reply.id,
        recipientType: userContext.type,
        recipientId: userContext.id,
      });
    }

    await tenantClient.messageRecipient.createMany({
      data: recipients,
    });

    return this.mapMessageToGraphQL(reply);
  }

  private async getUserContext(tenantClient: any, userId: string) {
    // Try to find user as teacher
    const teacher = await tenantClient.teacher.findFirst({
      where: { userId },
    });

    if (teacher) {
      return { type: 'teacher', id: teacher.id };
    }

    // Try to find user as parent
    const parent = await tenantClient.parent.findFirst({
      where: { userId },
    });

    if (parent) {
      return { type: 'parent', id: parent.id };
    }

    throw new BadRequestException('User context not found');
  }
}
