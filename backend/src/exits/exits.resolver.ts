import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ExitsService } from './exits.service';
import { CreateExitPermissionDto } from './dto/create-exit-permission.dto';
import {
  UpdateExitPermissionDto,
  ApproveExitPermissionDto,
} from './dto/update-exit-permission.dto';
import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class ExitPermission {
  @Field(() => ID)
  id: string;

  @Field()
  studentId: string;

  @Field()
  requestedById: string;

  @Field()
  authorizedName: string;

  @Field(() => String, { nullable: true })
  authorizedDoc: string | null;

  @Field(() => String, { nullable: true })
  authorizedPhone: string | null;

  @Field(() => String, { nullable: true })
  relationship: string | null;

  @Field()
  exitDate: Date;

  @Field(() => Date, { nullable: true })
  exitTime: Date | null;

  @Field(() => Date, { nullable: true })
  returnTime: Date | null;

  @Field(() => String, { nullable: true })
  reason: string | null;

  @Field(() => String, { nullable: true })
  transportMethod: string | null;

  @Field()
  status: string;

  @Field(() => String, { nullable: true })
  approvedBy: string | null;

  @Field(() => Date, { nullable: true })
  approvedAt: Date | null;

  @Field(() => String, { nullable: true })
  rejectionReason: string | null;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  studentName: string | null;

  @Field(() => String, { nullable: true })
  requestedByName: string | null;

  @Field(() => String, { nullable: true })
  approvedByName: string | null;
}

@ObjectType()
export class ExitPermissionStatusSummary {
  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  approved: number;

  @Field(() => Int)
  rejected: number;

  @Field(() => Int)
  cancelled: number;

  @Field(() => Int)
  total: number;
}

@Resolver(() => ExitPermission)
export class ExitsResolver {
  constructor(private exitsService: ExitsService) {}

  @Query(() => [ExitPermission])
  async exitPermissions(
    @Args('tenantId') tenantId: string,
    @Args('studentId', { nullable: true }) studentId?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('campusId', { nullable: true }) campusId?: string,
    @Args('dateFrom', { nullable: true }) dateFrom?: Date,
    @Args('dateTo', { nullable: true }) dateTo?: Date,
    @Args('skip', { nullable: true, type: () => Int }) skip?: number,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
  ): Promise<ExitPermission[]> {
    return this.exitsService.findAll(tenantId, {
      studentId,
      status,
      campusId,
      dateFrom,
      dateTo,
      skip,
      take,
    });
  }

  @Query(() => ExitPermission, { nullable: true })
  async exitPermission(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<ExitPermission> {
    return this.exitsService.findOne(id, tenantId);
  }

  @Query(() => [ExitPermission])
  async studentExitPermissions(
    @Args('tenantId') tenantId: string,
    @Args('studentId') studentId: string,
    @Context() context?: any,
  ): Promise<ExitPermission[]> {
    const userId = context?.req?.user?.sub;
    return this.exitsService.findByStudent(tenantId, studentId, userId);
  }

  @Query(() => [ExitPermission])
  async myExitPermissions(
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<ExitPermission[]> {
    const userId = context.req.user?.sub;
    return this.exitsService.findByParent(tenantId, userId);
  }

  @Mutation(() => ExitPermission)
  async createExitPermission(
    @Args('tenantId') tenantId: string,
    @Args('input') input: CreateExitPermissionDto,
    @Context() context: any,
  ): Promise<ExitPermission> {
    const requestedById = context.req.user?.sub;
    return this.exitsService.create(tenantId, requestedById, input);
  }

  @Mutation(() => ExitPermission)
  async updateExitPermission(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateExitPermissionDto,
    @Context() context: any,
  ): Promise<ExitPermission> {
    const userId = context.req.user?.sub;
    return this.exitsService.update(id, tenantId, userId, input);
  }

  @Mutation(() => ExitPermission)
  async approveExitPermission(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: ApproveExitPermissionDto,
    @Context() context: any,
  ): Promise<ExitPermission> {
    const approvedBy = context.req.user?.sub;
    return this.exitsService.approve(id, tenantId, approvedBy, input);
  }

  @Mutation(() => ExitPermission)
  async cancelExitPermission(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<ExitPermission> {
    const userId = context.req.user?.sub;
    return this.exitsService.cancel(id, tenantId, userId);
  }

  @Mutation(() => Boolean)
  async deleteExitPermission(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user?.sub;
    return this.exitsService.remove(id, tenantId, userId);
  }

  @Query(() => Int)
  async pendingExitPermissionCount(
    @Args('tenantId') tenantId: string,
    @Args('campusId', { nullable: true }) campusId?: string,
  ): Promise<number> {
    return this.exitsService.getPendingCount(tenantId, campusId);
  }

  @Query(() => ExitPermissionStatusSummary)
  async exitPermissionStatusSummary(
    @Args('tenantId') tenantId: string,
    @Args('campusId', { nullable: true }) campusId?: string,
    @Args('dateFrom', { nullable: true }) dateFrom?: Date,
    @Args('dateTo', { nullable: true }) dateTo?: Date,
  ): Promise<ExitPermissionStatusSummary> {
    return this.exitsService.getStatusSummary(
      tenantId,
      campusId,
      dateFrom,
      dateTo,
    );
  }
}
