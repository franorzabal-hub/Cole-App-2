# Tasks: Code Review and Project Restructuring

**Input**: Design documents from `/specs/001-code-review-restructure/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✓ Tech stack: TypeScript, NestJS, Next.js 14, React Native/Expo
   → ✓ Structure: Multi-module (backend, web-admin, mobile-app)
2. Load optional design documents:
   → data-model.md: Module boundaries, shared libraries, config schema
   → contracts/: Code quality and security standards
   → research.md: Critical issues - exposed secrets, duplicates, no tests
3. Generate tasks by category:
   → Security: Remove secrets, implement Secret Manager
   → Cleanup: Remove 40+ obsolete files
   → Consolidation: Merge duplicate implementations
   → Testing: Add test infrastructure for web and mobile
   → Configuration: Standardize configs across modules
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Security tasks = HIGHEST priority
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T055)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (55 tasks generated)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: CRITICAL Security Fixes (IMMEDIATE - Day 1)
**⚠️ MUST COMPLETE FIRST - Security vulnerabilities exposed**

- [x] T001 Remove all hardcoded secrets from backend/.env and commit clean version
- [x] T002 [P] Add .env, .env.local, .env.* to .gitignore in all modules
- [x] T003 [P] Install and configure gitleaks for pre-commit secret scanning
- [x] T004 Rotate all exposed credentials (JWT secret, database password, Firebase keys)
- [x] T005 Create backend/src/config/secrets.service.ts for Google Secret Manager integration
- [x] T006 Update backend/src/config/app.config.ts to use secrets service
- [x] T007 [P] Remove Firebase private key from backend/.env
- [x] T008 Document secret management process in SECURITY.md

## Phase 3.2: Cleanup Obsolete Files (Day 1)
**Safe to delete - no dependencies**

- [x] T009 [P] Delete backend/test-login.js
- [x] T010 [P] Delete backend/fix-graphql-types.js
- [x] T011 [P] Delete test-login.html from root
- [x] T012 [P] Delete mobile-app/.expo/README 2.md
- [x] T013 [P] Delete mobile-app/.expo/settings 2.json
- [x] T014 [P] Delete mobile-app/.expo/devices 2.json
- [x] T015 Remove entire web-admin/.next/ directory and add to .gitignore
- [x] T016 [P] Clean up any .DS_Store files and add to .gitignore
- [x] T017 Update .gitignore with comprehensive exclusions

## Phase 3.3: Tests Infrastructure Setup (Day 2)
**CRITICAL: Must setup before any refactoring per TDD principle**

### Web Admin Tests
- [x] T018 Configure Jest in web-admin/jest.config.js extending base config
- [x] T019 Create web-admin/tests/setup.ts for test environment
- [x] T020 [P] Write test for unified Firebase config in web-admin/tests/unit/firebase.test.ts
- [x] T021 [P] Write test for unified Apollo client in web-admin/tests/unit/apollo-client.test.ts
- [x] T022 [P] Write test for consolidated Auth context in web-admin/tests/unit/AuthContext.test.tsx
- [x] T023 Create web-admin/tests/integration/auth-flow.test.ts

### Mobile App Tests
- [x] T024 Configure Jest and React Native Testing Library in mobile-app/jest.config.js
- [x] T025 Create mobile-app/tests/setup.ts for test environment
- [x] T026 [P] Write test for API service in mobile-app/tests/unit/api.test.ts
- [x] T027 [P] Write test for Firebase config in mobile-app/tests/unit/firebase.test.ts
- [x] T028 [P] Write test for navigation in mobile-app/tests/unit/navigation.test.tsx
- [x] T029 Create mobile-app/tests/integration/auth-flow.test.ts

## Phase 3.4: Code Consolidation (Day 2-3)
**Merge duplicate implementations - tests must pass first**

### Web Admin Consolidation
- [x] T030 Merge firebase.ts and firebase-simple.ts into single web-admin/lib/firebase.ts
- [x] T031 Merge apollo-client.ts and apollo-client-simple.ts into web-admin/lib/apollo-client.ts
- [x] T032 Merge AuthContext.tsx and AuthContextSimple.tsx into web-admin/contexts/AuthContext.tsx
- [x] T033 Update all imports to use consolidated modules
- [x] T034 Remove old duplicate files after verification

### Shared Libraries Creation
- [x] T035 Create packages/types directory structure
- [x] T036 [P] Create packages/types/src/index.ts with common TypeScript interfaces
- [x] T037 [P] Create packages/types/package.json and tsconfig.json
- [x] T038 Create packages/utils directory structure
- [x] T039 [P] Create packages/utils/src/date.ts with date utilities
- [x] T040 [P] Create packages/utils/src/validation.ts with validation functions
- [x] T041 [P] Create packages/utils/package.json and tsconfig.json

## Phase 3.5: Configuration Standardization (Day 3)
**Create consistent configuration across all modules**

- [x] T042 Create tsconfig.base.json in root with shared TypeScript settings
- [x] T043 [P] Update backend/tsconfig.json to extend base
- [x] T044 [P] Update web-admin/tsconfig.json to extend base
- [x] T045 [P] Update mobile-app/tsconfig.json to extend base
- [x] T046 Create .eslintrc.base.js with shared ESLint rules
- [x] T047 [P] Update all module ESLint configs to extend base
- [x] T048 Create backend/src/config/validation.schema.ts for env validation
- [x] T049 Align React version to 18.2.0 across all modules

## Phase 3.6: Quality Enforcement (Day 4)
**Setup automated quality checks**

- [x] T050 [P] Configure Prettier with .prettierrc in root
- [x] T051 Setup Husky pre-commit hooks for linting and formatting
- [x] T052 Add pre-commit secret scanning with gitleaks
- [x] T053 [P] Create GitHub Actions workflow for security scanning
- [x] T054 [P] Create GitHub Actions workflow for test coverage reporting
- [x] T055 Run full validation suite from quickstart.md

## Dependencies
```
Security (T001-T008) → Must complete first (exposed secrets)
Cleanup (T009-T017) → Safe to do in parallel
Tests Setup (T018-T029) → Before consolidation (TDD)
Consolidation (T030-T034) → After tests pass
Shared Libraries (T035-T041) → Can be parallel
Configuration (T042-T049) → After shared libraries
Quality (T050-T055) → Final validation
```

## Parallel Execution Examples

### Batch 1: Immediate Security & Cleanup (T002-T003, T009-T016)
```typescript
// Launch security and cleanup tasks together
const tasks = [
  "Add .env files to .gitignore in all modules",
  "Install gitleaks for secret scanning",
  "Delete backend/test-login.js",
  "Delete backend/fix-graphql-types.js",
  "Delete test-login.html",
  "Delete duplicate Expo config files",
  "Clean up .DS_Store files"
];

// All operate on different files - safe to parallelize
await Promise.all(tasks.map(task => executeTask(task)));
```

### Batch 2: Test File Creation (T020-T022, T026-T028)
```typescript
// Create all unit test files in parallel
const testTasks = [
  "Write test for Firebase config in web-admin",
  "Write test for Apollo client in web-admin",
  "Write test for Auth context in web-admin",
  "Write test for API service in mobile-app",
  "Write test for Firebase in mobile-app",
  "Write test for navigation in mobile-app"
];

// Different test files - can run in parallel
await Promise.all(testTasks.map(task => createTestFile(task)));
```

### Batch 3: Package Creation (T036-T037, T039-T041)
```typescript
// Create package structure in parallel
const packageTasks = [
  "Create packages/types/src/index.ts",
  "Create packages/types/package.json",
  "Create packages/utils/src/date.ts",
  "Create packages/utils/src/validation.ts",
  "Create packages/utils/package.json"
];

// Independent package files
await Promise.all(packageTasks.map(task => createPackageFile(task)));
```

### Batch 4: Config Updates (T043-T045, T047)
```typescript
// Update all tsconfig files in parallel
const configTasks = [
  "Update backend/tsconfig.json",
  "Update web-admin/tsconfig.json",
  "Update mobile-app/tsconfig.json",
  "Update module ESLint configs"
];

// Different config files per module
await Promise.all(configTasks.map(task => updateConfig(task)));
```

## Task Execution Order

```
Day 1 Morning:
├── T001 (Critical: Remove secrets)
├── T004 (Critical: Rotate credentials)
└── Parallel Batch:
    ├── T002, T003 (Security setup)
    └── T009-T017 (Cleanup)

Day 1 Afternoon:
├── T005-T008 (Secret Manager setup)
└── T018-T019, T024-T025 (Test setup)

Day 2:
├── T020-T023, T026-T029 (Write tests)
├── T030-T034 (Consolidation - after tests)
└── T035-T041 (Shared libraries - parallel)

Day 3:
├── T042-T049 (Configuration)
└── T050-T055 (Quality enforcement)
```

## Notes
- [P] tasks = different files, no dependencies
- Security tasks T001-T008 are HIGHEST priority
- Tests must be written and failing before consolidation
- Commit after each major phase
- Run validation from quickstart.md after each phase

## Success Metrics
- Zero exposed secrets in repository
- Zero duplicate implementations
- Test coverage: Backend 80%, Web 70%, Mobile 70%
- All files follow code quality standards
- All constitution principles satisfied

## Validation Checklist
*GATE: Checked after task completion*

- [x] All security vulnerabilities addressed (T001-T008)
- [x] All obsolete files removed (T009-T017)
- [x] Test infrastructure created for all modules (T018-T029)
- [x] All duplicates consolidated (T030-T034)
- [x] Shared libraries created (T035-T041)
- [x] Configuration standardized (T042-T049)
- [x] Quality gates enforced (T050-T055)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Task count: 55 tasks total