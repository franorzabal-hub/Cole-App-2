import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private mapReportToGraphQL(report: any, teacher?: any): any {
    return {
      ...report,
      studentName: report.student?.person
        ? `${report.student.person.firstName} ${report.student.person.lastName}`
        : null,
      generatedByName: teacher?.person
        ? `${teacher.person.firstName} ${teacher.person.lastName}`
        : null,
      content: report.content
        ? typeof report.content === 'string'
          ? report.content
          : JSON.stringify(report.content)
        : null,
    };
  }

  async create(
    tenantId: string,
    generatedBy: string,
    createReportDto: CreateReportDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Validate generator is a teacher
    const teacher = await tenantClient.teacher.findFirst({
      where: { userId: generatedBy },
    });

    if (!teacher) {
      throw new BadRequestException('Only teachers can generate reports');
    }

    // Validate student if provided
    if (createReportDto.studentId) {
      const student = await tenantClient.student.findUnique({
        where: { id: createReportDto.studentId },
      });

      if (!student) {
        throw new BadRequestException('Student not found');
      }
    }

    // Validate class if provided
    if (createReportDto.classId) {
      const classEntity = await tenantClient.class.findUnique({
        where: { id: createReportDto.classId },
      });

      if (!classEntity) {
        throw new BadRequestException('Class not found');
      }
    }

    // Parse content if it's a JSON string
    let parsedContent: any = null;
    if (createReportDto.content) {
      try {
        parsedContent = JSON.parse(createReportDto.content);
      } catch (error) {
        parsedContent = createReportDto.content; // Keep as string if not valid JSON
      }
    }

    const report = await tenantClient.report.create({
      data: {
        studentId: createReportDto.studentId,
        classId: createReportDto.classId,
        type: createReportDto.type,
        title: createReportDto.title,
        period: createReportDto.period,
        content: parsedContent,
        fileUrl: createReportDto.fileUrl,
        generatedBy: teacher.id,
        isFinal: createReportDto.isFinal || false,
      },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
      },
    });

    return this.mapReportToGraphQL(report, teacher);
  }

  async findAll(
    tenantId: string,
    options: {
      studentId?: string;
      classId?: string;
      type?: string;
      period?: string;
      isFinal?: boolean;
      generatedBy?: string;
      skip?: number;
      take?: number;
    } = {},
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = {};

    if (options.studentId) {
      where.studentId = options.studentId;
    }

    if (options.classId) {
      where.classId = options.classId;
    }

    if (options.type) {
      where.type = options.type;
    }

    if (options.period) {
      where.period = options.period;
    }

    if (options.isFinal !== undefined) {
      where.isFinal = options.isFinal;
    }

    if (options.generatedBy) {
      where.generatedBy = options.generatedBy;
    }

    const reports = await tenantClient.report.findMany({
      where,
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: options.skip,
      take: options.take,
    });

    const mappedReports: any[] = [];
    for (const report of reports) {
      const teacher = await tenantClient.teacher.findUnique({
        where: { id: report.generatedBy },
        include: { person: true },
      });
      mappedReports.push(this.mapReportToGraphQL(report, teacher));
    }
    return mappedReports;
  }

  async findOne(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const report = await tenantClient.report.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const teacher = await tenantClient.teacher.findUnique({
      where: { id: report.generatedBy },
      include: { person: true },
    });
    return this.mapReportToGraphQL(report, teacher);
  }

  async findByStudent(tenantId: string, studentId: string, userId?: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Validate student exists
    const student = await tenantClient.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

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
            canViewGrades: true, // Only parents with grade viewing permission
          },
        });

        if (!relationship) {
          throw new ForbiddenException(
            "Access denied to this student's reports",
          );
        }
      }
    }

    const reports = await tenantClient.report.findMany({
      where: { studentId },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mappedReports: any[] = [];
    for (const report of reports) {
      const teacher = await tenantClient.teacher.findUnique({
        where: { id: report.generatedBy },
        include: { person: true },
      });
      mappedReports.push(this.mapReportToGraphQL(report, teacher));
    }
    return mappedReports;
  }

  async findByClass(tenantId: string, classId: string, userId?: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Validate class exists
    const classEntity = await tenantClient.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // If userId provided, validate teacher-class relationship
    if (userId) {
      const teacher = await tenantClient.teacher.findFirst({
        where: { userId },
      });

      if (teacher) {
        const teacherClass = await tenantClient.teacherClass.findFirst({
          where: {
            teacherId: teacher.id,
            classId,
          },
        });

        if (!teacherClass) {
          throw new ForbiddenException("Access denied to this class's reports");
        }
      }
    }

    const reports = await tenantClient.report.findMany({
      where: { classId },
      include: {
        student: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mappedReports: any[] = [];
    for (const report of reports) {
      const teacher = await tenantClient.teacher.findUnique({
        where: { id: report.generatedBy },
        include: { person: true },
      });
      mappedReports.push(this.mapReportToGraphQL(report, teacher));
    }
    return mappedReports;
  }

  async update(
    id: string,
    tenantId: string,
    userId: string,
    updateReportDto: UpdateReportDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Find the report
    const report = await tenantClient.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Validate user is the generator
    const teacher = await tenantClient.teacher.findFirst({
      where: { userId },
      include: { person: true },
    });

    if (!teacher || report.generatedBy !== teacher.id) {
      throw new ForbiddenException(
        'Only the report generator can update this report',
      );
    }

    // Cannot update final reports
    if (report.isFinal) {
      throw new BadRequestException('Cannot update final reports');
    }

    // Parse content if it's a JSON string
    let parsedContent: any = updateReportDto.content;
    if (updateReportDto.content) {
      try {
        parsedContent = JSON.parse(updateReportDto.content);
      } catch (error) {
        // Keep as string if not valid JSON
      }
    }

    const updatedReport = await tenantClient.report.update({
      where: { id },
      data: {
        ...updateReportDto,
        content: parsedContent,
      },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
      },
    });

    return this.mapReportToGraphQL(updatedReport, teacher);
  }

  async markAsFinal(id: string, tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Find the report
    const report = await tenantClient.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Validate user is the generator
    const teacher = await tenantClient.teacher.findFirst({
      where: { userId },
      include: { person: true },
    });

    if (!teacher || report.generatedBy !== teacher.id) {
      throw new ForbiddenException(
        'Only the report generator can mark this report as final',
      );
    }

    if (report.isFinal) {
      throw new BadRequestException('Report is already marked as final');
    }

    const updatedReport = await tenantClient.report.update({
      where: { id },
      data: { isFinal: true },
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
      },
    });

    return this.mapReportToGraphQL(updatedReport, teacher);
  }

  async remove(id: string, tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Find the report
    const report = await tenantClient.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Validate user is the generator
    const teacher = await tenantClient.teacher.findFirst({
      where: { userId },
      include: { person: true },
    });

    if (!teacher || report.generatedBy !== teacher.id) {
      throw new ForbiddenException(
        'Only the report generator can delete this report',
      );
    }

    // Cannot delete final reports
    if (report.isFinal) {
      throw new BadRequestException('Cannot delete final reports');
    }

    await tenantClient.report.delete({
      where: { id },
    });

    return true;
  }

  async getReportTypes(tenantId: string) {
    return [
      { value: 'academic', label: 'Academic Report' },
      { value: 'behavior', label: 'Behavior Report' },
      { value: 'attendance', label: 'Attendance Report' },
      { value: 'progress', label: 'Progress Report' },
      { value: 'final', label: 'Final Report' },
      { value: 'custom', label: 'Custom Report' },
    ];
  }

  async getReportStatistics(
    tenantId: string,
    options: {
      campusId?: string;
      classId?: string;
      period?: string;
      type?: string;
    } = {},
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = {};

    if (options.type) {
      where.type = options.type;
    }

    if (options.period) {
      where.period = options.period;
    }

    if (options.classId) {
      where.classId = options.classId;
    }

    if (options.campusId) {
      where.student = {
        campusId: options.campusId,
      };
    }

    const [total, finalReports, byType] = await Promise.all([
      tenantClient.report.count({ where }),
      tenantClient.report.count({ where: { ...where, isFinal: true } }),
      tenantClient.report.groupBy({
        by: ['type'],
        where,
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      total,
      finalReports,
      draftReports: total - finalReports,
      byType: byType.reduce(
        (acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async generateStudentSummaryReport(
    tenantId: string,
    studentId: string,
    period?: string,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = { studentId };
    if (period) {
      where.period = period;
    }

    const reports = await tenantClient.report.findMany({
      where,
      include: {
        student: {
          include: {
            person: true,
            campus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const student = reports[0]?.student;
    if (!student) {
      throw new NotFoundException('Student not found or no reports available');
    }

    const reportsByType = reports.reduce(
      (acc, report) => {
        if (!acc[report.type]) {
          acc[report.type] = [];
        }
        acc[report.type].push(report);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return {
      student: {
        id: student.id,
        name: `${student.person.firstName} ${student.person.lastName}`,
        campus: student.campus.name,
      },
      period,
      totalReports: reports.length,
      finalReports: reports.filter((r) => r.isFinal).length,
      reportsByType,
      latestReport: reports[0],
      generatedAt: new Date(),
    };
  }
}
