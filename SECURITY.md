# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing us at:

**security@offlyn.ai**

Please include the following information in your report:

- **Type of issue** (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths** of source file(s) related to the manifestation of the issue
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Special configuration** required to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit it

### What to Expect

After you submit a report, we will:

1. **Confirm receipt** of your vulnerability report within 48 hours
2. **Provide regular updates** on our progress
3. **Credit you** in our security advisories (unless you prefer to remain anonymous)

### Security Best Practices

This project implements several security best practices:

#### Authentication & Authorization
- **JWT-based authentication** with Keycloak
- **Role-based access control** (RBAC)
- **Zero-trust architecture** principles
- **Open Policy Agent (OPA)** for policy enforcement

#### Data Protection
- **Database isolation** by region and access level
- **Input validation** and sanitization
- **SQL injection prevention** through parameterized queries
- **CORS configuration** for cross-origin requests

#### Infrastructure Security
- **Containerized services** for isolation
- **Network segmentation** between services
- **Audit logging** for all operations
- **Environment variable** configuration for secrets

#### Development Security
- **Dependency scanning** for known vulnerabilities
- **Code review** requirements for all changes
- **Security testing** in CI/CD pipeline
- **Regular security updates** for dependencies

### Security Considerations for Contributors

When contributing to this project:

1. **Never commit secrets** (API keys, passwords, tokens)
2. **Use environment variables** for configuration
3. **Validate all inputs** from external sources
4. **Follow secure coding practices**
5. **Update dependencies** regularly
6. **Test security features** thoroughly

### Known Security Limitations

This is a **demonstration project** and should not be used in production without additional security hardening:

- **Default credentials** are used for demo purposes
- **Self-signed certificates** may be used in development
- **Debug logging** may expose sensitive information
- **CORS settings** are permissive for development

### Security Updates

Security updates will be released as:

- **Patch releases** (1.0.x) for critical security fixes
- **Minor releases** (1.x.0) for security improvements
- **Security advisories** for significant vulnerabilities

### Contact

For security-related questions or concerns:

- **Email**: security@offlyn.ai
- **PGP Key**: Available upon request
- **Response Time**: Within 48 hours for initial response

Thank you for helping keep our project secure! 🔒
