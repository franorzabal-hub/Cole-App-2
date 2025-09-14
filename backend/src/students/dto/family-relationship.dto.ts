import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsIn,
} from 'class-validator';

@InputType()
export class CreateFamilyRelationshipDto {
  @Field()
  @IsString()
  studentId: string;

  @Field()
  @IsString()
  parentId: string;

  @Field()
  @IsString()
  @IsIn([
    'father',
    'mother',
    'guardian',
    'grandfather',
    'grandmother',
    'uncle',
    'aunt',
    'sibling',
    'other',
  ])
  relationshipType: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isPrimaryContact?: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  canPickup?: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  canViewGrades?: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  canAuthorizeExits?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

@InputType()
export class UpdateFamilyRelationshipDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsIn([
    'father',
    'mother',
    'guardian',
    'grandfather',
    'grandmother',
    'uncle',
    'aunt',
    'sibling',
    'other',
  ])
  relationshipType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPrimaryContact?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  canPickup?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  canViewGrades?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  canAuthorizeExits?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
