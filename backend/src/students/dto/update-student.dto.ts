import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

@InputType()
export class UpdatePersonDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  gender?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  emergencyContact?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customData?: string; // JSON string
}

@InputType()
export class UpdateStudentDto {
  @Field(() => UpdatePersonDto, { nullable: true })
  @IsOptional()
  person?: UpdatePersonDto;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  campusId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  studentCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gradeLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  section?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1900)
  academicYear?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customData?: string; // JSON string
}
