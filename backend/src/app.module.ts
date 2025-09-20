import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

// Configuration Module (includes secrets management)
import { ConfigModule } from './config/config.module';

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
    // Configuration (with secrets management)
    ConfigModule,

    // GraphQL
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get('app.features.enableGraphQLPlayground'),
        context: ({ req, res }) => ({ req, res }),
        formatError: (error) => {
          const graphQLFormattedError = {
            message: error.message,
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            path: error.path,
          };
          return graphQLFormattedError;
        },
        cors: {
          origin: configService.get('app.cors.origins'),
          credentials: configService.get('app.cors.credentials'),
        },
      }),
    }),

    // Redis Queue
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('app.redis.host'),
          port: configService.get('app.redis.port'),
          password: configService.get('app.redis.password'),
        },
      }),
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
