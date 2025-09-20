# Data Model: Code Review and Restructuring

**Date**: 2025-09-20
**Feature**: Code Review and Project Restructuring
**Status**: Design Phase

## Restructuring Model Overview

This document defines the target structure and organization patterns for the ColeApp codebase after restructuring.

## Module Boundaries

### Core Modules

```yaml
modules:
  backend:
    type: NestJS API
    responsibilities:
      - Business logic
      - Data persistence
      - Authentication/Authorization
      - GraphQL/REST endpoints
    dependencies:
      - PostgreSQL
      - Redis
      - Firebase Admin

  web-admin:
    type: Next.js Application
    responsibilities:
      - Admin interface
      - School management
      - Content management
      - Reports and analytics
    dependencies:
      - Backend API
      - Firebase Auth

  mobile-app:
    type: React Native/Expo
    responsibilities:
      - Parent/student interface
      - Push notifications
      - Offline capability
      - Native features
    dependencies:
      - Backend API
      - Firebase Auth
      - Expo services
```

### Shared Libraries (To Be Created)

```yaml
shared:
  common-types:
    location: packages/types
    contents:
      - TypeScript interfaces
      - API contracts
      - Validation schemas
      - Constants and enums

  common-utils:
    location: packages/utils
    contents:
      - Date/time helpers
      - Validation functions
      - Formatting utilities
      - Error handlers

  ui-components:
    location: packages/ui
    contents:
      - Cross-platform components
      - Theme definitions
      - Icon library
      - Style utilities
```

## File Organization Patterns

### Backend Structure

```
backend/
├── src/
│   ├── config/           # Centralized configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── validation.schema.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── tenants/
│   │   └── [domain]/
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── interceptors/
│   └── shared/
│       ├── types/
│       └── utils/
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### Web Admin Structure

```
web-admin/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   └── api/
│   ├── components/
│   │   ├── ui/          # shadcn components
│   │   └── features/    # Feature components
│   ├── lib/
│   │   ├── api/         # API client (single)
│   │   ├── firebase/    # Firebase config (single)
│   │   └── utils/
│   ├── hooks/
│   ├── contexts/        # Single auth context
│   └── types/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── public/
```

### Mobile App Structure

```
mobile-app/
├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   │   ├── api/
│   │   └── firebase/
│   ├── hooks/
│   ├── contexts/
│   └── utils/
├── tests/
│   ├── unit/
│   └── integration/
└── assets/
```

## Configuration Consolidation

### Environment Variables Schema

```typescript
interface EnvironmentConfig {
  // Common
  NODE_ENV: 'development' | 'staging' | 'production'
  API_URL: string

  // Backend specific
  DATABASE_URL: string
  REDIS_URL: string
  JWT_SECRET: SecretString  // From Secret Manager

  // Firebase
  FIREBASE_PROJECT_ID: string
  FIREBASE_PRIVATE_KEY: SecretString  // From Secret Manager
  FIREBASE_CLIENT_EMAIL: string

  // Frontend specific
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_FIREBASE_CONFIG: string
}
```

### Configuration Files Hierarchy

```yaml
configs:
  base:
    - tsconfig.base.json      # Shared TypeScript config
    - .eslintrc.base.js       # Shared ESLint rules
    - jest.config.base.js     # Shared Jest config

  module-specific:
    - backend/tsconfig.json   # Extends base
    - web-admin/tsconfig.json # Extends base
    - mobile-app/tsconfig.json # Extends base
```

## Dependency Management

### Version Alignment

```json
{
  "react": "18.2.0",           // Standardized across all modules
  "typescript": "5.3.0",       // Unified version
  "jest": "29.7.0",           // Consistent testing
  "@types/node": "20.10.0"    // Aligned with Node.js version
}
```

### Shared Dependencies

```yaml
workspace:
  packages:
    - packages/types
    - packages/utils
    - packages/ui
    - backend
    - web-admin
    - mobile-app

  shared-deps:
    - typescript
    - eslint
    - prettier
    - jest
    - @types/*
```

## Security Model

### Secrets Management

```yaml
secrets:
  storage: Google Secret Manager

  categories:
    system:
      - JWT_SECRET
      - DATABASE_PASSWORD
      - REDIS_PASSWORD

    firebase:
      - FIREBASE_PRIVATE_KEY
      - FIREBASE_SERVICE_ACCOUNT

    third-party:
      - SMTP_PASSWORD
      - PAYMENT_API_KEY

  access-control:
    - Development: Local .env.local (gitignored)
    - Staging: Secret Manager with staging IAM
    - Production: Secret Manager with production IAM
```

### Security Validations

```typescript
interface SecurityChecks {
  preCommit: {
    secretScanning: boolean
    dependencyAudit: boolean
  }

  preBuild: {
    environmentValidation: boolean
    configurationCheck: boolean
  }

  runtime: {
    tenantIsolation: boolean
    authenticationRequired: boolean
    encryptionEnabled: boolean
  }
}
```

## Test Structure Model

### Test Coverage Requirements

```yaml
coverage:
  backend:
    target: 80%
    required:
      - All API endpoints
      - Business logic services
      - Authentication/authorization
      - Database operations

  web-admin:
    target: 70%
    required:
      - Page components
      - API interactions
      - Authentication flows
      - Form validations

  mobile-app:
    target: 70%
    required:
      - Screen components
      - Navigation flows
      - API services
      - Offline functionality
```

### Test File Patterns

```typescript
// Unit test pattern
describe('ComponentName', () => {
  describe('functionality', () => {
    it('should behave correctly', () => {
      // Test implementation
    })
  })
})

// Integration test pattern
describe('Feature Flow', () => {
  beforeAll(async () => {
    // Setup
  })

  it('should complete user journey', async () => {
    // Multi-step test
  })

  afterAll(async () => {
    // Cleanup
  })
})
```

## Migration Entities

### Phase 1: Security & Cleanup
```yaml
entities:
  - SecretsConfiguration
  - EnvironmentValidation
  - ObsoleteFilesList
  - GitignoreUpdates
```

### Phase 2: Code Consolidation
```yaml
entities:
  - UnifiedFirebaseConfig
  - SingleApolloClient
  - ConsolidatedAuthContext
  - SharedTypeDefinitions
```

### Phase 3: Test Infrastructure
```yaml
entities:
  - TestFrameworkSetup
  - CoverageConfiguration
  - TestSuiteStructure
  - CITestPipeline
```

### Phase 4: Configuration
```yaml
entities:
  - BaseConfigurations
  - EnvironmentSchemas
  - ValidationRules
  - BuildProcesses
```

## State Transitions

### Codebase States
```
Current State → Security Fixed → Duplicates Removed →
Tests Added → Configuration Unified → Final State
```

### Module States
```
Unreviewed → Under Review → Issues Identified →
Refactoring → Testing → Validated → Complete
```

## Validation Rules

### File Organization
- No duplicate implementations
- Single source of truth for configurations
- Clear module boundaries
- Consistent naming conventions

### Code Quality
- ESLint rules pass
- TypeScript strict mode
- No any types without justification
- Proper error handling

### Security
- No hardcoded credentials
- All secrets from Secret Manager
- Proper tenant isolation
- Authentication on all endpoints

### Testing
- Coverage meets thresholds
- All tests passing
- E2E tests for critical paths
- Performance benchmarks maintained

## Success Criteria

### Measurable Outcomes
1. Zero security vulnerabilities in scan
2. Code duplication <5% (measured by tool)
3. Test coverage meets all thresholds
4. Build time <5 minutes
5. All constitution principles satisfied

### Quality Gates
1. Pre-commit: Linting, formatting, secret scanning
2. Pre-merge: Tests passing, coverage met
3. Post-merge: E2E tests, performance tests
4. Deployment: Security scan, health checks

This data model provides the blueprint for restructuring the ColeApp codebase into a maintainable, secure, and scalable architecture that fully complies with the project's constitutional principles.