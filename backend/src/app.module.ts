import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';

// Core Modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';

// Feature Modules
import { NewsModule } from './news/news.module';
import { EventsModule } from './events/events.module';
import { MessagesModule } from './messages/messages.module';
import { ExitsModule } from './exits/exits.module';
import { ReportsModule } from './reports/reports.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req, res }) => ({ req, res }),
      formatError: (error) => {
        const graphQLFormattedError = {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          path: error.path,
        };
        return graphQLFormattedError;
      },
    }),

    // Redis Queue
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Core Modules
    PrismaModule,
    AuthModule,
    TenantModule,

    // Feature Modules
    NewsModule,
    EventsModule,
    MessagesModule,
    ExitsModule,
    ReportsModule,
    StudentsModule,
  ],
})
export class AppModule {}
