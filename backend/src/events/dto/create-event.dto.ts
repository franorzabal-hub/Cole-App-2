import { Field, InputType, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
} from 'class-validator';

@InputType()
export class CreateEventDto {
  @Field()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field()
  @IsString()
  campusId: string;

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

  @Field()
  @IsDateString()
  startDatetime: Date;

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

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  registrationRequired?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  registrationDeadline?: Date;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  allowGuests?: boolean;

  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requirements?: string;
}
