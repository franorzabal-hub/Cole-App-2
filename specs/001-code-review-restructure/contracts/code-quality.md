# Code Quality Contract

**Version**: 1.0.0
**Date**: 2025-09-20
**Scope**: All ColeApp modules

## Code Style Standards

### TypeScript Requirements

```typescript
// tsconfig.json requirements
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint Rules

```javascript
// .eslintrc.js requirements
module.exports = {
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',

    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // Best Practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // Code Quality
    'complexity': ['error', 10],
    'max-depth': ['error', 4],
    'max-lines': ['error', 500],
    'max-lines-per-function': ['error', 100]
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE file (e.g., `API_ENDPOINTS.ts`)
- **Tests**: Same as source with `.test.ts` or `.spec.ts`
- **Directories**: kebab-case (e.g., `user-management/`)

### Code Conventions
```typescript
// Interfaces: PascalCase with 'I' prefix for models only
interface IUser {
  id: string;
  name: string;
}

// Types: PascalCase
type UserRole = 'admin' | 'teacher' | 'parent';

// Enums: PascalCase with singular names
enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Functions/Methods: camelCase
function getUserById(id: string): User {}

// Classes: PascalCase
class UserService {}

// Private members: underscore prefix
class Example {
  private _internalState: string;
}
```

## Documentation Standards

### File Headers
```typescript
/**
 * @file UserService.ts
 * @description Handles user-related business logic
 * @module users
 * @requires {@link TenantService}
 */
```

### Function Documentation
```typescript
/**
 * Creates a new user in the system
 * @param userData - The user information to create
 * @param tenantId - The tenant this user belongs to
 * @returns The created user with generated ID
 * @throws {ValidationError} When userData is invalid
 * @throws {TenantError} When tenant doesn't exist
 * @example
 * const user = await createUser({ name: 'John' }, 'tenant-123');
 */
async function createUser(userData: CreateUserDto, tenantId: string): Promise<User> {}
```

### Complex Logic Comments
```typescript
// BAD
// Increment counter
counter++;

// GOOD
// Increment retry counter to track failed attempts
// for circuit breaker pattern implementation
retryCounter++;
```

## Error Handling Standards

### Error Classes
```typescript
// All custom errors must extend base class
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific errors extend AppError
class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
```

### Error Handling Pattern
```typescript
// Always use try-catch for async operations
async function riskyOperation() {
  try {
    const result = await externalService.call();
    return result;
  } catch (error) {
    // Log the error with context
    logger.error('External service failed', {
      error,
      service: 'externalService',
      operation: 'call'
    });

    // Throw user-friendly error
    throw new AppError(
      'Service temporarily unavailable',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }
}
```

## Testing Standards

### Test Structure
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = { name: 'Test User' };

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(userData.name);
    });

    it('should throw ValidationError for invalid data', async () => {
      // Arrange
      const invalidData = { name: '' };

      // Act & Assert
      await expect(userService.createUser(invalidData))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### Test Coverage Requirements
```yaml
coverage:
  statements: 80%
  branches: 75%
  functions: 80%
  lines: 80%

  excludes:
    - "**/*.spec.ts"
    - "**/*.test.ts"
    - "**/node_modules/**"
    - "**/migrations/**"
    - "**/dist/**"
```

## Security Standards

### Input Validation
```typescript
// Always validate input at boundaries
class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  password: string;
}
```

### SQL Injection Prevention
```typescript
// NEVER use string concatenation for queries
// BAD
const query = `SELECT * FROM users WHERE id = ${userId}`;

// GOOD - Use parameterized queries
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// Or use ORM/Query Builder
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### Authentication/Authorization
```typescript
// All endpoints must have authentication
@UseGuards(JwtAuthGuard)
@Controller('users')
class UserController {}

// Role-based access control
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Get('sensitive-data')
getSensitiveData() {}
```

## Performance Standards

### Query Optimization
```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
    // Don't select unnecessary fields
  }
});

// Use pagination for large datasets
const users = await prisma.user.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' }
});
```

### Caching Strategy
```typescript
// Cache frequently accessed, rarely changed data
@CacheTTL(3600) // 1 hour
async getSchoolInfo(schoolId: string) {
  return this.schoolRepository.findById(schoolId);
}

// Invalidate cache on updates
async updateSchoolInfo(schoolId: string, data: UpdateSchoolDto) {
  const result = await this.schoolRepository.update(schoolId, data);
  await this.cacheManager.del(`school:${schoolId}`);
  return result;
}
```

## Git Commit Standards

### Commit Message Format
```
type(scope): subject

body

footer
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, semicolons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding tests
- **chore**: Maintenance tasks
- **security**: Security improvements

### Examples
```bash
feat(auth): add multi-factor authentication

- Implement TOTP-based 2FA
- Add backup codes generation
- Update user model with MFA fields

Closes #123

---

fix(tenant): prevent cross-tenant data access

Fixed critical security issue where users could access
data from other tenants through malformed API requests.

Security: HIGH
Fixes #456
```

## Module Boundaries

### Dependency Rules
1. **Backend** → Can only import from packages/*
2. **Web-Admin** → Can import from packages/*, cannot import from backend/src
3. **Mobile-App** → Can import from packages/*, cannot import from backend/src or web-admin/src
4. **Packages** → Cannot import from any module, only from other packages

### API Communication
```typescript
// All module communication through defined APIs
// No direct database access from frontend modules
// No shared state between modules

// Good: API call from frontend
const response = await fetch('/api/users');

// Bad: Direct database access from frontend
// const users = await prisma.user.findMany(); // ❌ Never do this
```

## Validation Checklist

- [ ] All TypeScript strict mode rules pass
- [ ] ESLint reports no errors
- [ ] Prettier formatting applied
- [ ] Test coverage meets thresholds
- [ ] No hardcoded secrets
- [ ] No console.log in production code
- [ ] All functions have proper error handling
- [ ] API inputs are validated
- [ ] Database queries are parameterized
- [ ] Caching strategy implemented where needed
- [ ] Documentation for public APIs complete
- [ ] Git commits follow convention

## Enforcement

These standards will be enforced through:
1. Pre-commit hooks (husky)
2. CI/CD pipeline checks
3. Pull request reviews
4. Automated code quality tools

Non-compliance will result in:
1. Build failures
2. PR rejection
3. Required refactoring before merge