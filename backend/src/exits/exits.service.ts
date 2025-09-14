import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExitPermissionDto } from './dto/create-exit-permission.dto';
import {
  UpdateExitPermissionDto,
  ApproveExitPermissionDto,
} from './dto/update-exit-permission.dto';

@Injectable()
export class ExitsService {
  constructor(private prisma: PrismaService) {}

  private mapExitPermissionToGraphQL(exitPermission: any): any {
    return {
      ...exitPermission,
      studentName: exitPermission.student?.person
        ? `${exitPermission.student.person.firstName} ${exitPermission.student.person.lastName}`
        : null,
      requestedByName: exitPermission.requestedBy?.person
        ? `${exitPermission.requestedBy.person.firstName} ${exitPermission.requestedBy.person.lastName}`
        : null,
      approvedByName: exitPermission.approvedBy?.person
        ? `${exitPermission.approvedBy.person.firstName} ${exitPermission.approvedBy.person.lastName}`
        : null,
    };
  }

  async create(
    tenantId: string,
    requestedById: string,
    createExitPermissionDto: CreateExitPermissionDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Validate parent exists
    const parent = await tenantClient.parent.findFirst({
      where: { userId: requestedById },
    });

    if (!parent) {
      throw new BadRequestException(
        'Only parents can request exit permissions',
      );
    }

    // Validate student exists
    const student = await tenantClient.student.findUnique({
      where: { id: createExitPermissionDto.studentId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    // Validate parent-student relationship
    const relationship = await tenantClient.familyRelationship.findFirst({
      where: {
        studentId: createExitPermissionDto.studentId,
        parentId: parent.id,
        canAuthorizeExits: true,
      },
    });

    if (!relationship) {
      throw new ForbiddenException(
        'Parent not authorized to request exit permissions for this student',
      );
    }

    const exitPermission = await tenantClient.exitPermission.create({
      data: {
        ...createExitPermissionDto,
        requestedById: parent.id,
        status: 'pending',
      },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
        requestedBy: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapExitPermissionToGraphQL(exitPermission);
  }

  async findAll(
    tenantId: string,
    options: {
      studentId?: string;
      status?: string;
      campusId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      requestedById?: string;
      skip?: number;
      take?: number;
    } = {},
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = {};

    if (options.studentId) {
      where.studentId = options.studentId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.requestedById) {
      where.requestedById = options.requestedById;
    }

    if (options.campusId) {
      where.student = {
        campusId: options.campusId,
      };
    }

    if (options.dateFrom || options.dateTo) {
      where.exitDate = {};
      if (options.dateFrom) {
        where.exitDate.gte = options.dateFrom;
      }
      if (options.dateTo) {
        where.exitDate.lte = options.dateTo;
      }
    }

    const exitPermissions = await tenantClient.exitPermission.findMany({
      where,
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
        requestedBy: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: options.skip,
      take: options.take,
    });

    return exitPermissions.map((permission) =>
      this.mapExitPermissionToGraphQL(permission),
    );
  }

  async findOne(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const exitPermission = await tenantClient.exitPermission.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
        requestedBy: {
          include: {
            person: true,
          },
        },
      },
    });

    if (!exitPermission) {
      throw new NotFoundException('Exit permission not found');
    }

    return this.mapExitPermissionToGraphQL(exitPermission);
  }

  async findByStudent(tenantId: string, studentId: string, userId?: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // If userId provided, validate parent-student relationship
    if (userId) {
      const parent = await tenantClient.parent.findFirst({
        where: { userId },
      });

      if (parent) {
        const relationship = await tenantClient.familyRelationship.findFirst({
          where: {
            studentId,
            parentId: parent.id,
          },
        });

        if (!relationship) {
          throw new ForbiddenException(
            "Access denied to this student's exit permissions",
          );
        }
      }
    }

    const exitPermissions = await tenantClient.exitPermission.findMany({
      where: { studentId },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
        requestedBy: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        exitDate: 'desc',
      },
    });

    return exitPermissions.map((permission) =>
      this.mapExitPermissionToGraphQL(permission),
    );
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

    const exitPermissions = await tenantClient.exitPermission.findMany({
      where: { requestedById: parent.id },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
        requestedBy: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return exitPermissions.map((permission) =>
      this.mapExitPermissionToGraphQL(permission),
    );
  }

  async update(
    id: string,
    tenantId: string,
    userId: string,
    updateExitPermissionDto: UpdateExitPermissionDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Find the exit permission
    const exitPermission = await tenantClient.exitPermission.findUnique({
      where: { id },
      include: {
        requestedBy: true,
      },
    });

    if (!exitPermission) {
      throw new NotFoundException('Exit permission not found');
    }

    // Check if request is still pending
    if (exitPermission.status !== 'pending') {
      throw new BadRequestException(
        'Cannot update non-pending exit permission',
      );
    }

    // Validate user can update (must be the parent who requested)
    const parent = await tenantClient.parent.findFirst({
      where: { userId },
    });

    if (!parent || exitPermission.requestedById !== parent.id) {
      throw new ForbiddenException(
        'Not authorized to update this exit permission',
      );
    }

    const updatedExitPermission = await tenantClient.exitPermission.update({
      where: { id },
      data: updateExitPermissionDto,
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
        requestedBy: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapExitPermissionToGraphQL(updatedExitPermission);
  }

  async approve(
    id: string,
    tenantId: string,
    approvedBy: string,
    approveDto: ApproveExitPermissionDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Find the exit permission
    const exitPermission = await tenantClient.exitPermission.findUnique({
      where: { id },
    });

    if (!exitPermission) {
      throw new NotFoundException('Exit permission not found');
    }

    // Check if request is still pending
    if (exitPermission.status !== 'pending') {
      throw new BadRequestException('Exit permission already processed');
    }

    // Validate approver is authorized (teacher or admin)
    const teacher = await tenantClient.teacher.findFirst({
      where: { userId: approvedBy },
    });

    if (!teacher) {
      throw new ForbiddenException(
        'Only teachers can approve exit permissions',
      );
    }

    const updateData: any = {
      status: approveDto.status,
      approvedBy: teacher.id,
      approvedAt: new Date(),
    };

    if (approveDto.rejectionReason) {
      updateData.rejectionReason = approveDto.rejectionReason;
    }

    if (approveDto.notes) {
      updateData.notes = approveDto.notes;
    }

    const updatedExitPermission = await tenantClient.exitPermission.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
        requestedBy: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapExitPermissionToGraphQL(updatedExitPermission);
  }

  async cancel(id: string, tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Find the exit permission
    const exitPermission = await tenantClient.exitPermission.findUnique({
      where: { id },
      include: {
        requestedBy: true,
      },
    });

    if (!exitPermission) {
      throw new NotFoundException('Exit permission not found');
    }

    // Check if request can be cancelled (pending or approved, not rejected)
    if (!['pending', 'approved'].includes(exitPermission.status)) {
      throw new BadRequestException('Cannot cancel this exit permission');
    }

    // Validate user can cancel (must be the parent who requested)
    const parent = await tenantClient.parent.findFirst({
      where: { userId },
    });

    if (!parent || exitPermission.requestedById !== parent.id) {
      throw new ForbiddenException(
        'Not authorized to cancel this exit permission',
      );
    }

    const updatedExitPermission = await tenantClient.exitPermission.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
        requestedBy: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapExitPermissionToGraphQL(updatedExitPermission);
  }

  async remove(id: string, tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Find the exit permission
    const exitPermission = await tenantClient.exitPermission.findUnique({
      where: { id },
      include: {
        requestedBy: true,
      },
    });

    if (!exitPermission) {
      throw new NotFoundException('Exit permission not found');
    }

    // Can only delete pending requests
    if (exitPermission.status !== 'pending') {
      throw new BadRequestException('Can only delete pending exit permissions');
    }

    // Validate user can delete (must be the parent who requested)
    const parent = await tenantClient.parent.findFirst({
      where: { userId },
    });

    if (!parent || exitPermission.requestedById !== parent.id) {
      throw new ForbiddenException(
        'Not authorized to delete this exit permission',
      );
    }

    await tenantClient.exitPermission.delete({
      where: { id },
    });

    return true;
  }

  async getPendingCount(tenantId: string, campusId?: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = {
      status: 'pending',
    };

    if (campusId) {
      where.student = {
        campusId,
      };
    }

    return tenantClient.exitPermission.count({
      where,
    });
  }

  async getStatusSummary(
    tenantId: string,
    campusId?: string,
    dateFrom?: Date,
    dateTo?: Date,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = {};

    if (campusId) {
      where.student = {
        campusId,
      };
    }

    if (dateFrom || dateTo) {
      where.exitDate = {};
      if (dateFrom) {
        where.exitDate.gte = dateFrom;
      }
      if (dateTo) {
        where.exitDate.lte = dateTo;
      }
    }

    const [pending, approved, rejected, cancelled] = await Promise.all([
      tenantClient.exitPermission.count({
        where: { ...where, status: 'pending' },
      }),
      tenantClient.exitPermission.count({
        where: { ...where, status: 'approved' },
      }),
      tenantClient.exitPermission.count({
        where: { ...where, status: 'rejected' },
      }),
      tenantClient.exitPermission.count({
        where: { ...where, status: 'cancelled' },
      }),
    ]);

    return {
      pending,
      approved,
      rejected,
      cancelled,
      total: pending + approved + rejected + cancelled,
    };
  }
}
