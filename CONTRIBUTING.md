# Contributing to Zero Trust Architecture Demo

Thank you for your interest in contributing to the Zero Trust Architecture Demo! This project demonstrates modern zero-trust security principles with AI-powered natural language to SQL conversion.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.8+ (for backend services)
- Ollama (for AI text-to-SQL functionality)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agentic-auth-zerotrust.git
   cd agentic-auth-zerotrust
   ```

2. **Set up Ollama (required for AI features)**
   ```bash
   ./setup-ollama.sh
   ```

3. **Start the application**
   ```bash
   ./deploy.sh
   ```

4. **Access the demo**
   - Frontend: http://localhost:3000
   - Keycloak: http://localhost:8080

## Development

### Project Structure

```
├── agent/                 # API Gateway service
├── data-generator/        # AI-powered data generation
├── frontend/             # React frontend application
├── keycloak/             # Keycloak configuration
├── logger/               # Audit logging service
├── mcp-server/           # Model Context Protocol server
├── middleware/           # Business logic and AI integration
├── policies/             # OPA Rego policies
└── db/                   # Database initialization scripts
```

### Running Locally

1. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres_us postgres_eu postgres_sbx opa auth-service
   ```

2. **Start application services**
   ```bash
   docker-compose up -d middleware agent mcp-server logger
   ```

3. **Start frontend (development mode)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Testing

Run the test suite:
```bash
./test-all-scenarios.sh
```

## Contributing Guidelines

### Code Style

- **JavaScript/React**: Use ESLint and Prettier configurations
- **Python**: Follow PEP 8 style guidelines
- **SQL**: Use consistent formatting and naming conventions

### Commit Messages

Use conventional commit format:
```
type(scope): description

feat(auth): add JWT token validation
fix(ui): resolve logout button issue
docs(readme): update installation instructions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** (if applicable)
5. **Update documentation** (if needed)
6. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Issue Reporting

When reporting issues, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to reproduce the problem
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, browser, Docker version, etc.
- **Screenshots**: If applicable

### Feature Requests

For feature requests, please:

1. **Check existing issues** first
2. **Describe the feature** clearly
3. **Explain the use case** and benefits
4. **Consider implementation** complexity

## Security

### Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please email security@offlyn.ai with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fixes (if any)

### Security Considerations

- Never commit secrets, API keys, or passwords
- Use environment variables for configuration
- Follow secure coding practices
- Validate all inputs
- Use HTTPS in production

## Documentation

### Adding Documentation

- **README updates**: Update relevant sections
- **API documentation**: Update OpenAPI specs
- **Code comments**: Add clear, concise comments
- **Architecture docs**: Update system diagrams

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep documentation up to date

## Community

### Getting Help

- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bug reports and feature requests
- **Email**: contact@offlyn.ai for general inquiries

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to the Zero Trust Architecture Demo! 🚀
