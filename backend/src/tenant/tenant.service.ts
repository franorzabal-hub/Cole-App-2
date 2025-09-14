import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new tenant
   */
  async createTenant(data: {
    name: string;
    subdomain: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
  }) {
    // Validate subdomain is unique
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain: data.subdomain },
    });

    if (existingTenant) {
      throw new BadRequestException('Subdomain already exists');
    }

    // Generate schema name
    const schemaName = `tenant_${data.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Create tenant record
    const tenant = await this.prisma.tenant.create({
      data: {
        ...data,
        schemaName,
      },
    });

    // Create tenant schema
    await this.prisma.createTenantSchema(schemaName);

    // Create default school and campus for the tenant
    const tenantPrisma = this.prisma.getTenantClient(schemaName);

    await tenantPrisma.school.create({
      data: {
        name: data.name,
        campuses: {
          create: {
            name: 'Sede Principal',
            isMain: true,
          },
        },
      },
    });

    return tenant;
  }

  /**
   * Get all tenants
   */
  async findAll() {
    return this.prisma.tenant.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get tenant by ID
   */
  async findOne(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        customFields: true,
      },
    });
  }

  /**
   * Get tenant by subdomain
   */
  async findBySubdomain(subdomain: string) {
    return this.prisma.tenant.findUnique({
      where: { subdomain },
    });
  }

  /**
   * Update tenant
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      logoUrl: string;
      primaryColor: string;
      secondaryColor: string;
      contactEmail: string;
      contactPhone: string;
      website: string;
    }>,
  ) {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  /**
   * Deactivate tenant
   */
  async deactivate(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get tenant statistics
   */
  async getStats(tenantId: string) {
    const tenant = await this.findOne(tenantId);
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    const tenantPrisma = this.prisma.getTenantClient(tenant.schemaName);

    const [
      userCount,
      studentCount,
      parentCount,
      teacherCount,
      newsCount,
      eventCount,
    ] = await Promise.all([
      this.prisma.userRole.count({
        where: { tenantId },
      }),
      tenantPrisma.student.count(),
      tenantPrisma.parent.count(),
      tenantPrisma.teacher.count(),
      tenantPrisma.news.count(),
      tenantPrisma.event.count(),
    ]);

    return {
      users: userCount,
      students: studentCount,
      parents: parentCount,
      teachers: teacherCount,
      news: newsCount,
      events: eventCount,
    };
  }

  /**
   * Create custom field for tenant
   */
  async createCustomField(data: {
    tenantId: string;
    entityType: string;
    fieldName: string;
    fieldType: string;
    fieldLabel: string;
    isRequired?: boolean;
    validations?: any;
    options?: any;
  }) {
    return this.prisma.customField.create({
      data,
    });
  }

  /**
   * Get custom fields for entity type
   */
  async getCustomFields(tenantId: string, entityType: string) {
    return this.prisma.customField.findMany({
      where: {
        tenantId,
        entityType,
        isActive: true,
      },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Update custom field
   */
  async updateCustomField(
    id: string,
    data: Partial<{
      fieldLabel: string;
      isRequired: boolean;
      validations: any;
      options: any;
      position: number;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.customField.update({
      where: { id },
      data,
    });
  }
}
