import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  IsIn,
} from 'class-validator';

@InputType()
export class UpdateExitPermissionDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  authorizedName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  authorizedDoc?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  authorizedPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationship?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  exitDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  exitTime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  returnTime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  transportMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

@InputType()
export class ApproveExitPermissionDto {
  @Field()
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
