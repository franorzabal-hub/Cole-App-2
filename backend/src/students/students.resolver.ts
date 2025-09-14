import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import {
  CreateFamilyRelationshipDto,
  UpdateFamilyRelationshipDto,
} from './dto/family-relationship.dto';
import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Person {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  documentType: string | null;

  @Field(() => String, { nullable: true })
  documentNumber: string | null;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => Date, { nullable: true })
  dateOfBirth: Date | null;

  @Field(() => String, { nullable: true })
  gender: string | null;

  @Field(() => String, { nullable: true })
  bloodType: string | null;

  @Field(() => String, { nullable: true })
  medicalNotes: string | null;

  @Field(() => String, { nullable: true })
  emergencyContact: string | null;

  @Field(() => String, { nullable: true })
  emergencyPhone: string | null;

  @Field(() => String, { nullable: true })
  photoUrl: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Student {
  @Field(() => ID)
  id: string;

  @Field()
  personId: string;

  @Field()
  campusId: string;

  @Field(() => String, { nullable: true })
  studentCode: string | null;

  @Field(() => Date, { nullable: true })
  enrollmentDate: Date | null;

  @Field(() => String, { nullable: true })
  gradeLevel: string | null;

  @Field(() => String, { nullable: true })
  section: string | null;

  @Field(() => Float, { nullable: true })
  academicYear: number | null;

  @Field()
  status: string;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  fullName: string | null;

  @Field(() => String, { nullable: true })
  campusName: string | null;

  @Field(() => String, { nullable: true })
  relationshipType: string | null; // For parent queries

  @Field(() => Boolean, { nullable: true })
  isPrimaryContact: boolean | null; // For parent queries
}

@ObjectType()
export class FamilyRelationship {
  @Field(() => ID)
  id: string;

  @Field()
  studentId: string;

  @Field()
  parentId: string;

  @Field()
  relationshipType: string;

  @Field()
  isPrimaryContact: boolean;

  @Field()
  canPickup: boolean;

  @Field()
  canViewGrades: boolean;

  @Field()
  canAuthorizeExits: boolean;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field()
  createdAt: Date;

  @Field(() => String, { nullable: true })
  studentName: string | null;

  @Field(() => String, { nullable: true })
  parentName: string | null;
}

@ObjectType()
export class StudentStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  inactive: number;

  @Field()
  byGrade: string; // JSON string

  @Field()
  byStatus: string; // JSON string
}

@Resolver(() => Student)
export class StudentsResolver {
  constructor(private studentsService: StudentsService) {}

  @Query(() => [Student])
  async students(
    @Args('tenantId') tenantId: string,
    @Args('campusId', { nullable: true }) campusId?: string,
    @Args('gradeLevel', { nullable: true }) gradeLevel?: string,
    @Args('section', { nullable: true }) section?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('academicYear', { nullable: true, type: () => Int })
    academicYear?: number,
    @Args('search', { nullable: true }) search?: string,
    @Args('skip', { nullable: true, type: () => Int }) skip?: number,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
  ): Promise<Student[]> {
    return this.studentsService.findAll(tenantId, {
      campusId,
      gradeLevel,
      section,
      status,
      academicYear,
      search,
      skip,
      take,
    });
  }

  @Query(() => Student, { nullable: true })
  async student(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<Student> {
    return this.studentsService.findOne(id, tenantId);
  }

  @Query(() => [Student])
  async myStudents(
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<Student[]> {
    const userId = context.req.user?.sub;
    return this.studentsService.findByParent(tenantId, userId);
  }

  @Mutation(() => Student)
  async createStudent(
    @Args('tenantId') tenantId: string,
    @Args('input') input: CreateStudentDto,
  ): Promise<Student> {
    return this.studentsService.create(tenantId, input);
  }

  @Mutation(() => Student)
  async updateStudent(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.update(id, tenantId, input);
  }

  @Mutation(() => Boolean)
  async deleteStudent(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<boolean> {
    return this.studentsService.remove(id, tenantId);
  }

  // Family relationship mutations
  @Mutation(() => FamilyRelationship)
  async createFamilyRelationship(
    @Args('tenantId') tenantId: string,
    @Args('input') input: CreateFamilyRelationshipDto,
  ): Promise<FamilyRelationship> {
    return this.studentsService.createFamilyRelationship(tenantId, input);
  }

  @Mutation(() => FamilyRelationship)
  async updateFamilyRelationship(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateFamilyRelationshipDto,
  ): Promise<FamilyRelationship> {
    return this.studentsService.updateFamilyRelationship(id, tenantId, input);
  }

  @Mutation(() => Boolean)
  async deleteFamilyRelationship(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<boolean> {
    return this.studentsService.deleteFamilyRelationship(id, tenantId);
  }

  @Query(() => StudentStatistics)
  async studentStatistics(
    @Args('tenantId') tenantId: string,
    @Args('campusId', { nullable: true }) campusId?: string,
  ): Promise<StudentStatistics> {
    const stats = await this.studentsService.getStudentStatistics(
      tenantId,
      campusId,
    );

    return {
      total: stats.total,
      active: stats.active,
      inactive: stats.inactive,
      byGrade: JSON.stringify(stats.byGrade),
      byStatus: JSON.stringify(stats.byStatus),
    };
  }
}
