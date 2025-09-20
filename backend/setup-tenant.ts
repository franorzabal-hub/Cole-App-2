import { PrismaClient } from '@prisma/client';

async function setupDefaultTenant() {
  const prisma = new PrismaClient();

  try {
    console.log('Creating default-tenant schema...');

    // Create the schema
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "default-tenant"`);

    // Get all tables from the public schema
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT LIKE '_prisma%'
      ORDER BY tablename
    `;

    console.log('Found tables to copy:', tables.map(t => t.tablename));

    // Copy table structure from public schema to default-tenant schema
    for (const { tablename } of tables) {
      console.log(`Creating table: default-tenant.${tablename}`);

      // Create table with structure from public schema
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "default-tenant"."${tablename}"
        (LIKE public."${tablename}" INCLUDING ALL)
      `);
    }

    console.log('Default tenant schema created successfully!');

    // Optional: Create a default school and campus for testing
    const tenantPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '?schema=default-tenant'
        }
      }
    });

    // Check if School exists
    const schoolCount = await tenantPrisma.school.count();
    if (schoolCount === 0) {
      console.log('Creating default school and campus...');

      const school = await tenantPrisma.school.create({
        data: {
          name: 'Colegio Demo',
        }
      });

      const campus = await tenantPrisma.campus.create({
        data: {
          schoolId: school.id,
          name: 'Campus Principal',
          address: 'Av. Principal 123',
          phone: '123456789',
          isMain: true,
        }
      });

      console.log('Created school:', school.name);
      console.log('Created campus:', campus.name);
    }

    await tenantPrisma.$disconnect();

  } catch (error) {
    console.error('Error setting up tenant:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDefaultTenant()
  .then(() => {
    console.log('Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });