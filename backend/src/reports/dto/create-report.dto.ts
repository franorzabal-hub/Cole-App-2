import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsIn,
  IsJSON,
} from 'class-validator';

@InputType()
export class CreateReportDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  studentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  classId?: string;

  @Field()
  @IsString()
  @IsIn(['academic', 'behavior', 'attendance', 'progress', 'final', 'custom'])
  type: string;

  @Field()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  period?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string; // JSON string for structured content

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;
}
