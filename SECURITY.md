# Security Guidelines for ColeApp

## 🔐 Secret Management

### Overview
ColeApp uses a multi-layered approach to secret management to ensure sensitive information is never exposed in the codebase.

### Environment-Based Configuration

#### Development Environment
1. **Use `.env.local` files** (gitignored)
   - Copy `.env` to `.env.local`
   - Fill in actual development secrets
   - Never commit `.env.local`

2. **Template Files**
   - `.env` files contain only template/example values
   - These are safe to commit and serve as documentation

#### Production Environment
1. **Google Secret Manager** (recommended)
   - All production secrets stored in Google Secret Manager
   - Accessed via service account with minimal permissions
   - Automatic rotation support

2. **Environment Variables**
   - Set via deployment platform (Cloud Run, etc.)
   - Never hardcode in application code

### Required Secrets

| Secret | Description | Rotation Frequency |
|--------|-------------|-------------------|
| `JWT_SECRET` | JWT signing key | 90 days |
| `DATABASE_URL` | PostgreSQL connection string | 60 days |
| `REDIS_URL` | Redis connection string | 180 days |
| `FIREBASE_PRIVATE_KEY` | Firebase service account key | 365 days |

### Secret Rotation Process

1. **Generate new secret**
   ```bash
   openssl rand -hex 32  # For JWT secrets
   ```

2. **Update in Secret Manager**
   ```bash
   gcloud secrets versions add JWT_SECRET --data-file=-
   ```

3. **Deploy with new version**
   - Update deployment to use new secret version
   - Verify application functionality
   - Revoke old secret after confirmation

### Pre-Commit Security Checks

We use `gitleaks` to scan for secrets before commits:

```bash
# Run manually
gitleaks detect --source . --verbose

# Automatic via git hooks (installed with husky)
# Runs on every commit
```

### Security Best Practices

1. **Never commit secrets**
   - Even in development branches
   - Even "temporary" secrets
   - Even in comments

2. **Use strong secrets**
   - Minimum 32 characters for keys
   - Use cryptographically secure random generators
   - Avoid predictable patterns

3. **Limit secret scope**
   - Use different secrets per environment
   - Implement least-privilege access
   - Rotate regularly

4. **Monitor for leaks**
   - Enable GitHub secret scanning
   - Regular gitleaks scans
   - Audit access logs

### If a Secret is Exposed

**IMMEDIATE ACTIONS:**

1. **Rotate the secret immediately**
   - Generate new secret
   - Update all services
   - Revoke old secret

2. **Assess impact**
   - Check access logs
   - Identify potential unauthorized access
   - Document timeline

3. **Notify team**
   - Alert security team
   - Update stakeholders
   - Document incident

4. **Prevent recurrence**
   - Review how exposure occurred
   - Update processes
   - Add additional checks

### Development Setup

1. **Initial setup**
   ```bash
   # Copy template
   cp backend/.env backend/.env.local

   # Edit with your values
   vim backend/.env.local

   # Verify it's gitignored
   git status --ignored | grep .env.local
   ```

2. **Install security tools**
   ```bash
   # Install gitleaks
   brew install gitleaks  # macOS

   # Install pre-commit hooks
   npm install --save-dev husky
   npx husky install
   ```

3. **Verify configuration**
   ```bash
   # Test gitleaks
   gitleaks detect --source . --verbose

   # Should report: "No leaks found"
   ```

### Common Mistakes to Avoid

❌ **DON'T:**
- Commit `.env.local` files
- Use production secrets in development
- Share secrets via email/Slack
- Use weak or default passwords
- Log secret values

✅ **DO:**
- Use Secret Manager for production
- Rotate secrets regularly
- Use separate secrets per environment
- Document secret requirements
- Monitor for exposures

### Security Contacts

- **Security Team**: security@coleapp.com
- **Incident Response**: incidents@coleapp.com
- **On-Call**: Use PagerDuty

### Additional Resources

- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Google Secret Manager Docs](https://cloud.google.com/secret-manager/docs)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)

---

*Last Updated: 2025-09-20*
*Version: 1.0.0*