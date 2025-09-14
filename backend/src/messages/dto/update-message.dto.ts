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
export class UpdateMessageDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'normal', 'high', 'urgent'])
  priority?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(['announcement', 'notice', 'reminder', 'alert', 'personal'])
  type?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowReplies?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentUrls?: string[];
}
