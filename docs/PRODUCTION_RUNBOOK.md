# 📋 Production Runbook

**Last Updated:** February 26, 2026  
**Severity Levels:** SEV1 (Critical), SEV2 (High), SEV3 (Medium), SEV4 (Low)

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Common Tasks](#common-tasks)
3. [Emergency Procedures](#emergency-procedures)
4. [Incident Response](#incident-response)
5. [Contact Information](#contact-information)

---

## Quick Reference

### Critical Endpoints

| Service | URL | Port |
|---------|-----|------|
| Frontend | https://apolaki-solar.com | 443 |
| API Gateway | https://api.apolaki-solar.com | 443 |
| DB Service | db-service.production.svc.cluster.local | 3001 |
| Solar Service | solar-service.production.svc.cluster.local | 8080 |
| RabbitMQ Admin | https://rabbitmq.apolaki-solar.com | 15672 |
| Kibana Logs | https://kibana.apolaki-solar.com | 443 |
| Grafana Metrics | https://grafana.apolaki-solar.com | 443 |

### Key Credentials

Access credentials are stored in:
- AWS Secrets Manager: `/apolaki/production/`
- GitHub Secrets: Settings → Secrets → Actions
- Kubernetes Secrets: `kubectl get secrets -n production`

### Commands Cheat Sheet

```bash
# Check cluster health
kubectl cluster-info
kubectl get nodes
kubectl get pods -n production

# Get service status
kubectl get svc -n production
kubectl get ingress -n production

# View logs
kubectl logs -f deployment/apolaki-frontend -n production

# Port forward for debugging
kubectl port-forward svc/apolaki-db-service 5432:5432 -n production

# Execute command in pod
kubectl exec -it <pod-name> -n production -- /bin/bash

# Describe resource
kubectl describe pod <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'
```

---

## Common Tasks

### Task 1: Check Application Health

**Estimated Time:** 2 minutes

```bash
#!/bin/bash
# Check all services health

echo "Checking frontend..."
curl -s https://apolaki-solar.com/health | jq .

echo "Checking API..."
curl -s https://api.apolaki-solar.com/health | jq .

echo "Checking database service..."
kubectl exec -n production \
  $(kubectl get pod -n production -l app=db-service -o jsonpath='{.items[0].metadata.name}') \
  -- curl -s localhost:3001/health

echo "Checking Kubernetes cluster..."
kubectl get nodes
kubectl get pods -n production
```

**Success Indicators:**
- All pods showing `Running` status
- HTTP 200 responses from health endpoints
- No `CrashLoopBackOff` or `Pending` states

### Task 2: View Recent Logs

**Estimated Time:** 3 minutes

```bash
#!/bin/bash
# View logs from last 100 lines

SERVICE=${1:-frontend}  # default: frontend

echo "Fetching logs for $SERVICE..."

case $SERVICE in
  frontend)
    kubectl logs -n production -l app=apolaki-frontend --tail=100
    ;;
  db)
    kubectl logs -n production -l app=apolaki-db-service --tail=100
    ;;
  solar)
    kubectl logs -n production -l app=apolaki-solar-service --tail=100
    ;;
  all)
    kubectl logs -n production --all-containers=true --tail=50
    ;;
esac
```

### Task 3: Scale Service

**Estimated Time:** 2 minutes

```bash
#!/bin/bash
# Scale a service to N replicas

SERVICE=$1
REPLICAS=$2

if [ -z "$SERVICE" ] || [ -z "$REPLICAS" ]; then
  echo "Usage: $0 <service> <replicas>"
  echo "Example: $0 apolaki-frontend 3"
  exit 1
fi

echo "Scaling $SERVICE to $REPLICAS replicas..."

kubectl scale deployment/$SERVICE \
  --replicas=$REPLICAS \
  -n production

echo "Waiting for rollout..."
kubectl rollout status deployment/$SERVICE -n production
```

### Task 4: View Database

**Estimated Time:** 5 minutes

```bash
# Port forward database
kubectl port-forward svc/postgres 5432:5432 -n production &

# Connect with psql
psql -h localhost -U apolaki_user -d apolaki_db

# Useful queries
SELECT version();  -- Check version
\dt                -- List tables
SELECT * FROM pg_stat_activity;  -- Check active connections
SELECT * FROM solar.installations;  -- View installations
```

### Task 5: Restart Service

**Estimated Time:** 5 minutes

```bash
#!/bin/bash
SERVICE=$1

if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <service>"
  exit 1
fi

echo "Restarting $SERVICE..."

kubectl rollout restart deployment/$SERVICE -n production

echo "Waiting for restart..."
kubectl rollout status deployment/$SERVICE -n production

echo "✓ Restart complete"
```

### Task 6: Update Environment Variables

**Estimated Time:** 10 minutes

```bash
#!/bin/bash
# Update secret and restart deployment

# Edit secret
kubectl edit secret apolaki-secrets -n production

# Verify update
kubectl get secret apolaki-secrets -n production -o yaml

# Restart deployment to apply changes
kubectl rollout restart deployment/apolaki-frontend -n production
kubectl rollout restart deployment/apolaki-db-service -n production
kubectl rollout restart deployment/apolaki-solar-service -n production

# Verify
kubectl rollout status deployment/apolaki-frontend -n production
```

---

## Emergency Procedures

### SEV1: Application Completely Down

**Response Time:** < 5 minutes

```bash
#!/bin/bash
# Emergency health check and recovery

echo "🚨 CRITICAL: Application down - initiating recovery"

# 1. Check cluster status
echo "Step 1: Checking cluster..."
kubectl cluster-info
kubectl get nodes

# 2. Check all pods
echo "Step 2: Checking pods..."
kubectl get pods -n production -o wide
kubectl get pods -n production --field-selector=status.phase!=Running

# 3. Check recent events
echo "Step 3: Checking events..."
kubectl get events -n production --sort-by='.lastTimestamp' | tail -20

# 4. Check service endpoints
echo "Step 4: Checking services..."
kubectl get endpoints -n production

# 5. Attempt restart
echo "Step 5: Attempting restart..."
kubectl rollout restart deployment/apolaki-frontend -n production
kubectl rollout restart deployment/apolaki-db-service -n production
kubectl rollout restart deployment/apolaki-solar-service -n production

# 6. Monitor recovery
echo "Step 6: Monitoring recovery..."
kubectl rollout status deployment/apolaki-frontend -n production --timeout=5m

# 7. Verify health
echo "Step 7: Verifying health..."
curl -s https://apolaki-solar.com/health

echo "✓ Recovery procedures initiated"
```

**Escalation Path:**
1. Page on-call engineer
2. Open incident in PagerDuty (SEV1)
3. Notify stakeholders in #incidents Slack channel
4. Document timeline in incident report

### SEV2: High Error Rate (>5%)

**Response Time:** < 15 minutes

```bash
#!/bin/bash
# Investigate high error rate

echo "⚠️  HIGH ERROR RATE DETECTED"

# Check which service has errors
echo "Checking frontend errors..."
kubectl logs -n production -l app=apolaki-frontend \
  --timestamps=true | grep -i error | tail -20

echo "Checking db-service errors..."
kubectl logs -n production -l app=apolaki-db-service \
  --timestamps=true | grep -i error | tail -20

echo "Checking solar-service errors..."
kubectl logs -n production -l app=apolaki-solar-service \
  --timestamps=true | grep -i error | tail -20

# Check resource constraints
echo "Checking resources..."
kubectl top pods -n production
kubectl describe nodes

# Check database connections
echo "Checking database..."
kubectl exec -n production \
  $(kubectl get pod -n production -l app=postgres -o jsonpath='{.items[0].metadata.name}') \
  -- psql -U apolaki_user -c \
  "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Consider scaling if resource-constrained
echo "Consider scaling if high CPU/memory usage detected"
```

**Actions:**
- [ ] Identify error source
- [ ] Check recent deployments
- [ ] Review metric dashboards
- [ ] Consider rollback if recent change
- [ ] Scale services if resource-constrained

### SEV3: Database Connection Errors

**Response Time:** < 30 minutes

```bash
#!/bin/bash
# Troubleshoot database issues

echo "🔧 DATABASE ISSUE DETECTED"

# Check database pod
kubectl get pod -n production -l app=postgres
kubectl logs -n production -l app=postgres --tail=100

# Check connections
kubectl exec -n production \
  $(kubectl get pod -n production -l app=postgres -o jsonpath='{.items[0].metadata.name}') \
  -- psql -U apolaki_user -c \
  "SELECT pid, usename, application_name, state FROM pg_stat_activity;"

# Check disk space
kubectl exec -n production \
  $(kubectl get pod -n production -l app=postgres -o jsonpath='{.items[0].metadata.name}') \
  -- df -h /var/lib/postgresql/data

# Restart database if needed
echo "If necessary, restart database service..."
kubectl delete pod -n production -l app=postgres

# Monitor recovery
kubectl wait --for=condition=Ready pod \
  -l app=postgres -n production --timeout=300s
```

---

## Incident Response

### Incident Severity Classification

| Level | Impact | Response Time | Example |
|-------|--------|----------------|---------|
| SEV1 | Critical | <5 min | App fully down |
| SEV2 | High | <15 min | >5% error rate |
| SEV3 | Medium | <1 hour | Performance degradation |
| SEV4 | Low | <4 hours | Minor issues |

### Incident Timeline Template

```markdown
## Incident Report: [Date] - [Service]

**Severity:** SEV[1-4]  
**Duration:** HH:MM UTC  
**Affected Users:** [Number]

### Timeline

- **HH:MM** - Alert triggered
- **HH:MM** - On-call engineer acknowledged
- **HH:MM** - Root cause identified
- **HH:MM** - Mitigation started
- **HH:MM** - Service restored
- **HH:MM** - All-clear given

### Root Cause

[Detailed explanation]

### Actions Taken

1. [Action 1]
2. [Action 2]
3. [Action 3]

### Prevention

[Steps to prevent recurrence]

### Follow-up

- [ ] RCA complete
- [ ] Post-mortem scheduled
- [ ] Tickets created
```

### Post-Incident Actions

```bash
# 1. Save logs for analysis
kubectl logs -n production --all-containers=true > incident-logs.txt

# 2. Capture metrics snapshot
kubectl top pods -n production > metrics-snapshot.txt
kubectl describe nodes > nodes-snapshot.txt

# 3. Create incident ticket
# Link to GitHub issue or Jira

# 4. Schedule post-mortem
# Send calendar invites to team

# 5. Update runbook based on learnings
# Document any new procedures needed
```

---

## Contact Information

### On-Call Rotation

**Current On-Call:** [Name]  
**Backup:** [Name]

[Link to on-call schedule]

### Escalation

| Level | Contact | Method |
|-------|---------|--------|
| Level 1 | On-call Engineer | PagerDuty + Slack |
| Level 2 | Tech Lead | Phone number |
| Level 3 | Manager | Phone number |
| Level 4 | CTO | Phone number |

### Important Links

- **PagerDuty:** [link]
- **GitHub Actions:** [link]
- **Grafana Dashboards:** [link]
- **Kibana Logs:** [link]
- **AWS Console:** [link]
- **Kubernetes Dashboard:** [link]
- **Slack #incidents:** [link]

### Communication Channels

- **#incidents** - Incident notifications
- **#deployments** - Deployment updates
- **#alerts** - Automated alerts
- **#devops** - DevOps discussions

---

## Appendix: Recovery Procedures

### Full System Recovery

```bash
# 1. Backup current state
kubectl get all -n production -o yaml > backup-$(date +%s).yaml

# 2. Restart all services
kubectl rollout restart deployment -n production

# 3. Wait for stability
sleep 30

# 4. Verify all services
kubectl get pods -n production

# 5. Check health endpoints
for service in frontend db-service solar-service; do
  echo "Checking $service..."
  kubectl port-forward svc/$service 8080:80 -n production &
  sleep 2
  curl -s http://localhost:8080/health
  pkill -f "port-forward"
done
```

### Database Backup & Restore

```bash
# Backup database
kubectl exec -n production postgres-pod -- \
  pg_dump -U apolaki_user -d apolaki_db | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore database
gunzip < backup-20260226.sql.gz | \
  kubectl exec -n production postgres-pod -i -- \
  psql -U apolaki_user -d apolaki_db
```

### Rollback to Previous Version

```bash
# View deployment history
kubectl rollout history deployment/apolaki-frontend -n production

# Rollback to previous version
kubectl rollout undo deployment/apolaki-frontend -n production

# Rollback to specific revision
kubectl rollout undo deployment/apolaki-frontend -n production --to-revision=5

# Verify rollback
kubectl rollout status deployment/apolaki-frontend -n production
```

---

**Last Updated:** February 26, 2026  
**Next Review:** [Date + 3 months]
