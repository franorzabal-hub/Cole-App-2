import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ObjectType()
export class Tenant {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  subdomain: string;

  @Field()
  schemaName: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  secondaryColor?: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  contactPhone?: string;

  @Field({ nullable: true })
  website?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateTenantInput {
  @Field()
  name: string;

  @Field()
  subdomain: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  contactPhone?: string;

  @Field({ nullable: true })
  website?: string;
}

@ObjectType()
export class TenantStats {
  @Field()
  users: number;

  @Field()
  students: number;

  @Field()
  parents: number;

  @Field()
  teachers: number;

  @Field()
  news: number;

  @Field()
  events: number;
}

@Resolver()
export class TenantResolver {
  constructor(private tenantService: TenantService) {}

  @Query(() => [Tenant])
  async tenants() {
    return this.tenantService.findAll();
  }

  @Query(() => Tenant, { nullable: true })
  async tenant(@Args('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Query(() => Tenant, { nullable: true })
  async tenantBySubdomain(@Args('subdomain') subdomain: string) {
    return this.tenantService.findBySubdomain(subdomain);
  }

  @Query(() => Boolean)
  async checkSubdomainAvailability(@Args('subdomain') subdomain: string) {
    const tenant = await this.tenantService.findBySubdomain(subdomain);
    return !tenant;
  }

  @Mutation(() => Tenant)
  async createTenant(@Args('input') input: CreateTenantInput) {
    return this.tenantService.createTenant(input);
  }

  @Query(() => TenantStats)
  @UseGuards(JwtAuthGuard)
  async tenantStats(@Args('tenantId') tenantId: string) {
    return this.tenantService.getStats(tenantId);
  }
}
