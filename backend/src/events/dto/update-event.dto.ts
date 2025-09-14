import { Field, InputType, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

@InputType()
export class UpdateEventDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  locationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationText?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDatetime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDatetime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAttendees?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  registrationRequired?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  registrationDeadline?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowGuests?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requirements?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isCancelled?: boolean;
}
