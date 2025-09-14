import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  parentMessageId: string | null;

  @Field()
  senderId: string;

  @Field(() => String, { nullable: true })
  subject: string | null;

  @Field()
  content: string;

  @Field()
  priority: string;

  @Field()
  type: string;

  @Field()
  allowReplies: boolean;

  @Field(() => [String], { nullable: true })
  attachmentUrls: string[] | null;

  @Field()
  sentAt: Date;

  @Field()
  createdAt: Date;

  @Field(() => String, { nullable: true })
  senderName: string | null;

  @Field(() => Boolean, { nullable: true })
  isRead: boolean | null;

  @Field(() => Date, { nullable: true })
  readAt: Date | null;

  @Field(() => Int, { nullable: true })
  replyCount: number | null;
}

@ObjectType()
export class MessageRecipient {
  @Field()
  messageId: string;

  @Field()
  recipientType: string;

  @Field()
  recipientId: string;

  @Field()
  isRead: boolean;

  @Field(() => Date, { nullable: true })
  readAt: Date | null;
}

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private messagesService: MessagesService) {}

  @Query(() => [Message])
  async messages(
    @Args('tenantId') tenantId: string,
    @Args('type', { nullable: true }) type?: string,
    @Args('priority', { nullable: true }) priority?: string,
    @Args('unreadOnly', { nullable: true, type: () => Boolean })
    unreadOnly?: boolean,
    @Args('parentMessageId', { nullable: true }) parentMessageId?: string,
    @Args('skip', { nullable: true, type: () => Int }) skip?: number,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
    @Context() context?: any,
  ): Promise<Message[]> {
    const userId = context?.req?.user?.sub;
    return this.messagesService.findAll(tenantId, userId, {
      type,
      priority,
      unreadOnly,
      parentMessageId,
      skip,
      take,
    });
  }

  @Query(() => Message, { nullable: true })
  async message(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Context() context?: any,
  ): Promise<Message> {
    const userId = context?.req?.user?.sub;
    return this.messagesService.findOne(id, tenantId, userId);
  }

  @Mutation(() => Message)
  async createMessage(
    @Args('tenantId') tenantId: string,
    @Args('input') input: CreateMessageDto,
    @Context() context: any,
  ): Promise<Message> {
    const senderId = context.req.user?.sub;
    return this.messagesService.create(tenantId, senderId, input);
  }

  @Mutation(() => Message)
  async updateMessage(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateMessageDto,
    @Context() context: any,
  ): Promise<Message> {
    const senderId = context.req.user?.sub;
    return this.messagesService.update(id, tenantId, senderId, input);
  }

  @Mutation(() => Boolean)
  async deleteMessage(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const senderId = context.req.user?.sub;
    return this.messagesService.remove(id, tenantId, senderId);
  }

  @Mutation(() => Boolean)
  async markMessageAsRead(
    @Args('messageId') messageId: string,
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user?.sub;
    return this.messagesService.markAsRead(messageId, tenantId, userId);
  }

  @Query(() => Int)
  async unreadMessageCount(
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<number> {
    const userId = context.req.user?.sub;
    return this.messagesService.getUnreadCount(tenantId, userId);
  }

  @Mutation(() => Message)
  async replyToMessage(
    @Args('tenantId') tenantId: string,
    @Args('parentMessageId') parentMessageId: string,
    @Args('content') content: string,
    @Context() context: any,
  ): Promise<Message> {
    const senderId = context.req.user?.sub;
    return this.messagesService.reply(
      tenantId,
      parentMessageId,
      senderId,
      content,
    );
  }
}
