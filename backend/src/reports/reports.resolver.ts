import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Report {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  studentId: string | null;

  @Field(() => String, { nullable: true })
  classId: string | null;

  @Field()
  type: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  period: string | null;

  @Field(() => String, { nullable: true })
  content: string | null; // JSON content as string

  @Field(() => String, { nullable: true })
  fileUrl: string | null;

  @Field()
  generatedBy: string;

  @Field()
  isFinal: boolean;

  @Field()
  createdAt: Date;

  @Field(() => String, { nullable: true })
  studentName: string | null;

  @Field(() => String, { nullable: true })
  generatedByName: string | null;
}

@ObjectType()
export class ReportType {
  @Field()
  value: string;

  @Field()
  label: string;
}

@ObjectType()
export class ReportStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  finalReports: number;

  @Field(() => Int)
  draftReports: number;

  @Field()
  byType: string; // JSON string of type counts
}

@ObjectType()
export class StudentSummaryReport {
  @Field()
  student: string; // JSON string with student info

  @Field(() => String, { nullable: true })
  period: string | null;

  @Field(() => Int)
  totalReports: number;

  @Field(() => Int)
  finalReports: number;

  @Field()
  reportsByType: string; // JSON string

  @Field(() => String, { nullable: true })
  latestReport: string | null; // JSON string

  @Field()
  generatedAt: Date;
}

@Resolver(() => Report)
export class ReportsResolver {
  constructor(private reportsService: ReportsService) {}

  @Query(() => [Report])
  async reports(
    @Args('tenantId') tenantId: string,
    @Args('studentId', { nullable: true }) studentId?: string,
    @Args('classId', { nullable: true }) classId?: string,
    @Args('type', { nullable: true }) type?: string,
    @Args('period', { nullable: true }) period?: string,
    @Args('isFinal', { nullable: true, type: () => Boolean }) isFinal?: boolean,
    @Args('skip', { nullable: true, type: () => Int }) skip?: number,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
  ): Promise<Report[]> {
    return this.reportsService.findAll(tenantId, {
      studentId,
      classId,
      type,
      period,
      isFinal,
      skip,
      take,
    });
  }

  @Query(() => Report, { nullable: true })
  async report(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<Report> {
    return this.reportsService.findOne(id, tenantId);
  }

  @Query(() => [Report])
  async studentReports(
    @Args('tenantId') tenantId: string,
    @Args('studentId') studentId: string,
    @Context() context?: any,
  ): Promise<Report[]> {
    const userId = context?.req?.user?.sub;
    return this.reportsService.findByStudent(tenantId, studentId, userId);
  }

  @Query(() => [Report])
  async classReports(
    @Args('tenantId') tenantId: string,
    @Args('classId') classId: string,
    @Context() context?: any,
  ): Promise<Report[]> {
    const userId = context?.req?.user?.sub;
    return this.reportsService.findByClass(tenantId, classId, userId);
  }

  @Mutation(() => Report)
  async createReport(
    @Args('tenantId') tenantId: string,
    @Args('input') input: CreateReportDto,
    @Context() context: any,
  ): Promise<Report> {
    const generatedBy = context.req.user?.sub;
    return this.reportsService.create(tenantId, generatedBy, input);
  }

  @Mutation(() => Report)
  async updateReport(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateReportDto,
    @Context() context: any,
  ): Promise<Report> {
    const userId = context.req.user?.sub;
    return this.reportsService.update(id, tenantId, userId, input);
  }

  @Mutation(() => Report)
  async markReportAsFinal(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<Report> {
    const userId = context.req.user?.sub;
    return this.reportsService.markAsFinal(id, tenantId, userId);
  }

  @Mutation(() => Boolean)
  async deleteReport(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user?.sub;
    return this.reportsService.remove(id, tenantId, userId);
  }

  @Query(() => [ReportType])
  async reportTypes(@Args('tenantId') tenantId: string): Promise<ReportType[]> {
    return this.reportsService.getReportTypes(tenantId);
  }

  @Query(() => ReportStatistics)
  async reportStatistics(
    @Args('tenantId') tenantId: string,
    @Args('campusId', { nullable: true }) campusId?: string,
    @Args('classId', { nullable: true }) classId?: string,
    @Args('period', { nullable: true }) period?: string,
    @Args('type', { nullable: true }) type?: string,
  ): Promise<ReportStatistics> {
    const stats = await this.reportsService.getReportStatistics(tenantId, {
      campusId,
      classId,
      period,
      type,
    });

    return {
      total: stats.total,
      finalReports: stats.finalReports,
      draftReports: stats.draftReports,
      byType: JSON.stringify(stats.byType),
    };
  }

  @Query(() => StudentSummaryReport)
  async studentSummaryReport(
    @Args('tenantId') tenantId: string,
    @Args('studentId') studentId: string,
    @Args('period', { nullable: true }) period?: string,
  ): Promise<StudentSummaryReport> {
    const summary = await this.reportsService.generateStudentSummaryReport(
      tenantId,
      studentId,
      period,
    );

    return {
      student: JSON.stringify(summary.student),
      period: summary.period || null,
      totalReports: summary.totalReports,
      finalReports: summary.finalReports,
      reportsByType: JSON.stringify(summary.reportsByType),
      latestReport: summary.latestReport
        ? JSON.stringify(summary.latestReport)
        : null,
      generatedAt: summary.generatedAt,
    };
  }
}
