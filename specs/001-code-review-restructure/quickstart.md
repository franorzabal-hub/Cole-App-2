# Quickstart: Validation Guide for Code Restructuring

**Date**: 2025-09-20
**Feature**: Code Review and Project Restructuring
**Purpose**: Step-by-step validation of restructuring success

## Prerequisites

Ensure you have the following tools installed:
```bash
# Required tools
node --version  # Should be 20+
npm --version   # Should be 10+
git --version   # Should be 2.40+

# Security scanning
npm install -g gitleaks  # For secret scanning

# Code quality tools
npm install -g eslint
npm install -g prettier
```

## Phase 1: Security Validation

### Step 1: Scan for Secrets
```bash
# Run from repository root
gitleaks detect --source . --verbose

# Expected output:
# "No leaks found"
```

### Step 2: Verify Environment Files
```bash
# Check that .env files are gitignored
git status --ignored | grep -E "\.env"

# Verify no secrets in committed files
grep -r "BEGIN PRIVATE KEY" --exclude-dir=node_modules .
grep -r "password.*=" --exclude-dir=node_modules .
# Should return no results
```

### Step 3: Validate Secret Manager Integration
```bash
# Backend should use Secret Manager
cd backend
npm run validate:env

# Should output:
# ✓ All secrets loading from Secret Manager
# ✓ No hardcoded credentials detected
```

## Phase 2: Code Quality Validation

### Step 1: Check for Duplicates
```bash
# Verify no duplicate implementations exist
ls web-admin/lib/ | grep -E "(simple|duplicate|old)"
# Should return no results

# Verify single Firebase config
find . -name "*firebase*.ts" -o -name "*firebase*.js" | grep -v node_modules
# Should show only one config per module

# Verify single Apollo client
find . -name "*apollo*.ts" -o -name "*apollo*.js" | grep -v node_modules
# Should show only one client config
```

### Step 2: Lint All Modules
```bash
# Backend
cd backend && npm run lint
# Expected: No errors

# Web Admin
cd ../web-admin && npm run lint
# Expected: No errors

# Mobile App
cd ../mobile-app && npm run lint
# Expected: No errors
```

### Step 3: Type Check
```bash
# Backend
cd backend && npm run type-check
# Or: npx tsc --noEmit

# Web Admin
cd ../web-admin && npm run type-check

# Mobile App
cd ../mobile-app && npm run type-check

# All should pass without errors
```

## Phase 3: Test Coverage Validation

### Step 1: Run Backend Tests
```bash
cd backend
npm test -- --coverage

# Expected coverage:
# Statements   : 80% (minimum)
# Branches     : 75% (minimum)
# Functions    : 80% (minimum)
# Lines        : 80% (minimum)
```

### Step 2: Run Web Admin Tests
```bash
cd web-admin
npm test -- --coverage

# Expected coverage:
# Statements   : 70% (minimum)
# Branches     : 65% (minimum)
# Functions    : 70% (minimum)
# Lines        : 70% (minimum)
```

### Step 3: Run Mobile App Tests
```bash
cd mobile-app
npm test -- --coverage

# Expected coverage:
# Statements   : 70% (minimum)
# Branches     : 65% (minimum)
# Functions    : 70% (minimum)
# Lines        : 70% (minimum)
```

## Phase 4: Structure Validation

### Step 1: Verify Clean File Structure
```bash
# Check for obsolete files
test ! -f backend/test-login.js
test ! -f backend/fix-graphql-types.js
test ! -f test-login.html

# Check for duplicate Expo files
ls mobile-app/.expo/ | grep " 2\."
# Should return no results

# Verify .next is gitignored
test ! -d web-admin/.next || echo ".next should be gitignored"
```

### Step 2: Verify Shared Libraries
```bash
# Check if shared packages exist
test -d packages/types && echo "✓ Types package exists"
test -d packages/utils && echo "✓ Utils package exists"
test -d packages/ui && echo "✓ UI package exists"

# Verify packages are properly linked
cd backend && npm ls @coleapp/types
cd ../web-admin && npm ls @coleapp/types
cd ../mobile-app && npm ls @coleapp/types
```

### Step 3: Configuration Consistency
```bash
# Check for base configs
test -f tsconfig.base.json && echo "✓ Base TypeScript config exists"
test -f .eslintrc.base.js && echo "✓ Base ESLint config exists"

# Verify configs extend base
grep -l "extends.*base" */tsconfig.json
# Should list all module tsconfig files
```

## Phase 5: Performance Validation

### Step 1: Backend Performance
```bash
cd backend
npm run start:dev

# In another terminal
npm run test:performance

# Expected metrics:
# Average response time: <200ms
# P95 response time: <500ms
# Throughput: >100 req/s
```

### Step 2: Web Admin Performance
```bash
cd web-admin
npm run build
npm run analyze

# Check bundle sizes:
# First Load JS: <200kB
# Largest Contentful Paint: <2.5s
```

### Step 3: Mobile App Performance
```bash
cd mobile-app
npm run start

# Use React Native performance monitor
# Expected:
# JS FPS: >55
# UI FPS: >55
# RAM usage: <200MB idle
```

## Phase 6: Integration Validation

### Step 1: End-to-End Flow
```bash
# Start all services
docker-compose up -d

# Run E2E tests
npm run test:e2e

# Key flows to validate:
# ✓ User registration
# ✓ Authentication
# ✓ Tenant isolation
# ✓ Data persistence
# ✓ Real-time updates
```

### Step 2: Cross-Module Communication
```bash
# Test API from web admin
cd web-admin
npm run test:api-integration

# Test API from mobile
cd ../mobile-app
npm run test:api-integration

# Both should pass all tests
```

## Phase 7: Constitution Compliance

### Security-First Architecture
```bash
# Run security audit
npm audit --audit-level=moderate

# Check authentication
curl -X GET http://localhost:3000/api/protected
# Should return 401 without token

# Verify encryption
openssl s_client -connect localhost:443 -tls1_3
# Should connect with TLS 1.3
```

### Multitenant Isolation
```bash
# Test tenant isolation
npm run test:tenant-isolation

# Verify no cross-tenant access
# All tests should pass
```

### Test-Driven Development
```bash
# Verify tests were written first
git log --grep="test:" --grep="TDD:" --oneline | wc -l
# Should show significant test commits

# Check test-first workflow
npm run validate:tdd
# Should confirm TDD practice
```

### Mobile-First UX
```bash
# Check mobile responsiveness
cd web-admin
npm run test:mobile-responsive

# Verify mobile optimizations
cd ../mobile-app
npm run analyze:performance
# Should show optimized bundle
```

### Configuration Over Code
```bash
# Check for hardcoded values
grep -r "tenant.*=.*\"" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules .
# Should return no hardcoded tenant IDs

# Verify configuration loading
npm run validate:config
# Should show all config from environment
```

## Success Checklist

Run this final validation to confirm successful restructuring:

```bash
#!/bin/bash
echo "=== ColeApp Restructuring Validation ==="
echo ""

# Security
echo -n "[ ] No secrets exposed: "
gitleaks detect --source . --no-banner 2>/dev/null && echo "✓" || echo "✗"

# Code Quality
echo -n "[ ] No duplicate files: "
[ -z "$(ls web-admin/lib/ 2>/dev/null | grep -E '(simple|duplicate|old)')" ] && echo "✓" || echo "✗"

# Tests
echo -n "[ ] Backend tests pass: "
cd backend && npm test --silent 2>/dev/null && echo "✓" || echo "✗"

echo -n "[ ] Web tests pass: "
cd ../web-admin && npm test --silent 2>/dev/null && echo "✓" || echo "✗"

echo -n "[ ] Mobile tests pass: "
cd ../mobile-app && npm test --silent 2>/dev/null && echo "✓" || echo "✗"

# Structure
echo -n "[ ] Shared packages exist: "
[ -d "../packages" ] && echo "✓" || echo "✗"

# Performance
echo -n "[ ] Build succeeds: "
cd ../backend && npm run build --silent 2>/dev/null && echo "✓" || echo "✗"

echo ""
echo "=== Validation Complete ==="
```

## Troubleshooting

### If secrets are still exposed:
1. Check all .env files are in .gitignore
2. Run `git rm --cached .env*` to untrack
3. Rotate all exposed credentials
4. Implement Secret Manager

### If tests fail:
1. Check test environment setup
2. Verify database migrations ran
3. Ensure Redis is running
4. Check Firebase emulator status

### If performance degrades:
1. Profile with Chrome DevTools
2. Check for unnecessary re-renders
3. Verify caching is working
4. Review database queries

## Rollback Plan

If issues occur during restructuring:

```bash
# Stash current changes
git stash

# Return to last stable commit
git checkout main
git pull origin main

# Create new branch for fixes
git checkout -b hotfix/restructuring-issues

# Apply specific fixes only
git stash pop
# Cherry-pick working changes
```

## Completion Criteria

The restructuring is complete when:
1. ✅ All validation steps pass
2. ✅ No security vulnerabilities detected
3. ✅ Test coverage meets thresholds
4. ✅ Performance benchmarks maintained
5. ✅ All constitution principles satisfied
6. ✅ Zero console errors in any module
7. ✅ Successful deployment to staging

Once all criteria are met, the restructuring can be merged to main branch.