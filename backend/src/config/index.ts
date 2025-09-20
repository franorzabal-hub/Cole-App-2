/**
 * Configuration module exports
 */
export * from './config.module';
export * from './secrets.service';
export { default as appConfig } from './app.config';

/**
 * Configuration types
 */
export interface AppConfig {
  env: string;
  port: number;
  name: string;
  version: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  redis: RedisConfig;
  firebase: FirebaseConfig;
  gcp: GcpConfig;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  session: SessionConfig;
  smtp: SmtpConfig;
  monitoring: MonitoringConfig;
  features: FeaturesConfig;
  security: SecurityConfig;
}

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  poolSize: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  algorithm: string;
  issuer: string;
  audience: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  ttl: number;
}

export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey?: string;
}

export interface GcpConfig {
  projectId: string;
  region: string;
}

export interface CorsConfig {
  origins: string[];
  credentials: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface SessionConfig {
  secret: string;
  maxAge: number;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface MonitoringConfig {
  sentryDsn?: string;
  logLevel: string;
}

export interface FeaturesConfig {
  enableSwagger: boolean;
  enableGraphQLPlayground: boolean;
  enableMockData: boolean;
}

export interface SecurityConfig {
  bcryptRounds: number;
  enableHttps: boolean;
  trustedProxies: string[];
}