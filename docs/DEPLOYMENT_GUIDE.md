# Deployment Guide

Complete guide for deploying Apolaki Solar Platform to staging and production environments.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Overview](#deployment-overview)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Build & Push Images](#build--push-images)
5. [Deploy to Staging](#deploy-to-staging)
6. [Deploy to Production](#deploy-to-production)
7. [Monitoring & Health Checks](#monitoring--health-checks)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Before Staging

- [ ] Code reviewed and merged to `develop` branch
- [ ] All tests passing: `npm run test`
- [ ] Linting clean: `npm run lint`
- [ ] Environment variables configured
- [ ] Database schema updated (if applicable)
- [ ] Git tag created: `git tag v1.0.0-rc1`
- [ ] Version updated in `package.json`

### Before Production

- [ ] Staging deployment tested and verified
- [ ] All features working on staging
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Stakeholders notified
- [ ] Maintenance window scheduled (if needed)
- [ ] Monitoring alerts configured
- [ ] Git tag created: `git tag v1.0.0`
- [ ] Release notes written

---

## Deployment Overview

### Architecture

```
Local Machine
     ↓
Build Docker Images
     ↓
Push to Registry (ghcr.io)
     ↓
Pull in Kubernetes Cluster
     ↓
Deploy via Helm Charts
     ↓
Run Health Checks
     ↓
Monitor & Log
```

### Environments

| Environment | Purpose | Replicas | Auto-scale |
|-------------|---------|----------|-----------|
| Development | Local testing | 1 | No |
| Staging | Pre-production testing | 2 | 2-5 |
| Production | Live application | 3+ | 3-10 |

### Tools Used

- **Docker**: Container images
- **Kubernetes**: Orchestration
- **Helm**: Package management
- **GitHub Actions**: CI/CD automation
- **kubectl**: Cluster management

---

## Infrastructure Setup

### Prerequisites

- Kubernetes cluster running
- kubectl configured with cluster access
- Helm 3 installed
- Docker registry configured (ghcr.io, DockerHub, etc.)
- PostgreSQL database accessible

### Setup Kubernetes Namespaces

```bash
# Create namespaces for each environment
kubectl create namespace staging
kubectl create namespace production

# Verify
kubectl get namespaces
```

### Setup Registry Credentials

For private registries:

```bash
# Create docker registry secret
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=your-username \
  --docker-password=your-token \
  --docker-email=your-email@example.com \
  -n staging

kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=your-username \
  --docker-password=your-token \
  --docker-email=your-email@example.com \
  -n production
```

### Configure Persistent Storage

For databases and logs:

```bash
# Create storage class (if needed)
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
EOF
```

---

## Build & Push Images

### Build Docker Images

```bash
# Build all images
./scripts/docker-utils.sh build

# Or build individually
docker build -t apolaki-frontend:latest frontend/
docker build -t apolaki-db-service:latest middleware/netlify-db-service/
docker build -t apolaki-solar-service:latest middleware/solar-service/
```

### Tag Images

```bash
export DOCKER_REGISTRY=ghcr.io/yourusername
export VERSION=v1.0.0

# Tag for registry
docker tag apolaki-frontend:latest $DOCKER_REGISTRY/apolaki-frontend:$VERSION
docker tag apolaki-db-service:latest $DOCKER_REGISTRY/apolaki-db-service:$VERSION
docker tag apolaki-solar-service:latest $DOCKER_REGISTRY/apolaki-solar-service:$VERSION
```

### Push to Registry

```bash
# Login to registry
docker login ghcr.io

# Push images
./scripts/docker-utils.sh push

# Or manually:
docker push $DOCKER_REGISTRY/apolaki-frontend:$VERSION
docker push $DOCKER_REGISTRY/apolaki-db-service:$VERSION
docker push $DOCKER_REGISTRY/apolaki-solar-service:$VERSION

# Verify
docker images | grep apolaki
```

---

## Deploy to Staging

### Using Automation Script

```bash
# Dry run (recommended first)
DRY_RUN=true ./scripts/deploy-prod.sh staging latest

# Actual deployment
./scripts/deploy-prod.sh staging latest
```

### Manual Helm Deployment

```bash
# Add Helm repository (if using external repo)
helm repo add apolaki https://charts.apolaki.com
helm repo update

# Deploy frontend
helm upgrade --install apolaki-frontend ./helm/frontend \
  -n staging \
  -f helm/values-staging.yaml \
  --set image.tag=latest

# Deploy database service
helm upgrade --install apolaki-db-service ./helm/db-service \
  -n staging \
  -f helm/values-staging.yaml \
  --set image.tag=latest

# Deploy solar service
helm upgrade --install apolaki-solar-service ./helm/solar-service \
  -n staging \
  -f helm/values-staging.yaml \
  --set image.tag=latest
```

### Verify Staging Deployment

```bash
# Check pod status
kubectl get pods -n staging

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=apolaki-frontend -n staging --timeout=300s

# Check services
kubectl get svc -n staging

# Check logs
kubectl logs -n staging -l app=apolaki-frontend --tail=100
```

### Test Staging Environment

```bash
# Port forward to test
kubectl port-forward -n staging svc/apolaki-frontend 5173:80 &
kubectl port-forward -n staging svc/apolaki-db-service 3000:3000 &

# Test endpoints
curl http://localhost:5173       # Frontend
curl http://localhost:3000/health  # Backend health check

# Run smoke tests
npm run test:integration -- --url=http://localhost:5173
```

---

## Deploy to Production

### Pre-Production Steps

```bash
# Create backup of production database
kubectl exec -n production postgres-pod \
  -- pg_dump -U apolaki_user apolaki > backup-$(date +%Y%m%d).sql

# Verify backup
ls -lh backup-*.sql
```

### Production Deployment

```bash
# ALWAYS do dry-run first
DRY_RUN=true ./scripts/deploy-prod.sh production v1.0.0

# Review output carefully, then deploy
./scripts/deploy-prod.sh production v1.0.0

# Monitor deployment progress
./scripts/k8s-utils.sh status production
watch kubectl get pods -n production
```

### Manual Production Deployment

```bash
# Update values for production
helm upgrade --install apolaki-frontend ./helm/frontend \
  -n production \
  -f helm/values-production.yaml \
  --set image.tag=v1.0.0 \
  --wait

# Monitor rollout
kubectl rollout status deployment/apolaki-frontend -n production
```

### Post-Deployment Verification

```bash
# Check all pods are running
kubectl get pods -n production

# Verify services
kubectl get svc -n production

# Test endpoints
kubectl port-forward -n production svc/apolaki-frontend 5173:80 &
curl http://localhost:5173

# Check logs for errors
kubectl logs -n production deployment/apolaki-frontend --all-containers=true

# Verify database connectivity
kubectl logs -n production deployment/apolaki-db-service | grep "connected"

# Run health checks
./scripts/k8s-utils.sh health production
```

---

## Monitoring & Health Checks

### Health Check Endpoints

```bash
# Frontend health
curl http://production-url/health

# Backend API health
curl http://api.production-url/health

# Database health
curl http://api.production-url/db/health
```

### View Logs

```bash
# Frontend logs
kubectl logs -n production deployment/apolaki-frontend

# Backend logs
kubectl logs -n production deployment/apolaki-db-service

# Solar service logs
kubectl logs -n production deployment/apolaki-solar-service

# Follow logs in real-time
kubectl logs -f -n production deployment/apolaki-frontend

# View logs from last hour
kubectl logs -n production deployment/apolaki-db-service --since=1h
```

### Monitor Resources

```bash
# CPU and Memory usage
kubectl top pods -n production
kubectl top nodes

# Pod events
kubectl describe pod <pod-name> -n production

# Deployment status
kubectl describe deployment apolaki-frontend -n production
```

### Alerts & Notifications

Production deployments send notifications to Slack:

```bash
# Set webhook URL
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
./scripts/deploy-prod.sh production v1.0.0
```

---

## Troubleshooting

### Pods Not Starting

**Symptoms**: `CrashLoopBackOff`, `ImagePullBackOff`

**Solutions**:

```bash
# Check pod status
kubectl describe pod <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n production --previous

# Common fixes:
# 1. Verify image exists in registry
docker pull ghcr.io/yourusername/apolaki-frontend:v1.0.0

# 2. Check resource requests/limits
kubectl describe pod <pod-name> -n production | grep -A 5 "Limits\|Requests"

# 3. Verify environment variables
kubectl get pod <pod-name> -n production -o yaml | grep -A 20 "env:"
```

### Service Not Accessible

**Symptoms**: Connection timeout, refused

**Solutions**:

```bash
# Check service exists
kubectl get svc -n production

# Check service endpoints
kubectl get endpoints -n production

# Check ingress configuration
kubectl get ingress -n production

# Port forward to test
kubectl port-forward svc/apolaki-frontend 5173:80 -n production

# Check network policies
kubectl get networkpolicies -n production
```

### Database Connection Issues

**Symptoms**: `Connection refused`, `Authentication failed`

**Solutions**:

```bash
# Verify database pod is running
kubectl get pods -n production | grep postgres

# Check database service
kubectl get svc -n production | grep database

# Test connection from pod
kubectl exec -it <db-pod> -n production -- psql -U apolaki_user -d apolaki -c "SELECT 1"

# Check connection string in deployment
kubectl get deployment apolaki-db-service -n production -o yaml | grep DATABASE_URL
```

### High Memory/CPU Usage

**Symptoms**: Pod throttled, slow responses

**Solutions**:

```bash
# Check current usage
kubectl top pod <pod-name> -n production

# Check limits
kubectl describe pod <pod-name> -n production | grep -A 5 "Limits"

# Increase limits if needed
kubectl set resources deployment apolaki-frontend \
  -n production \
  --limits=cpu=500m,memory=512Mi \
  --requests=cpu=250m,memory=256Mi

# Check for memory leaks
kubectl logs <pod-name> -n production | grep -i "memory\|heap"
```

### Deployment Stuck

**Symptoms**: Pending, not rolling out

**Solutions**:

```bash
# Check rollout status
kubectl rollout status deployment/apolaki-frontend -n production

# Check pod events
kubectl describe pod <pod-name> -n production

# Force delete pod if stuck
kubectl delete pod <pod-name> -n production --force --grace-period=0

# Scale deployment if needed
kubectl scale deployment apolaki-frontend --replicas=3 -n production
```

---

## Rollback Procedures

### Immediate Rollback

If deployment has critical issues:

```bash
# Rollback to previous version
kubectl rollout undo deployment/apolaki-frontend -n production

# Verify rollback
kubectl rollout status deployment/apolaki-frontend -n production

# Check logs
kubectl logs -n production deployment/apolaki-frontend --tail=50
```

### Rollback via Helm

```bash
# List releases
helm history apolaki-frontend -n production

# Rollback to previous release
helm rollback apolaki-frontend -n production

# Rollback to specific revision
helm rollback apolaki-frontend 3 -n production  # revision 3
```

### Rollback Database

If schema changes caused issues:

```bash
# Restore from backup (if applicable)
kubectl exec -i <db-pod> -n production \
  -- psql -U apolaki_user -d apolaki < backup-20260226.sql

# Verify restoration
kubectl exec -it <db-pod> -n production \
  -- psql -U apolaki_user -d apolaki -c "SELECT COUNT(*) FROM users"
```

---

## Deployment Commands Reference

```bash
# Building
./scripts/docker-utils.sh build      # Build all images
./scripts/docker-utils.sh push       # Push to registry

# Deploying
./scripts/deploy-prod.sh staging latest       # Deploy to staging
./scripts/deploy-prod.sh production v1.0.0   # Deploy to production
DRY_RUN=true ./scripts/deploy-prod.sh production v1.0.0  # Dry run

# Monitoring
./scripts/k8s-utils.sh status production      # Check deployment status
./scripts/k8s-utils.sh logs production        # View logs
./scripts/k8s-utils.sh pods production        # List pods
./scripts/k8s-utils.sh health production      # Health checks

# Management
kubectl get pods -n production
kubectl logs -f deployment/apolaki-frontend -n production
kubectl exec -it <pod> -n production -- /bin/bash
```

---

## CI/CD Automation

The project includes GitHub Actions workflows for automated testing and deployment:

### Workflows

1. **frontend-ci.yml**: Frontend testing on every push
2. **backend-ci.yml**: Backend testing on every push
3. **docker-build.yml**: Docker image building on tag
4. **deploy.yml**: Automated deployment on release

### Manual Triggers

```bash
# Trigger frontend CI
git push origin feature/my-feature

# Trigger docker build
git tag v1.0.0
git push origin v1.0.0

# Trigger deployment
# (In GitHub UI: Actions > deploy.yml > Run workflow)
```

---

## Best Practices

### Before Deployment

- Always run dry-run first
- Backup database before production deployment
- Test on staging first
- Verify all environment variables
- Review deployment logs
- Have rollback plan ready

### During Deployment

- Monitor logs continuously
- Watch metrics (CPU, memory, network)
- Have team on standby
- Document any issues
- Keep team informed via Slack

### After Deployment

- Run health checks
- Verify all endpoints working
- Check logs for errors
- Monitor for 30 minutes
- Update deployment status

### General Tips

- Use semantic versioning (v1.0.0)
- Tag all production releases
- Keep deployment history
- Document all manual interventions
- Test rollback procedures
- Review logs regularly

---

**Last Updated**: February 26, 2026  
**Version**: 1.0.0
