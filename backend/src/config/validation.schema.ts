import * as Joi from 'joi';

/**
 * Environment variable validation schema
 * Ensures all required configuration is present and valid
 */
export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),

  PORT: Joi.number()
    .port()
    .default(3000),

  APP_NAME: Joi.string()
    .default('ColeApp Backend'),

  API_VERSION: Joi.string()
    .default('v1'),

  // Database
  DATABASE_URL: Joi.string()
    .uri()
    .required()
    .description('PostgreSQL connection string'),

  DATABASE_SSL: Joi.boolean()
    .default(false)
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.boolean().default(true),
    }),

  // Redis (optional, for caching/sessions)
  REDIS_HOST: Joi.string()
    .hostname()
    .optional(),

  REDIS_PORT: Joi.number()
    .port()
    .default(6379)
    .when('REDIS_HOST', {
      is: Joi.exist(),
      then: Joi.required(),
    }),

  REDIS_PASSWORD: Joi.string()
    .optional()
    .allow(''),

  // JWT Authentication
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for JWT signing'),

  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('15m')
    .description('JWT expiration time (e.g., 15m, 1h, 7d)'),

  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for refresh token signing'),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('7d')
    .description('Refresh token expiration time'),

  // CORS
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:3001')
    .description('Allowed CORS origins (comma-separated for multiple)'),

  CORS_CREDENTIALS: Joi.boolean()
    .default(true),

  // Rate Limiting
  RATE_LIMIT_TTL: Joi.number()
    .integer()
    .positive()
    .default(60)
    .description('Rate limit window in seconds'),

  RATE_LIMIT_MAX: Joi.number()
    .integer()
    .positive()
    .default(100)
    .description('Maximum requests per window'),

  // Email Service
  SMTP_HOST: Joi.string()
    .hostname()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  SMTP_PORT: Joi.number()
    .port()
    .default(587),

  SMTP_SECURE: Joi.boolean()
    .default(false),

  SMTP_USER: Joi.string()
    .email()
    .when('SMTP_HOST', {
      is: Joi.exist(),
      then: Joi.required(),
    }),

  SMTP_PASSWORD: Joi.string()
    .when('SMTP_HOST', {
      is: Joi.exist(),
      then: Joi.required(),
    }),

  EMAIL_FROM_NAME: Joi.string()
    .default('ColeApp'),

  EMAIL_FROM_ADDRESS: Joi.string()
    .email()
    .default('noreply@coleapp.com'),

  // File Upload
  UPLOAD_MAX_FILE_SIZE: Joi.number()
    .integer()
    .positive()
    .default(10 * 1024 * 1024) // 10MB
    .description('Maximum file size in bytes'),

  UPLOAD_ALLOWED_MIME_TYPES: Joi.string()
    .default('image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'),

  // Storage
  STORAGE_PROVIDER: Joi.string()
    .valid('local', 's3', 'gcs')
    .default('local'),

  STORAGE_LOCAL_PATH: Joi.string()
    .when('STORAGE_PROVIDER', {
      is: 'local',
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .default('./uploads'),

  // AWS S3 (when using S3 storage)
  AWS_ACCESS_KEY_ID: Joi.string()
    .when('STORAGE_PROVIDER', {
      is: 's3',
      then: Joi.required(),
    }),

  AWS_SECRET_ACCESS_KEY: Joi.string()
    .when('STORAGE_PROVIDER', {
      is: 's3',
      then: Joi.required(),
    }),

  AWS_REGION: Joi.string()
    .default('us-east-1'),

  S3_BUCKET_NAME: Joi.string()
    .when('STORAGE_PROVIDER', {
      is: 's3',
      then: Joi.required(),
    }),

  // Google Cloud Storage (when using GCS)
  GCS_PROJECT_ID: Joi.string()
    .when('STORAGE_PROVIDER', {
      is: 'gcs',
      then: Joi.required(),
    }),

  GCS_BUCKET_NAME: Joi.string()
    .when('STORAGE_PROVIDER', {
      is: 'gcs',
      then: Joi.required(),
    }),

  GCS_KEY_FILE: Joi.string()
    .when('STORAGE_PROVIDER', {
      is: 'gcs',
      then: Joi.required(),
    }),

  // Firebase (optional, for notifications)
  FIREBASE_PROJECT_ID: Joi.string()
    .optional(),

  FIREBASE_PRIVATE_KEY: Joi.string()
    .optional(),

  FIREBASE_CLIENT_EMAIL: Joi.string()
    .email()
    .optional(),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),

  LOG_FORMAT: Joi.string()
    .valid('json', 'simple', 'combined')
    .default('combined'),

  // Monitoring
  SENTRY_DSN: Joi.string()
    .uri()
    .optional()
    .description('Sentry error tracking DSN'),

  SENTRY_ENVIRONMENT: Joi.string()
    .default(Joi.ref('NODE_ENV')),

  // GraphQL
  GRAPHQL_PLAYGROUND: Joi.boolean()
    .default(true)
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.boolean().default(false),
    }),

  GRAPHQL_DEBUG: Joi.boolean()
    .default(true)
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.boolean().default(false),
    }),

  GRAPHQL_INTROSPECTION: Joi.boolean()
    .default(true)
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.boolean().default(false),
    }),

  // WebSocket
  WS_ENABLE: Joi.boolean()
    .default(true),

  WS_PATH: Joi.string()
    .default('/ws'),

  // Session
  SESSION_SECRET: Joi.string()
    .min(32)
    .default('change-this-secret-in-production'),

  SESSION_MAX_AGE: Joi.number()
    .integer()
    .positive()
    .default(24 * 60 * 60 * 1000) // 24 hours
    .description('Session max age in milliseconds'),

  // Security
  BCRYPT_ROUNDS: Joi.number()
    .integer()
    .min(10)
    .max(20)
    .default(12),

  ALLOWED_HOSTS: Joi.string()
    .default('localhost,*.coleapp.com')
    .description('Comma-separated list of allowed hosts'),

  // Features flags
  FEATURE_MESSAGING: Joi.boolean()
    .default(true),

  FEATURE_ASSIGNMENTS: Joi.boolean()
    .default(true),

  FEATURE_GRADES: Joi.boolean()
    .default(true),

  FEATURE_ATTENDANCE: Joi.boolean()
    .default(true),

  FEATURE_CALENDAR: Joi.boolean()
    .default(true),

  FEATURE_PAYMENTS: Joi.boolean()
    .default(false),

  FEATURE_REPORTS: Joi.boolean()
    .default(true),

  FEATURE_VIDEO_CONFERENCING: Joi.boolean()
    .default(false),

  // Multi-tenancy
  MULTI_TENANT_ENABLED: Joi.boolean()
    .default(true),

  DEFAULT_TENANT_ID: Joi.string()
    .default('default'),

  // Pagination
  PAGINATION_DEFAULT_LIMIT: Joi.number()
    .integer()
    .positive()
    .max(100)
    .default(20),

  PAGINATION_MAX_LIMIT: Joi.number()
    .integer()
    .positive()
    .default(100),

  // Cache
  CACHE_TTL: Joi.number()
    .integer()
    .positive()
    .default(300) // 5 minutes
    .description('Default cache TTL in seconds'),

  // API Keys (for external services)
  GOOGLE_MAPS_API_KEY: Joi.string()
    .optional(),

  OPENAI_API_KEY: Joi.string()
    .optional(),

  TWILIO_ACCOUNT_SID: Joi.string()
    .optional(),

  TWILIO_AUTH_TOKEN: Joi.string()
    .optional(),

  TWILIO_PHONE_NUMBER: Joi.string()
    .optional(),

  // Maintenance mode
  MAINTENANCE_MODE: Joi.boolean()
    .default(false),

  MAINTENANCE_MESSAGE: Joi.string()
    .default('System is under maintenance. Please try again later.'),
}).unknown(true); // Allow additional unknown environment variables

/**
 * Validate environment variables and return typed config
 */
export function validateConfig(config: Record<string, any>) {
  const { error, value } = validationSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false,
  });

  if (error) {
    const errors = error.details.map(detail => `${detail.path.join('.')}: ${detail.message}`);
    throw new Error(`Config validation error:\n${errors.join('\n')}`);
  }

  return value;
}