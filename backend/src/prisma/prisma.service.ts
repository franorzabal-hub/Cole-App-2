import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private tenantConnections: Map<string, PrismaClient> = new Map();

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma connected successfully');
    } catch (error) {
      console.warn('Prisma connection warning:', error.message);
      // In development, we'll continue without failing
      if (this.configService.get('NODE_ENV') === 'development') {
        console.log('Running in development mode - continuing without Prisma validation');
      } else {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    // Close all tenant connections
    for (const [, connection] of this.tenantConnections) {
      await connection.$disconnect();
    }
    await this.$disconnect();
  }

  /**
   * Get a Prisma client for a specific tenant schema
   */
  getTenantClient(schemaName: string): PrismaClient {
    if (!this.tenantConnections.has(schemaName)) {
      const databaseUrl = this.configService.get<string>('DATABASE_URL');
      if (!databaseUrl) {
        throw new Error('DATABASE_URL is not configured');
      }
      const urlWithSchema = this.appendSchemaToUrl(databaseUrl, schemaName);

      const client = new PrismaClient({
        datasources: {
          db: {
            url: urlWithSchema,
          },
        },
      });

      this.tenantConnections.set(schemaName, client);
    }

    const client = this.tenantConnections.get(schemaName);
    if (!client) {
      throw new Error(`Tenant client not found for schema: ${schemaName}`);
    }
    return client;
  }

  /**
   * Create a new schema for a tenant
   */
  async createTenantSchema(schemaName: string): Promise<void> {
    // Create schema
    await this.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // Run migrations for the tenant schema
    await this.runTenantMigrations(schemaName);
  }

  /**
   * Delete a tenant schema
   */
  async deleteTenantSchema(schemaName: string): Promise<void> {
    // Close connection if exists
    if (this.tenantConnections.has(schemaName)) {
      const client = this.tenantConnections.get(schemaName);
      if (client) {
        await client.$disconnect();
      }
      this.tenantConnections.delete(schemaName);
    }

    // Drop schema
    await this.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
    );
  }

  /**
   * Run migrations for a tenant schema
   */
  private async runTenantMigrations(schemaName: string): Promise<void> {
    // Copy all tenant tables structure to the new schema
    const tenantTables = [
      'School',
      'Campus',
      'Location',
      'Person',
      'Student',
      'Parent',
      'Teacher',
      'Class',
      'FamilyRelationship',
      'StudentClass',
      'TeacherClass',
      'News',
      'Event',
      'Message',
      'ExitPermission',
      'Report',
      'NewsTarget',
      'NewsRead',
      'EventRegistration',
      'MessageRecipient',
    ];

    for (const table of tenantTables) {
      // This is a simplified version. In production, you'd use proper migrations
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${schemaName}"."${table}"
        (LIKE public."${table}" INCLUDING ALL)
      `);
    }
  }

  /**
   * Append schema parameter to database URL
   */
  private appendSchemaToUrl(url: string, schema: string): string {
    const urlObj = new URL(url);
    urlObj.searchParams.set('schema', schema);
    return urlObj.toString();
  }

  /**
   * Execute a transaction across multiple schemas
   */
  async executeMultiSchemaTransaction<T>(
    operations: Array<{
      schema: string;
      operation: (prisma: PrismaClient) => Promise<any>;
    }>,
  ): Promise<T[]> {
    const results: T[] = [];

    try {
      // Start transaction on main connection
      await this.$transaction(async (tx) => {
        for (const { schema, operation } of operations) {
          const client = this.getTenantClient(schema);
          const result = await operation(client);
          results.push(result);
        }
      });

      return results;
    } catch (error) {
      throw error;
    }
  }
}
