import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateEventRegistrationDto {
  @Field()
  @IsString()
  eventId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  studentId?: string;

  @Field({ defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  numberOfGuests?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

@InputType()
export class UpdateEventRegistrationDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  numberOfGuests?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string; // 'registered', 'cancelled', 'attended'
}
