# 🚀 Apolaki Solar Platform - Scripts Directory

This directory contains automation and utility scripts for development, deployment, and operations.

## 📋 Available Scripts

### 1. `dev-setup-local.sh`
**Purpose:** Automated local development environment setup

**Usage:**
```bash
./scripts/dev-setup-local.sh
```

**What it does:**
- ✅ Checks prerequisites (Docker, Node.js, npm)
- ✅ Creates necessary directories
- ✅ Sets up `.env.local` from template
- ✅ Starts Docker services
- ✅ Initializes database
- ✅ Installs frontend dependencies
- ✅ Installs backend dependencies

**Requirements:**
- Docker & Docker Compose
- Node.js 18+
- npm 9+

### 2. `deploy-prod.sh`
**Purpose:** Automated production deployment with Kubernetes

**Usage:**
```bash
# Dry run (no actual deployment)
DRY_RUN=true ./scripts/deploy-prod.sh production v1.0.0

# Actual deployment
./scripts/deploy-prod.sh staging latest

# With Slack notification
NOTIFY_SLACK=true ./scripts/deploy-prod.sh production v1.0.0
```

**Parameters:**
- `$1` - Environment (staging, production) - default: staging
- `$2` - Version tag - default: latest

**Environment Variables:**
- `DRY_RUN` - Set to true for dry run (default: false)
- `NOTIFY_SLACK` - Set to true to send Slack notifications (default: true)
- `SLACK_WEBHOOK_URL` - Slack webhook for notifications
- `DOCKER_REGISTRY` - Docker registry URL (default: ghcr.io)

**What it does:**
- ✅ Validates prerequisites
- ✅ Backs up database (production only)
- ✅ Builds Docker images
- ✅ Pushes images to registry
- ✅ Deploys with Helm charts
- ✅ Waits for rollout completion
- ✅ Runs smoke tests
- ✅ Generates deployment report
- ✅ Sends Slack notifications

**Output:**
- Deployment logs: `logs/deployment_TIMESTAMP.log`
- Deployment report: `logs/deployment_report_TIMESTAMP.md`

### 3. `docker-utils.sh`
**Purpose:** Docker utility commands for image building, pushing, and container management

**Usage:**
```bash
./scripts/docker-utils.sh [command] [options]
```

**Available Commands:**

#### Build Commands
```bash
./scripts/docker-utils.sh build              # Build all images
./scripts/docker-utils.sh build-frontend     # Build frontend
./scripts/docker-utils.sh build-db-service   # Build database service
./scripts/docker-utils.sh build-solar-service # Build solar service
```

#### Push Commands
```bash
./scripts/docker-utils.sh push               # Push all images
./scripts/docker-utils.sh push-frontend      # Push frontend
./scripts/docker-utils.sh push-db-service    # Push database service
./scripts/docker-utils.sh push-solar-service # Push solar service
```

#### Container Commands
```bash
./scripts/docker-utils.sh start              # Start containers
./scripts/docker-utils.sh stop               # Stop containers
./scripts/docker-utils.sh restart            # Restart containers
```

#### Logging Commands
```bash
./scripts/docker-utils.sh logs               # Show all logs
./scripts/docker-utils.sh logs-frontend      # Show frontend logs
./scripts/docker-utils.sh logs-db-service    # Show database logs
./scripts/docker-utils.sh logs-solar-service # Show solar service logs
./scripts/docker-utils.sh logs-postgres      # Show PostgreSQL logs
./scripts/docker-utils.sh logs-redis         # Show Redis logs
```

#### Maintenance Commands
```bash
./scripts/docker-utils.sh clean              # Remove all containers & images
./scripts/docker-utils.sh prune              # Prune Docker system
./scripts/docker-utils.sh status             # Show container status
./scripts/docker-utils.sh inspect [service]  # Inspect specific service
```

### 4. `k8s-utils.sh`
**Purpose:** Kubernetes utility commands for cluster operations and diagnostics

**Usage:**
```bash
./scripts/k8s-utils.sh [command] [options]
```

**Available Commands:**

#### Cluster Status
```bash
./scripts/k8s-utils.sh status [env]         # Cluster status
./scripts/k8s-utils.sh pods [env]           # List pods
./scripts/k8s-utils.sh services [env]       # List services
./scripts/k8s-utils.sh ingress [env]        # List ingress
./scripts/k8s-utils.sh events [env]         # Show events
```

#### Debugging
```bash
./scripts/k8s-utils.sh logs [env] [pod]     # Show pod logs
./scripts/k8s-utils.sh shell [env] [pod]    # Open pod shell
./scripts/k8s-utils.sh exec [env] [pod] cmd # Execute command in pod
./scripts/k8s-utils.sh describe [env] resource # Describe resource
```

#### Deployment Management
```bash
./scripts/k8s-utils.sh scale [env] [service] [n]    # Scale deployment
./scripts/k8s-utils.sh restart [env] [service]      # Restart deployment
./scripts/k8s-utils.sh rollback [env] [service]     # Rollback deployment
./scripts/k8s-utils.sh port-forward [env] [port]    # Port forward
./scripts/k8s-utils.sh get-url [env]                # Get service URLs
```

#### Cleanup
```bash
./scripts/k8s-utils.sh cleanup [env]        # Delete all resources
```

**Examples:**
```bash
# View staging pods
./scripts/k8s-utils.sh pods staging

# Check production logs
./scripts/k8s-utils.sh logs production frontend

# Scale frontend to 5 replicas
./scripts/k8s-utils.sh scale staging frontend 5

# Open shell in staging pod
./scripts/k8s-utils.sh shell staging frontend

# View service URLs
./scripts/k8s-utils.sh get-url production
```

---

## 🛠️ Common Workflows

### Local Development Setup
```bash
# 1. Setup local environment
./scripts/dev-setup-local.sh

# 2. Start frontend
cd frontend && npm run dev

# 3. Start backend (in new terminal)
cd middleware/netlify-db-service && npm start

# 4. View logs
./scripts/docker-utils.sh logs
```

### Build and Push Images
```bash
# Build all images
./scripts/docker-utils.sh build

# Push to registry
export DOCKER_REGISTRY=ghcr.io/myorg
./scripts/docker-utils.sh push

# Or build and push individual services
./scripts/docker-utils.sh build-frontend
./scripts/docker-utils.sh push-frontend
```

### Deploy to Staging
```bash
# Dry run first
DRY_RUN=true ./scripts/deploy-prod.sh staging latest

# Actual deployment
./scripts/deploy-prod.sh staging latest

# Check status
./scripts/k8s-utils.sh status staging
./scripts/k8s-utils.sh pods staging
```

### Deploy to Production
```bash
# Always do a dry run first
DRY_RUN=true ./scripts/deploy-prod.sh production v1.0.0

# Review the plan carefully
# Then deploy
./scripts/deploy-prod.sh production v1.0.0

# Monitor deployment
./scripts/k8s-utils.sh status production
./scripts/k8s-utils.sh logs production frontend
```

### Monitor Running Services
```bash
# Docker
./scripts/docker-utils.sh logs
./scripts/docker-utils.sh logs-frontend

# Kubernetes
./scripts/k8s-utils.sh logs staging frontend
./scripts/k8s-utils.sh logs production frontend
```

### Troubleshoot Issues
```bash
# Check container status
./scripts/docker-utils.sh status

# Get detailed info
./scripts/docker-utils.sh inspect apolaki-frontend

# Check Kubernetes cluster
./scripts/k8s-utils.sh events staging

# Get pod details
./scripts/k8s-utils.sh describe staging pod/apolaki-frontend-xxx

# Open shell in pod
./scripts/k8s-utils.sh shell staging frontend
```

---

## 🔐 Security Considerations

### Environment Variables
- Scripts read from environment variables for sensitive data
- Never hardcode credentials
- Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
- Load environment variables from `.env` files (git-ignored)

### Deployment Permissions
- Ensure proper AWS/Kubernetes credentials are configured
- Use role-based access control (RBAC) in Kubernetes
- Restrict deployment to authorized users only
- Enable audit logging for all deployments

### Docker Registry
- Authenticate with `docker login` before pushing
- Use private registries for sensitive images
- Scan images for vulnerabilities
- Keep base images updated

---

## 📊 Output Files

### Logs
- `logs/deployment_TIMESTAMP.log` - Deployment operation log
- `logs/deployment_report_TIMESTAMP.md` - Deployment summary report

### Backups (Production)
- `backups/apolaki-backup-TIMESTAMP.sql` - Database backup before deployment

---

## 🆘 Troubleshooting

### Docker Issues
```bash
# Check Docker daemon
docker ps

# Verify Docker Compose
docker-compose -f config/docker-compose.yml ps

# Clean and restart
./scripts/docker-utils.sh clean
./scripts/docker-utils.sh start
```

### Kubernetes Issues
```bash
# Check cluster connection
./scripts/k8s-utils.sh status

# View pod logs
./scripts/k8s-utils.sh logs staging frontend

# Describe pod for errors
./scripts/k8s-utils.sh describe staging pod/apolaki-frontend-xxx

# Check events
./scripts/k8s-utils.sh events staging
```

### Deployment Failures
```bash
# Check deployment logs
tail -f logs/deployment_*.log

# Rollback if needed
./scripts/k8s-utils.sh rollback production frontend

# Verify rollback
./scripts/k8s-utils.sh status production
```

---

## 📚 Related Documentation

- **Deployment Guide:** `DOCUMENTATION.md` § Deployment Architecture
- **Docker & Kubernetes:** See `DOCUMENTATION.md` for orchestration details
- **Setup Instructions:** `docs/SETUP_GUIDE.md`

---

**Last Updated:** February 26, 2026  
**Status:** ✅ Complete & Ready for Use
