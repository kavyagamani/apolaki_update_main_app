# 🚀 CI/CD Pipeline Guide

**Last Updated:** February 26, 2026  
**Status:** Production-Ready

## 📋 Table of Contents

1. [Overview](#overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Environment Setup](#environment-setup)
4. [Testing Pipeline](#testing-pipeline)
5. [Build & Deployment](#build--deployment)
6. [Monitoring & Rollback](#monitoring--rollback)

---

## Overview

The Apolaki Solar Platform uses GitHub Actions for continuous integration and deployment, ensuring code quality, automated testing, and reliable deployments.

### Pipeline Architecture

```text
┌──────────────────────────────────────────────────────┐
│              Code Push / PR                           │
└────────────────────┬─────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼──────┐       ┌─────▼──────┐
    │ Frontend   │       │ Backend    │
    │ Pipeline   │       │ Pipeline   │
    └─────┬──────┘       └─────┬──────┘
          │                     │
    ┌─────▼──────────────────────▼──────┐
    │  Docker Build & Push               │
    │  (Container Registry)              │
    └─────┬──────────────────────────────┘
          │
    ┌─────▼──────────────────────────────┐
    │  Staging Deployment                │
    │  (EKS / Kubernetes)                │
    └─────┬──────────────────────────────┘
          │
    ┌─────▼──────────────────────────────┐
    │  Production Deployment             │
    │  (Manual approval)                 │
    └─────┬──────────────────────────────┘
          │
    ┌─────▼──────────────────────────────┐
    │  Health Checks & Monitoring        │
    └──────────────────────────────────────┘
```

---

## GitHub Actions Workflows

### 1. Frontend CI Pipeline (`frontend-ci.yml`)

**Triggers:**
- Push to `main`, `develop`, `staging` branches
- Pull requests to `main`, `develop`, `staging`
- Only when frontend files change

**Jobs:**
- **Lint & Test**: ESLint, TypeScript, Unit Tests
- **Build**: Creates optimized production bundle
- **Security Scan**: NPM audit, dependency checks
- **Deploy Preview**: For pull requests (optional)
- **Deploy Production**: On main branch push

**View Logs:**

```bash
# Local - View recent workflow runs
gh workflow view frontend-ci.yml

# Check specific run
gh run view <run-id> --log

# Watch live
gh run watch <run-id>
```

### 2. Backend CI Pipeline (`backend-ci.yml`)

**Triggers:**
- Push to `main`, `develop`, `staging` branches
- Pull requests to `main`, `develop`, `staging`
- Only when backend/config files change

**Jobs:**
- **Backend Lint**: ESLint for Node.js services
- **Solar Service Lint**: Go fmt and go vet
- **Docker Builds**: Create images (no push on PR)
- **Database Validation**: SQL syntax and schema checks
- **Code Quality**: SonarCloud scan
- **Secret Scanning**: TruffleHog for credentials
- **Integration Tests**: Against real databases

**Database Testing:**

```bash
# Run locally with docker-compose
docker-compose -f config/docker-compose.yml up -d postgres redis

# Execute tests
./test-local.sh all --coverage
```

### 3. Docker Build Pipeline (`docker-build.yml`)

**Triggers:**
- Push to `main` or `staging` branches
- New tags (v*)
- Manual workflow_dispatch

**Services Built:**
- `apolaki-frontend` - Vue.js 3 web app
- `apolaki-db-service` - Node.js database microservice
- `apolaki-solar-service` - Go solar monitoring service

**Images Pushed To:**
- GitHub Container Registry (GHCR)
- Tags: `latest`, `branch-name`, `commit-sha`, `v*` (for releases)

**Push Images Manually:**

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Build images
docker build -t ghcr.io/your-org/apolaki-frontend:latest frontend/
docker build -t ghcr.io/your-org/apolaki-db-service:latest middleware/netlify-db-service/
docker build -t ghcr.io/your-org/apolaki-solar-service:latest middleware/solar-service/

# Push images
docker push ghcr.io/your-org/apolaki-frontend:latest
docker push ghcr.io/your-org/apolaki-db-service:latest
docker push ghcr.io/your-org/apolaki-solar-service:latest
```

### 4. Deployment Pipeline (`deploy.yml`)

**Triggers:**
- Push to `staging` branch (auto-deploy to staging)
- Push with tag `v*` on `main` (deploy to production)
- Manual workflow_dispatch with environment selection

**Staging Deployment:**
- Automatic on `staging` branch
- URL: `https://staging.apolaki-solar.com`
- Rollback on failure
- Slack notifications

**Production Deployment:**
- Requires version tag (e.g., `v1.0.0`)
- Manual approval in GitHub
- Automatic rollback on failure
- Sends alerts to Slack and PagerDuty

**Deploy Manually:**

```bash
# Trigger workflow dispatch
gh workflow run deploy.yml \
  -f environment=staging

# Check status
gh run list --workflow=deploy.yml
```

---

## Environment Setup

### Required Secrets

Add these to GitHub repository settings → Secrets:

#### AWS Credentials

```
AWS_ACCESS_KEY_ID          - IAM user access key
AWS_SECRET_ACCESS_KEY      - IAM user secret key
AWS_REGION                 - us-east-1 or your region
AWS_ACCESS_KEY_ID_PROD     - Production IAM credentials
AWS_SECRET_ACCESS_KEY_PROD - Production IAM secret
```

#### Kubernetes

```
STAGING_KUBECONFIG         - Base64 encoded kubeconfig for staging
PRODUCTION_KUBECONFIG      - Base64 encoded kubeconfig for production
```

#### Docker Registry

```
DOCKER_REGISTRY            - ghcr.io/your-org (optional)
```

#### Notifications

```
SLACK_WEBHOOK_URL          - Slack webhook for notifications
PAGERDUTY_ROUTING_KEY      - PagerDuty integration key
```

#### Third-Party Services

```
SONAR_TOKEN                - SonarCloud token
DATADOG_API_KEY            - Datadog monitoring
NEW_RELIC_LICENSE_KEY      - New Relic monitoring
```

### Adding Secrets

```bash
# Using GitHub CLI
gh secret set AWS_ACCESS_KEY_ID --body "your-key"
gh secret set AWS_SECRET_ACCESS_KEY --body "your-secret"

# List all secrets
gh secret list

# List secrets in organization
gh secret list --org your-org
```

---

## Testing Pipeline

### Unit Tests

**Frontend:**

```bash
# Run tests
npm run test

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test:watch

# Update snapshots
npm run test -- -u
```

**Backend:**

```bash
# Node.js tests
cd middleware/netlify-db-service
npm run test

# Go tests
cd middleware/solar-service
go test -v ./...
go test -v -cover ./...
```

### Integration Tests

```bash
# Start services
docker-compose -f config/docker-compose.yml up -d

# Run integration tests
npm run test:integration

# Test database connectivity
docker-compose exec postgres psql -U apolaki_user -d apolaki_db -c "SELECT 1;"

# Stop services
docker-compose -f config/docker-compose.yml down
```

### Performance Tests

```bash
# Load testing with k6
npm install -g k6

# Run load test
k6 run tests/performance/api-load-test.js

# With VUs (virtual users)
k6 run -u 100 -d 30s tests/performance/api-load-test.js
```

---

## Build & Deployment

### Build Artifacts

**Frontend:**
- Compiled Vue.js bundle (~500KB gzipped)
- Source maps for debugging
- Service worker for PWA

**Database Service:**
- Node.js compiled code
- Node modules (production only)
- Configuration files

**Solar Service:**
- Go binary (statically compiled)
- Configuration files

### Docker Image Layers

Each image is optimized with multi-stage builds:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (smaller)
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["npm", "start"]
```

### Kubernetes Deployment

**Helm Charts Structure:**

```text
helm/
├── frontend/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       └── hpa.yaml
├── db-service/
└── solar-service/
```

**Deploy Using Helm:**

```bash
# Staging
helm upgrade --install apolaki-frontend helm/frontend \
  --namespace staging \
  --values helm/values-staging.yaml \
  --set image.tag=v1.0.0

# Production
helm upgrade --install apolaki-frontend helm/frontend \
  --namespace production \
  --values helm/values-production.yaml \
  --set image.tag=v1.0.0 \
  --wait \
  --timeout 10m
```

---

## Monitoring & Rollback

### Pre-Deployment Checks

```bash
# Check image exists
docker pull ghcr.io/your-org/apolaki-frontend:v1.0.0

# Check registry credentials
aws ecr get-authorization-token

# Verify cluster connectivity
kubectl cluster-info
kubectl get nodes
```

### Post-Deployment Verification

```bash
# Check deployment status
kubectl rollout status deployment/apolaki-frontend -n production

# Check pods are healthy
kubectl get pods -n production
kubectl describe pod <pod-name> -n production

# Check service endpoints
kubectl get svc -n production
kubectl get ingress -n production

# Test endpoint
curl https://api.apolaki-solar.com/health
```

### Health Check Endpoints

All services expose health endpoints:

```bash
# Frontend health
curl http://frontend:3000/health

# Database service health
curl http://db-service:3001/health

# Solar service health
curl http://solar-service:8080/health
```

### Automatic Rollback

Rollback is triggered if:
1. Deployment doesn't reach `Ready` state within 10 minutes
2. Health checks fail
3. Error rate exceeds 5% for 5 minutes
4. Manual rollback triggered via workflow

**Manual Rollback:**

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/apolaki-frontend -n production

# Rollback to specific revision
kubectl rollout undo deployment/apolaki-frontend -n production --to-revision=3

# View rollout history
kubectl rollout history deployment/apolaki-frontend -n production
```

### Monitoring Deployments

```bash
# Watch deployment progress
kubectl rollout status deployment/apolaki-frontend -n production -w

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

# Monitor resource usage
kubectl top nodes
kubectl top pods -n production

# Check logs after deployment
kubectl logs -f deployment/apolaki-frontend -n production
```

---

## Troubleshooting CI/CD

### Workflow Failures

**Check logs:**

```bash
# List recent runs
gh run list --workflow=frontend-ci.yml --limit=10

# View specific run
gh run view <run-id> --log

# Download logs
gh run download <run-id>
```

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Test failures | Check test logs, fix code, push new commit |
| Build timeout | Increase timeout, optimize build steps |
| Secret not found | Verify secret name matches workflow reference |
| Deployment fails | Check kubeconfig, cluster connectivity |
| Image push fails | Verify registry credentials, image size |

### Retry Policies

```bash
# Re-run failed workflow
gh run rerun <run-id>

# Re-run specific jobs
gh run rerun <run-id> --failed
```

---

## Best Practices

### Code Quality

- ✅ Write unit tests for new code (>80% coverage)
- ✅ Use ESLint/Prettier for code style
- ✅ Run type checking before commit
- ✅ Use pre-commit hooks

### Deployment Safety

- ✅ Test changes in staging first
- ✅ Use semantic versioning for releases
- ✅ Maintain rollback capacity
- ✅ Monitor for 15 minutes post-deployment

### Secrets Management

- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate credentials regularly
- ✅ Use least-privilege IAM policies

### Documentation

- ✅ Document deployment procedures
- ✅ Keep runbooks updated
- ✅ Document rollback procedures
- ✅ Track deployment changes

---

## Advanced Configuration

### Matrix Builds

Test against multiple Node versions:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

### Conditional Steps

Deploy only on main branch:

```yaml
if: github.ref == 'refs/heads/main'
```

### Scheduled Jobs

Run nightly tests:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
```

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Kubernetes Deployment Guide](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Helm Documentation](https://helm.sh/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
