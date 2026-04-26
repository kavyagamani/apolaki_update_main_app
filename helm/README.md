# 🚀 Apolaki Solar Platform - Helm Charts

Production-grade Kubernetes Helm charts for deploying the Apolaki Solar Platform.

## 📋 Overview

This directory contains Helm charts for deploying all Apolaki services to Kubernetes:

- **Frontend** - Vue.js 3 web application
- **Database Service** - Node.js microservice for data management
- **Solar Service** - Go microservice for solar monitoring

## 📁 Directory Structure

```
helm/
├── frontend/                # Frontend Helm chart
│   ├── Chart.yaml           # Chart metadata
│   ├── values.yaml          # Default values
│   └── templates/           # K8s templates
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── _helpers.tpl
│       └── ...
│
├── db-service/              # Database service chart
│   └── (similar structure)
│
├── solar-service/           # Solar service chart
│   └── (similar structure)
│
├── values-dev.yaml          # Development environment values
├── values-staging.yaml      # Staging environment values
└── values-production.yaml   # Production environment values
```

## 🚀 Quick Start

### Prerequisites
- Kubernetes 1.22+
- Helm 3.0+
- kubectl configured to access your cluster

### Install Charts

**Development Environment:**
```bash
helm install apolaki-frontend ./frontend \
  --namespace development \
  --create-namespace \
  --values ./values-dev.yaml
```

**Staging Environment:**
```bash
helm install apolaki-frontend ./frontend \
  --namespace staging \
  --create-namespace \
  --values ./values-staging.yaml
```

**Production Environment:**
```bash
helm install apolaki-frontend ./frontend \
  --namespace production \
  --create-namespace \
  --values ./values-production.yaml \
  --set image.tag=v1.0.0
```

### Upgrade Charts

```bash
helm upgrade apolaki-frontend ./frontend \
  --namespace production \
  --values ./values-production.yaml \
  --set image.tag=v1.0.1
```

### Uninstall Charts

```bash
helm uninstall apolaki-frontend --namespace production
```

## 📊 Values Files

### Development (`values-dev.yaml`)
- Single replica
- ClusterIP service
- No ingress
- Development resource limits
- Debug logging
- Database persistence disabled

### Staging (`values-staging.yaml`)
- 2 replicas
- LoadBalancer service
- Ingress enabled
- Moderate resource limits
- Info-level logging
- Database persistence enabled
- Auto-scaling configured
- PostgreSQL and Redis enabled

### Production (`values-production.yaml`)
- 3+ replicas
- LoadBalancer service
- Ingress with TLS
- High resource limits
- Warn-level logging
- Database persistence with large storage
- Aggressive auto-scaling
- Pod anti-affinity
- Backup and monitoring enabled

## 🔧 Configuration

### Override Values

```bash
# Override in command line
helm install apolaki-frontend ./frontend \
  --set replicaCount=5 \
  --set image.tag=v1.0.0 \
  --set ingress.hosts[0].host=custom-domain.com

# Override with custom values file
helm install apolaki-frontend ./frontend \
  --values ./my-values.yaml
```

### Image Configuration

```yaml
image:
  repository: ghcr.io/apolaki/apolaki-frontend
  tag: v1.0.0
  pullPolicy: IfNotPresent
```

### Scaling

```yaml
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

### Ingress Configuration

```yaml
ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: apolaki-solar.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: apolaki-tls
      hosts:
        - apolaki-solar.com
```

### Database Configuration

```yaml
postgresql:
  enabled: true
  auth:
    username: apolaki
    password: secure_password
  primary:
    persistence:
      enabled: true
      size: 100Gi
```

## 🔐 Security

### Best Practices Implemented

- ✅ Non-root user containers
- ✅ Read-only root filesystem
- ✅ Security context for pod hardening
- ✅ Resource limits and requests
- ✅ Health checks (liveness & readiness probes)
- ✅ Pod disruption budgets (in production)
- ✅ Network policies ready
- ✅ Pod anti-affinity for high availability

### Secret Management

Store sensitive data in Kubernetes secrets:

```bash
# Create secret
kubectl create secret generic apolaki-secrets \
  --from-literal=db-password=secure_password \
  --from-literal=api-key=your-api-key \
  -n production

# Reference in values
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: apolaki-secrets
        key: db-password
```

## 📈 Monitoring & Logging

### Health Checks

All charts include:
- **Liveness Probe** - Restarts unhealthy pods
- **Readiness Probe** - Removes unhealthy pods from load balancing

### Resource Limits

Production configuration includes:
- CPU limits: 2000m (2 cores)
- Memory limits: 2Gi
- Guaranteed minimum resources

### Auto-scaling

Production auto-scaling:
- Minimum 3 replicas
- Maximum 10 replicas
- Scales on 70% CPU or 80% memory

## 🔄 Continuous Deployment

### GitHub Actions Integration

Charts are automatically deployed via GitHub Actions:

```yaml
# In .github/workflows/deploy.yml
helm upgrade --install apolaki-frontend ./helm/frontend \
  --namespace production \
  --values ./helm/values-production.yaml \
  --set image.tag=${{ github.ref_name }}
```

## 📝 Common Operations

### View Deployment Status

```bash
# List all releases
helm list -n production

# Get release details
helm get values apolaki-frontend -n production

# Get release history
helm history apolaki-frontend -n production
```

### Rollback Deployment

```bash
# Rollback to previous version
helm rollback apolaki-frontend -n production

# Rollback to specific revision
helm rollback apolaki-frontend 3 -n production
```

### Debug Deployment

```bash
# Dry run installation
helm install apolaki-frontend ./frontend \
  --namespace production \
  --values ./values-production.yaml \
  --dry-run --debug

# Lint charts
helm lint ./frontend

# Template charts
helm template apolaki-frontend ./frontend \
  --values ./values-production.yaml
```

## 🚨 Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n production

# View pod logs
kubectl logs -f deployment/apolaki-frontend -n production

# Describe pod for events
kubectl describe pod <pod-name> -n production
```

### Ingress Not Working

```bash
# Check ingress
kubectl get ingress -n production

# Describe ingress
kubectl describe ingress apolaki-frontend -n production

# Check ingress controller
kubectl get pods -n ingress-nginx
```

### Helm Deployment Failed

```bash
# Check helm status
helm status apolaki-frontend -n production

# Get release history
helm history apolaki-frontend -n production

# Check deployment events
kubectl get events -n production --sort-by='.lastTimestamp'
```

## 📚 References

- **Helm Documentation:** https://helm.sh/docs/
- **Kubernetes Documentation:** https://kubernetes.io/docs/
- **Ingress-Nginx:** https://kubernetes.github.io/ingress-nginx/
- **Cert-Manager:** https://cert-manager.io/docs/

## 🔗 Related Files

- **Deployment Script:** `scripts/deploy-prod.sh`
- **Kubernetes Utils:** `scripts/k8s-utils.sh`
- **Deployment Workflow:** `.github/workflows/deploy.yml`
- **Deployment Guide:** `DOCUMENTATION.md` § Deployment Architecture
- **Helm Guidance:** See `DOCUMENTATION.md` § Kubernetes Deployment

---

**Last Updated:** February 26, 2026  
**Status:** ✅ Production Ready
