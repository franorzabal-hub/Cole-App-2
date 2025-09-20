# Security Standards Contract

**Version**: 1.0.0
**Date**: 2025-09-20
**Scope**: All ColeApp modules and infrastructure

## Secrets Management

### Prohibited Practices
```yaml
NEVER_COMMIT:
  - API keys
  - Passwords
  - Private keys
  - JWT secrets
  - Database credentials
  - Firebase service account keys
  - SMTP credentials
  - OAuth client secrets
  - Encryption keys
  - Personal access tokens
```

### Required Practices

#### Development Environment
```bash
# Use .env.local for local development
# This file must be in .gitignore
.env.local

# Example .env.local structure
NODE_ENV=development
DATABASE_URL=postgresql://dev:dev@localhost:5432/coleapp_dev
JWT_SECRET=dev-only-secret-change-in-prod
```

#### Production Environment
```typescript
// Use Google Secret Manager for all secrets
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

class SecretsService {
  async getSecret(secretName: string): Promise<string> {
    const name = `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });
    return version.payload.data.toString();
  }
}

// Never hardcode secrets
const jwtSecret = await secretsService.getSecret('jwt-secret');
```

### Secret Rotation Policy
```yaml
rotation_schedule:
  jwt_secret: 90 days
  database_password: 60 days
  api_keys: 180 days
  firebase_keys: 365 days

rotation_process:
  1. Create new secret version
  2. Update Secret Manager
  3. Deploy with new secret
  4. Verify functionality
  5. Revoke old secret
```

## Authentication Standards

### JWT Implementation
```typescript
// JWT Configuration
interface JWTConfig {
  secret: string; // From Secret Manager
  expiresIn: '15m'; // Access token
  refreshExpiresIn: '7d'; // Refresh token
  algorithm: 'HS256' | 'RS256';
  issuer: 'coleapp.com';
  audience: 'coleapp-users';
}

// Token Payload Structure
interface TokenPayload {
  sub: string; // User ID
  tenantId: string; // Tenant ID (critical for isolation)
  roles: string[]; // User roles
  iat: number; // Issued at
  exp: number; // Expiration
  jti: string; // Unique token ID for revocation
}
```

### Password Requirements
```typescript
// Password validation rules
const passwordRules = {
  minLength: 12,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  requireStrongPassword: true,
  preventCommonPasswords: true,
  preventUserInfoInPassword: true
};

// Password hashing
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
```

### Multi-Factor Authentication
```typescript
// TOTP Implementation
interface MFAConfig {
  enabled: boolean;
  type: 'totp' | 'sms' | 'email';
  backupCodes: number; // Number of backup codes to generate
  window: number; // Time window for TOTP (30 seconds)
}

// Backup codes must be:
// - Randomly generated
// - One-time use
// - Stored hashed
// - 8-10 backup codes per user
```

## Authorization Standards

### Role-Based Access Control (RBAC)
```typescript
// Role Hierarchy
enum Role {
  SUPER_ADMIN = 'super_admin', // Platform level
  SCHOOL_ADMIN = 'school_admin', // Tenant level
  TEACHER = 'teacher',
  PARENT = 'parent',
  STUDENT = 'student'
}

// Permission Model
interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  scope: 'own' | 'tenant' | 'all';
}

// Authorization Guard
@Injectable()
export class AuthorizationGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resource = this.getResource(context);

    // Critical: Always check tenant isolation
    if (resource.tenantId !== user.tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    return this.checkPermissions(user, resource);
  }
}
```

### Tenant Isolation
```typescript
// Every database query must include tenant filter
class TenantAwareRepository<T> {
  async findAll(tenantId: string): Promise<T[]> {
    return this.prisma.model.findMany({
      where: {
        tenantId // ALWAYS filter by tenant
      }
    });
  }

  async findOne(id: string, tenantId: string): Promise<T> {
    const result = await this.prisma.model.findUnique({
      where: { id }
    });

    // Double-check tenant isolation
    if (result?.tenantId !== tenantId) {
      throw new ForbiddenException('Resource not found');
    }

    return result;
  }
}
```

## Data Encryption

### Encryption at Rest
```yaml
database:
  encryption: AES-256
  key_management: Google KMS
  backup_encryption: enabled

file_storage:
  encryption: AES-256-GCM
  key_rotation: 90 days

redis_cache:
  encryption: TLS 1.3
  persistence_encryption: enabled
```

### Encryption in Transit
```typescript
// TLS Configuration
const tlsConfig = {
  minVersion: 'TLSv1.3',
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_AES_128_GCM_SHA256',
    'TLS_CHACHA20_POLY1305_SHA256'
  ],
  preferServerCipherSuites: true,
  sessionTimeout: 300
};

// HTTPS Enforcement
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

### Sensitive Data Handling
```typescript
// PII Encryption
class PIIEncryption {
  // Fields that must be encrypted
  private sensitiveFields = [
    'ssn',
    'creditCard',
    'bankAccount',
    'medicalRecords',
    'studentGrades'
  ];

  encrypt(data: any): any {
    for (const field of this.sensitiveFields) {
      if (data[field]) {
        data[field] = this.encryptField(data[field]);
      }
    }
    return data;
  }

  private encryptField(value: string): string {
    // Use AES-256-GCM with unique IV per field
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    // Implementation details...
  }
}
```

## Input Validation

### Request Validation
```typescript
// Use class-validator for all DTOs
import { IsString, IsEmail, IsUUID, MaxLength, Matches } from 'class-validator';

class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-Z\s'-]+$/) // Only letters, spaces, hyphens, apostrophes
  name: string;

  @IsUUID()
  tenantId: string;
}

// Sanitize HTML input
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
}
```

### SQL Injection Prevention
```typescript
// NEVER build SQL strings manually
// BAD ❌
const query = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD ✅ - Parameterized queries
const query = 'SELECT * FROM users WHERE email = $1 AND tenant_id = $2';
const result = await db.query(query, [email, tenantId]);

// BETTER ✅ - Use ORM with built-in protection
const user = await prisma.user.findFirst({
  where: {
    email,
    tenantId
  }
});
```

### XSS Prevention
```typescript
// React automatically escapes values
// But be careful with dangerouslySetInnerHTML

// BAD ❌
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// GOOD ✅
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// BETTER ✅
<div>{userContent}</div> // React escapes by default
```

## Security Headers

### Required Headers
```typescript
// Helmet.js configuration for Express/NestJS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Avoid unsafe-inline in production
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

## Audit Logging

### Required Audit Events
```typescript
enum AuditEvent {
  // Authentication
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  PASSWORD_RESET = 'auth.password.reset',
  MFA_ENABLED = 'auth.mfa.enabled',

  // Authorization
  ACCESS_DENIED = 'authz.access.denied',
  PRIVILEGE_ESCALATION = 'authz.privilege.escalation',

  // Data Access
  SENSITIVE_DATA_ACCESS = 'data.sensitive.access',
  BULK_DATA_EXPORT = 'data.bulk.export',

  // Admin Actions
  USER_CREATED = 'admin.user.created',
  USER_DELETED = 'admin.user.deleted',
  SETTINGS_CHANGED = 'admin.settings.changed',

  // Security Events
  SUSPICIOUS_ACTIVITY = 'security.suspicious',
  RATE_LIMIT_EXCEEDED = 'security.rate_limit'
}

// Audit log structure
interface AuditLog {
  timestamp: Date;
  event: AuditEvent;
  userId: string;
  tenantId: string;
  ipAddress: string;
  userAgent: string;
  resource?: string;
  action?: string;
  result: 'success' | 'failure';
  metadata?: Record<string, any>;
}
```

### Log Retention
```yaml
retention_policy:
  audit_logs: 2 years
  access_logs: 90 days
  error_logs: 30 days
  debug_logs: 7 days

storage:
  location: Google Cloud Logging
  encryption: enabled
  backup: daily
```

## Vulnerability Management

### Dependency Scanning
```json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "check-updates": "npm-check-updates",
    "snyk": "snyk test"
  }
}
```

### Security Testing
```bash
# Required security tests
npm run test:security

# Tests should include:
- Authentication bypass attempts
- Authorization boundary tests
- Injection attack simulations
- XSS payload tests
- CSRF token validation
- Rate limiting verification
```

### Incident Response
```yaml
incident_response:
  detection:
    - Automated monitoring alerts
    - User reports
    - Security scan findings

  classification:
    P0: Data breach, authentication bypass
    P1: Privilege escalation, XSS in production
    P2: Security misconfiguration
    P3: Outdated dependencies

  response_time:
    P0: 1 hour
    P1: 4 hours
    P2: 24 hours
    P3: 72 hours

  process:
    1. Identify and contain
    2. Assess impact
    3. Patch vulnerability
    4. Deploy fix
    5. Post-mortem analysis
    6. Update security measures
```

## Compliance Requirements

### OWASP Top 10 Mitigation
```yaml
A01_Broken_Access_Control: RBAC + Tenant isolation
A02_Cryptographic_Failures: TLS 1.3 + AES-256
A03_Injection: Parameterized queries + Input validation
A04_Insecure_Design: Security-first architecture
A05_Security_Misconfiguration: Automated security headers
A06_Vulnerable_Components: Dependency scanning
A07_Identification_Failures: MFA + Strong sessions
A08_Software_Data_Integrity: Code signing + CSP
A09_Security_Logging_Failures: Comprehensive audit logs
A10_Server_Side_Request_Forgery: URL validation + Allowlists
```

### Data Privacy
```typescript
// GDPR/CCPA Compliance
class PrivacyCompliance {
  // Right to be forgotten
  async deleteUserData(userId: string): Promise<void> {
    await this.auditLog('USER_DATA_DELETION_REQUEST', userId);

    // Soft delete with retention period
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        // Anonymize PII
        email: `deleted-${userId}@deleted.com`,
        name: 'Deleted User',
        // Keep for audit trail
        retainUntil: addDays(new Date(), 30)
      }
    });
  }

  // Data portability
  async exportUserData(userId: string): Promise<Buffer> {
    const data = await this.collectUserData(userId);
    return this.formatAsJSON(data);
  }
}
```

## Validation Checklist

- [ ] No secrets in code or config files
- [ ] All endpoints require authentication
- [ ] Tenant isolation enforced everywhere
- [ ] Input validation on all user inputs
- [ ] SQL queries are parameterized
- [ ] Security headers configured
- [ ] Audit logging implemented
- [ ] Dependencies scanned for vulnerabilities
- [ ] Encryption at rest and in transit
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Session management secure
- [ ] Password policy enforced
- [ ] MFA available for sensitive accounts

## Enforcement

Security standards enforcement through:
1. Pre-commit secret scanning (gitleaks)
2. SAST scanning in CI/CD (Snyk/SonarQube)
3. Dependency vulnerability scanning
4. Penetration testing (quarterly)
5. Security code review requirements
6. Automated security test suite