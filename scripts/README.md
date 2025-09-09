# Scripts Directory

This directory contains all shell scripts for deployment, testing, and maintenance of the Zero Trust Architecture Demo.

## 📋 Available Scripts

### 🚀 Deployment Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy.sh` | Main deployment script with progress tracking | `./scripts/deploy.sh [command]` |
| `setup-ollama.sh` | Install and configure Ollama for AI features | `./scripts/setup-ollama.sh` |
| `start-with-data.sh` | Start services with pre-populated data | `./scripts/start-with-data.sh` |

### 🧪 Testing Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `test-all-scenarios.sh` | Run comprehensive test suite | `./scripts/test-all-scenarios.sh` |
| `test-keycloak.sh` | Test Keycloak authentication | `./scripts/test-keycloak.sh` |
| `test-patient-portal.sh` | Test patient portal functionality | `./scripts/test-patient-portal.sh` |
| `test-progress.sh` | Test deployment progress tracking | `./scripts/test-progress.sh` |

### 📊 Monitoring Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `status.sh` | Check service status and health | `./scripts/status.sh` |

## 🚀 Quick Start

### Deploy Everything
```bash
# Set up Ollama (required for AI features)
./scripts/setup-ollama.sh

# Deploy the entire stack
./scripts/deploy.sh
```

### Run Tests
```bash
# Run all tests
./scripts/test-all-scenarios.sh

# Test specific components
./scripts/test-keycloak.sh
./scripts/test-patient-portal.sh
```

### Check Status
```bash
# Check service status
./scripts/status.sh

# Check deployment status
./scripts/deploy.sh status
```

## 📚 Script Details

### deploy.sh
The main deployment script with advanced features:
- **Progress bars** for each deployment phase
- **Health checks** for all services
- **Color-coded status** indicators
- **Service availability** confirmation

**Commands:**
- `deploy` - Deploy the entire stack
- `status` - Check service status
- `logs [service]` - View service logs
- `cleanup` - Clean up deployment

### setup-ollama.sh
Installs and configures Ollama for AI text-to-SQL functionality:
- Downloads and installs Ollama
- Pulls the required Llama 3.2 model
- Starts the Ollama service
- Verifies installation

### test-all-scenarios.sh
Comprehensive test suite covering:
- Authentication flows
- Authorization policies
- Database access patterns
- AI text-to-SQL conversion
- Error handling scenarios

## 🔧 Development

### Adding New Scripts
1. Create the script in this directory
2. Make it executable: `chmod +x script-name.sh`
3. Update this README with documentation
4. Add any necessary shebang: `#!/bin/bash`

### Script Standards
- Use `#!/bin/bash` shebang
- Include error handling with `set -e`
- Add usage information with `-h` flag
- Use consistent logging format
- Include progress indicators for long operations

## 🐛 Troubleshooting

### Common Issues

**Script not found:**
```bash
# Make sure you're in the project root
cd /path/to/agentic-auth-zerotrust

# Check script exists
ls -la scripts/
```

**Permission denied:**
```bash
# Make script executable
chmod +x scripts/script-name.sh
```

**Docker not running:**
```bash
# Start Docker Desktop or Docker daemon
# Then retry the script
```

## 📞 Support

For script-related issues:
- Check the script output for error messages
- Review the main [README](../README.md) for setup instructions
- Open an issue on GitHub with script details
