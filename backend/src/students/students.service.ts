import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import {
  CreateFamilyRelationshipDto,
  UpdateFamilyRelationshipDto,
} from './dto/family-relationship.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  private mapStudentToGraphQL(student: any): any {
    return {
      ...student,
      fullName: student.person
        ? `${student.person.firstName} ${student.person.lastName}`
        : null,
      campusName: student.campus?.name || null,
      relationshipType: student.relationshipType || null, // This comes from joins
      isPrimaryContact:
        student.isPrimaryContact !== undefined
          ? student.isPrimaryContact
          : null,
    };
  }

  private mapFamilyRelationshipToGraphQL(relationship: any): any {
    return {
      ...relationship,
      studentName: relationship.student?.person
        ? `${relationship.student.person.firstName} ${relationship.student.person.lastName}`
        : null,
      parentName: relationship.parent?.person
        ? `${relationship.parent.person.firstName} ${relationship.parent.person.lastName}`
        : null,
    };
  }

  async create(tenantId: string, createStudentDto: CreateStudentDto) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Validate campus exists
    const campus = await tenantClient.campus.findUnique({
      where: { id: createStudentDto.campusId },
    });

    if (!campus) {
      throw new BadRequestException('Campus not found');
    }

    // Check if document number is unique (if provided)
    if (createStudentDto.person.documentNumber) {
      const existingPerson = await tenantClient.person.findUnique({
        where: { documentNumber: createStudentDto.person.documentNumber },
      });

      if (existingPerson) {
        throw new BadRequestException('Document number already exists');
      }
    }

    // Check if student code is unique (if provided)
    if (createStudentDto.studentCode) {
      const existingStudent = await tenantClient.student.findUnique({
        where: { studentCode: createStudentDto.studentCode },
      });

      if (existingStudent) {
        throw new BadRequestException('Student code already exists');
      }
    }

    // Parse custom data
    let personCustomData: any = null;
    let studentCustomData: any = null;

    if (createStudentDto.person.customData) {
      try {
        personCustomData = JSON.parse(createStudentDto.person.customData);
      } catch (error) {
        personCustomData = createStudentDto.person.customData;
      }
    }

    if (createStudentDto.customData) {
      try {
        studentCustomData = JSON.parse(createStudentDto.customData);
      } catch (error) {
        studentCustomData = createStudentDto.customData;
      }
    }

    // Create person and student in a transaction
    return tenantClient.$transaction(async (tx) => {
      // Create person
      const person = await tx.person.create({
        data: {
          ...createStudentDto.person,
          customData: personCustomData,
        },
      });

      // Create student
      const student = await tx.student.create({
        data: {
          personId: person.id,
          campusId: createStudentDto.campusId,
          studentCode: createStudentDto.studentCode,
          enrollmentDate: createStudentDto.enrollmentDate,
          gradeLevel: createStudentDto.gradeLevel,
          section: createStudentDto.section,
          academicYear: createStudentDto.academicYear,
          status: createStudentDto.status || 'active',
          notes: createStudentDto.notes,
          customData: studentCustomData,
        },
        include: {
          person: true,
          campus: true,
          familyRelations: {
            include: {
              parent: {
                include: {
                  person: true,
                },
              },
            },
          },
        },
      });

      return this.mapStudentToGraphQL(student);
    });
  }

  async findAll(
    tenantId: string,
    options: {
      campusId?: string;
      gradeLevel?: string;
      section?: string;
      status?: string;
      academicYear?: number;
      search?: string;
      skip?: number;
      take?: number;
    } = {},
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = {};

    if (options.campusId) {
      where.campusId = options.campusId;
    }

    if (options.gradeLevel) {
      where.gradeLevel = options.gradeLevel;
    }

    if (options.section) {
      where.section = options.section;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.academicYear) {
      where.academicYear = options.academicYear;
    }

    if (options.search) {
      where.OR = [
        {
          person: {
            firstName: {
              contains: options.search,
              mode: 'insensitive',
            },
          },
        },
        {
          person: {
            lastName: {
              contains: options.search,
              mode: 'insensitive',
            },
          },
        },
        {
          studentCode: {
            contains: options.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const students = await tenantClient.student.findMany({
      where,
      include: {
        person: true,
        campus: true,
        familyRelations: {
          include: {
            parent: {
              include: {
                person: true,
              },
            },
          },
        },
        studentClasses: {
          include: {
            class: true,
          },
        },
      },
      orderBy: [
        { gradeLevel: 'asc' },
        { section: 'asc' },
        { person: { lastName: 'asc' } },
        { person: { firstName: 'asc' } },
      ],
      skip: options.skip,
      take: options.take,
    });

    return students.map((student) => this.mapStudentToGraphQL(student));
  }

  async findOne(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const student = await tenantClient.student.findUnique({
      where: { id },
      include: {
        person: true,
        campus: true,
        familyRelations: {
          include: {
            parent: {
              include: {
                person: true,
              },
            },
          },
        },
        studentClasses: {
          include: {
            class: {
              include: {
                location: true,
              },
            },
          },
        },
        exitPermissions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Latest 5 exit permissions
        },
        reports: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Latest 5 reports
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.mapStudentToGraphQL(student);
  }

  async findByParent(tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Get parent record
    const parent = await tenantClient.parent.findFirst({
      where: { userId },
    });

    if (!parent) {
      throw new BadRequestException('Parent not found');
    }

    // Get students through family relationships
    const familyRelations = await tenantClient.familyRelationship.findMany({
      where: { parentId: parent.id },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
            studentClasses: {
              include: {
                class: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          person: {
            firstName: 'asc',
          },
        },
      },
    });

    return familyRelations.map((relation) =>
      this.mapStudentToGraphQL({
        ...relation.student,
        relationshipType: relation.relationshipType,
        isPrimaryContact: relation.isPrimaryContact,
      }),
    );
  }

  async update(
    id: string,
    tenantId: string,
    updateStudentDto: UpdateStudentDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Find existing student
    const existingStudent = await tenantClient.student.findUnique({
      where: { id },
      include: { person: true },
    });

    if (!existingStudent) {
      throw new NotFoundException('Student not found');
    }

    // Validate campus if provided
    if (updateStudentDto.campusId) {
      const campus = await tenantClient.campus.findUnique({
        where: { id: updateStudentDto.campusId },
      });

      if (!campus) {
        throw new BadRequestException('Campus not found');
      }
    }

    // Check if student code is unique (if changed)
    if (
      updateStudentDto.studentCode &&
      updateStudentDto.studentCode !== existingStudent.studentCode
    ) {
      const existingCode = await tenantClient.student.findUnique({
        where: { studentCode: updateStudentDto.studentCode },
      });

      if (existingCode) {
        throw new BadRequestException('Student code already exists');
      }
    }

    // Check document number uniqueness if changed
    if (
      updateStudentDto.person?.documentNumber &&
      updateStudentDto.person.documentNumber !==
        existingStudent.person.documentNumber
    ) {
      const existingDoc = await tenantClient.person.findUnique({
        where: { documentNumber: updateStudentDto.person.documentNumber },
      });

      if (existingDoc) {
        throw new BadRequestException('Document number already exists');
      }
    }

    // Parse custom data
    let personCustomData: any = undefined;
    let studentCustomData: any = undefined;

    if (updateStudentDto.person?.customData) {
      try {
        personCustomData = JSON.parse(updateStudentDto.person.customData);
      } catch (error) {
        personCustomData = updateStudentDto.person.customData;
      }
    }

    if (updateStudentDto.customData) {
      try {
        studentCustomData = JSON.parse(updateStudentDto.customData);
      } catch (error) {
        studentCustomData = updateStudentDto.customData;
      }
    }

    // Update in transaction
    return tenantClient.$transaction(async (tx) => {
      // Update person if provided
      if (updateStudentDto.person) {
        await tx.person.update({
          where: { id: existingStudent.personId },
          data: {
            ...updateStudentDto.person,
            customData: personCustomData,
          },
        });
      }

      // Update student
      const updatedStudent = await tx.student.update({
        where: { id },
        data: {
          campusId: updateStudentDto.campusId,
          studentCode: updateStudentDto.studentCode,
          enrollmentDate: updateStudentDto.enrollmentDate,
          gradeLevel: updateStudentDto.gradeLevel,
          section: updateStudentDto.section,
          academicYear: updateStudentDto.academicYear,
          status: updateStudentDto.status,
          notes: updateStudentDto.notes,
          customData: studentCustomData,
        },
        include: {
          person: true,
          campus: true,
          familyRelations: {
            include: {
              parent: {
                include: {
                  person: true,
                },
              },
            },
          },
        },
      });

      return this.mapStudentToGraphQL(updatedStudent);
    });
  }

  async remove(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const student = await tenantClient.student.findUnique({
      where: { id },
      include: {
        exitPermissions: true,
        reports: true,
        studentClasses: true,
        familyRelations: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if student has dependencies
    if (student.exitPermissions.length > 0) {
      throw new BadRequestException(
        'Cannot delete student with existing exit permissions',
      );
    }

    if (student.reports.length > 0) {
      throw new BadRequestException(
        'Cannot delete student with existing reports',
      );
    }

    // Delete in transaction
    return tenantClient.$transaction(async (tx) => {
      // Delete student classes
      await tx.studentClass.deleteMany({
        where: { studentId: id },
      });

      // Delete family relationships
      await tx.familyRelationship.deleteMany({
        where: { studentId: id },
      });

      // Delete student
      await tx.student.delete({
        where: { id },
      });

      // Delete person
      await tx.person.delete({
        where: { id: student.personId },
      });

      return true;
    });
  }

  // Family relationship methods
  async createFamilyRelationship(
    tenantId: string,
    createRelationshipDto: CreateFamilyRelationshipDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Validate student exists
    const student = await tenantClient.student.findUnique({
      where: { id: createRelationshipDto.studentId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    // Validate parent exists
    const parent = await tenantClient.parent.findUnique({
      where: { id: createRelationshipDto.parentId },
    });

    if (!parent) {
      throw new BadRequestException('Parent not found');
    }

    // Check if relationship already exists
    const existingRelation = await tenantClient.familyRelationship.findUnique({
      where: {
        studentId_parentId: {
          studentId: createRelationshipDto.studentId,
          parentId: createRelationshipDto.parentId,
        },
      },
    });

    if (existingRelation) {
      throw new BadRequestException('Family relationship already exists');
    }

    const relationship = await tenantClient.familyRelationship.create({
      data: createRelationshipDto,
      include: {
        student: {
          include: {
            person: true,
          },
        },
        parent: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapFamilyRelationshipToGraphQL(relationship);
  }

  async updateFamilyRelationship(
    id: string,
    tenantId: string,
    updateRelationshipDto: UpdateFamilyRelationshipDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const relationship = await tenantClient.familyRelationship.findUnique({
      where: { id },
    });

    if (!relationship) {
      throw new NotFoundException('Family relationship not found');
    }

    const updatedRelationship = await tenantClient.familyRelationship.update({
      where: { id },
      data: updateRelationshipDto,
      include: {
        student: {
          include: {
            person: true,
          },
        },
        parent: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapFamilyRelationshipToGraphQL(updatedRelationship);
  }

  async deleteFamilyRelationship(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const relationship = await tenantClient.familyRelationship.findUnique({
      where: { id },
    });

    if (!relationship) {
      throw new NotFoundException('Family relationship not found');
    }

    await tenantClient.familyRelationship.delete({
      where: { id },
    });

    return true;
  }

  async getStudentStatistics(tenantId: string, campusId?: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = {};
    if (campusId) {
      where.campusId = campusId;
    }

    const [total, active, byGrade, byStatus] = await Promise.all([
      tenantClient.student.count({ where }),
      tenantClient.student.count({ where: { ...where, status: 'active' } }),
      tenantClient.student.groupBy({
        by: ['gradeLevel'],
        where,
        _count: { id: true },
      }),
      tenantClient.student.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byGrade: byGrade.reduce(
        (acc, item) => {
          acc[item.gradeLevel || 'Unknown'] = item._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
