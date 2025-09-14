import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsArray,
  IsIn,
} from 'class-validator';

@InputType()
export class CreateMessageDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  parentMessageId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @Field()
  @IsString()
  content: string;

  @Field({ defaultValue: 'normal' })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'normal', 'high', 'urgent'])
  priority?: string;

  @Field({ defaultValue: 'announcement' })
  @IsOptional()
  @IsString()
  @IsIn(['announcement', 'notice', 'reminder', 'alert', 'personal'])
  type?: string;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  allowReplies?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentUrls?: string[];

  @Field(() => [MessageRecipientInputDto])
  recipients: MessageRecipientInputDto[];
}

@InputType()
export class MessageRecipientInputDto {
  @Field()
  @IsString()
  @IsIn(['parent', 'teacher', 'student', 'class', 'grade'])
  recipientType: string;

  @Field()
  @IsString()
  recipientId: string;
}
