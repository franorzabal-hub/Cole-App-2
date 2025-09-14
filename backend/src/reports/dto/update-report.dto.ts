import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsIn,
} from 'class-validator';

@InputType()
export class UpdateReportDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;
}
