import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { SecretsService, REQUIRED_SECRETS } from './secrets.service';
import appConfig from './app.config';
import { join } from 'path';

/**
 * Global configuration module
 * Provides configuration and secrets management to all modules
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        join(process.cwd(), '.env.local'),
        join(process.cwd(), `.env.${process.env.NODE_ENV}`),
        join(process.cwd(), '.env'),
      ],
      load: [appConfig],
      validate: (config: Record<string, any>) => {
        // Validate required environment variables
        const requiredEnvVars = [
          'DATABASE_URL',
          'JWT_SECRET',
          'REDIS_HOST',
          'REDIS_PORT',
        ];

        const missingVars = requiredEnvVars.filter((varName) => !config[varName]);

        if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
          throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`,
          );
        }

        // Validate JWT_SECRET is secure
        if (
          config.JWT_SECRET &&
          (config.JWT_SECRET.length < 32 ||
            config.JWT_SECRET === 'CHANGE_THIS_SECRET_IN_PRODUCTION')
        ) {
          console.warn(
            '⚠️  WARNING: JWT_SECRET is not secure. Please use a strong secret in production.',
          );
        }

        return config;
      },
    }),
  ],
  providers: [SecretsService, ConfigService],
  exports: [SecretsService, ConfigService],
})
export class ConfigModule {
  constructor(
    private readonly secretsService: SecretsService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    // In production, validate that all required secrets are available
    if (environment === 'production') {
      console.log('🔐 Validating production secrets...');

      const isValid = await this.secretsService.validateSecrets(REQUIRED_SECRETS);

      if (!isValid) {
        throw new Error(
          'Failed to validate required secrets. Please check your Secret Manager configuration.',
        );
      }

      console.log('✅ All required secrets validated successfully');
    } else {
      console.log(`🚀 Running in ${environment} mode - using local environment variables`);
    }

    // Log configuration status (without exposing sensitive values)
    this.logConfigurationStatus();
  }

  private logConfigurationStatus() {
    const config = this.configService.get('app');

    console.log('📋 Configuration Status:');
    console.log(`  - Environment: ${config.env}`);
    console.log(`  - Port: ${config.port}`);
    console.log(`  - Database: ${config.database.url ? '✓ Configured' : '✗ Missing'}`);
    console.log(`  - Redis: ${config.redis.host}:${config.redis.port}`);
    console.log(`  - JWT: ${config.jwt.secret ? '✓ Configured' : '✗ Missing'}`);
    console.log(`  - Firebase: ${config.firebase.projectId ? '✓ Configured' : '✗ Missing'}`);
    console.log(`  - CORS Origins: ${config.cors.origins.join(', ')}`);
    console.log(`  - Rate Limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 1000}s`);

    if (config.features.enableSwagger) {
      console.log('  - Swagger: ✓ Enabled at /api/docs');
    }

    if (config.features.enableGraphQLPlayground) {
      console.log('  - GraphQL Playground: ✓ Enabled at /graphql');
    }
  }
}