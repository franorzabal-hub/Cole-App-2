import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for managing secrets using Google Secret Manager
 * In production, this will fetch secrets from Google Secret Manager
 * In development, it falls back to environment variables
 */
@Injectable()
export class SecretsService {
  private readonly logger = new Logger(SecretsService.name);
  private secretsCache = new Map<string, string>();

  constructor(private configService: ConfigService) {}

  /**
   * Get a secret value by key
   * In production: fetches from Google Secret Manager
   * In development: uses environment variables
   */
  async getSecret(key: string): Promise<string> {
    // Check cache first
    if (this.secretsCache.has(key)) {
      return this.secretsCache.get(key)!;
    }

    const environment = this.configService.get<string>('NODE_ENV', 'development');

    if (environment === 'production') {
      try {
        // TODO: Implement Google Secret Manager integration
        // const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
        // const client = new SecretManagerServiceClient();
        // const projectId = this.configService.get<string>('GCP_PROJECT_ID');
        // const name = `projects/${projectId}/secrets/${key}/versions/latest`;
        // const [version] = await client.accessSecretVersion({ name });
        // const secret = version.payload.data.toString();
        // this.secretsCache.set(key, secret);
        // return secret;

        this.logger.warn(`Google Secret Manager not configured, falling back to env for ${key}`);
        return this.getFromEnvironment(key);
      } catch (error) {
        this.logger.error(`Failed to fetch secret ${key} from Secret Manager`, error);
        throw error;
      }
    }

    // Development: use environment variables
    return this.getFromEnvironment(key);
  }

  /**
   * Get multiple secrets at once
   */
  async getSecrets(keys: string[]): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {};

    await Promise.all(
      keys.map(async (key) => {
        secrets[key] = await this.getSecret(key);
      })
    );

    return secrets;
  }

  /**
   * Get secret from environment variables
   */
  private getFromEnvironment(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`Secret ${key} not found in environment variables`);
    }

    // Cache the value
    this.secretsCache.set(key, value);
    return value;
  }

  /**
   * Clear the secrets cache (useful for rotation)
   */
  clearCache(): void {
    this.secretsCache.clear();
    this.logger.log('Secrets cache cleared');
  }

  /**
   * Validate that all required secrets are present
   */
  async validateSecrets(requiredKeys: string[]): Promise<boolean> {
    try {
      for (const key of requiredKeys) {
        const value = await this.getSecret(key);
        if (!value || value === 'CHANGE_THIS_SECRET_IN_PRODUCTION') {
          this.logger.error(`Invalid or missing secret: ${key}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      this.logger.error('Secret validation failed', error);
      return false;
    }
  }
}

/**
 * Module configuration for secrets
 */
export const REQUIRED_SECRETS = [
  'JWT_SECRET',
  'DATABASE_URL',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'REDIS_HOST',
  'REDIS_PORT'
];

export const OPTIONAL_SECRETS = [
  'FIREBASE_PRIVATE_KEY',
  'SMTP_PASSWORD',
  'PAYMENT_API_KEY'
];