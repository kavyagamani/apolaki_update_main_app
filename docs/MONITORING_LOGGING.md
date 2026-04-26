# 📊 Monitoring & Logging Guide

**Last Updated:** February 26, 2026  
**Status:** Production-Ready

## 📋 Table of Contents

1. [Overview](#overview)
2. [Local Monitoring](#local-monitoring)
3. [Production Monitoring](#production-monitoring)
4. [Logging Strategy](#logging-strategy)
5. [Alerting & Notifications](#alerting--notifications)
6. [Performance Tuning](#performance-tuning)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Apolaki Solar Platform uses a comprehensive monitoring and logging stack to ensure reliability, performance, and visibility across all services.

### Architecture

```text
┌─────────────────────────────────────────────────────┐
│           Application Services                       │
│  (Frontend, DB Service, Solar Service)              │
└────────────────┬────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼────┐      ┌────▼────┐
    │  Logs   │      │ Metrics  │
    └────┬────┘      └────┬─────┘
         │                │
    ┌────▼────────────────▼────┐
    │  Elasticsearch / Loki    │
    │  (Log Aggregation)       │
    └────┬─────────────────────┘
         │
    ┌────▼───────────────┐
    │  Kibana / Grafana  │
    │  (Visualization)   │
    └────────────────────┘
```

---

## Local Monitoring

### Check Docker Container Status

```bash
# View all running containers
docker-compose -f config/docker-compose.yml ps

# Check specific service logs
docker-compose -f config/docker-compose.yml logs postgres
docker-compose -f config/docker-compose.yml logs redis
docker-compose -f config/docker-compose.yml logs rabbitmq

# Follow logs in real-time
docker-compose -f config/docker-compose.yml logs -f frontend

# Show logs from last 100 lines
docker-compose -f config/docker-compose.yml logs --tail=100 postgres
```

### Health Checks

```bash
# Check service health
docker-compose -f config/docker-compose.yml ps

# PostgreSQL health check
docker-compose -f config/docker-compose.yml exec postgres pg_isready -U apolaki_user

# Redis health check
docker-compose -f config/docker-compose.yml exec redis redis-cli ping

# RabbitMQ health check
docker-compose -f config/docker-compose.yml exec rabbitmq rabbitmq-diagnostics ping

# Elasticsearch health check
curl http://localhost:9200/_cluster/health
```

### Performance Metrics (Local)

```bash
# Docker stats - CPU, memory, network usage
docker stats --no-stream

# Monitor PostgreSQL connections
docker-compose -f config/docker-compose.yml exec postgres psql -U apolaki_user -d apolaki_db \
  -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Check Redis memory usage
docker-compose -f config/docker-compose.yml exec redis redis-cli INFO memory

# Monitor RabbitMQ queues
curl -u guest:guest http://localhost:15672/api/queues

# Check Elasticsearch nodes
curl http://localhost:9200/_nodes/stats
```

---

## Production Monitoring

### Kubernetes Monitoring

```bash
# Watch pod status
kubectl get pods -n production -w

# Get detailed pod information
kubectl describe pod <pod-name> -n production

# View pod logs
kubectl logs <pod-name> -n production

# Stream logs
kubectl logs -f <pod-name> -n production

# Get logs from all pods in a deployment
kubectl logs -l app=apolaki-frontend -n production

# Get previous pod logs (if crashed)
kubectl logs <pod-name> -n production --previous
```

### Metrics Collection

#### Using Prometheus

```yaml
# Add to helm values-production.yaml
prometheus:
  enabled: true
  scrapeInterval: 15s
  retentionDays: 30
  servicemonitors:
    - frontend
    - db-service
    - solar-service
```

#### Using Datadog

```bash
# Install Datadog agent
helm repo add datadog https://helm.datadoghq.com
helm install datadog datadog/datadog \
  --set datadog.apiKey=$DATADOG_API_KEY \
  -n production
```

#### Using New Relic

```bash
# Install New Relic agent
helm repo add newrelic https://helm-charts.newrelic.com
helm install newrelic-bundle newrelic/nri-bundle \
  --set licenseKey=$NEW_RELIC_LICENSE_KEY \
  -n production
```

### Uptime Monitoring

```bash
# Using curl to test endpoints
curl -f https://api.apolaki-solar.com/health || echo "API is down"

# Using wget
wget --quiet --tries=1 --spider https://apolaki-solar.com || echo "Frontend is down"

# Automated monitoring with cron
# Add to crontab:
# */5 * * * * curl -f https://api.apolaki-solar.com/health || mail -s "API Down" admin@apolaki.com
```

---

## Logging Strategy

### Log Levels

```text
ERROR   - Application errors, failures
WARN    - Warning conditions, issues
INFO    - Informational messages, important events
DEBUG   - Debug information, detailed tracing
TRACE   - Very detailed trace information
```

### Structured Logging Format

All logs should follow this JSON format for easy parsing:

```json
{
  "timestamp": "2026-02-26T10:30:45.123Z",
  "level": "INFO",
  "service": "solar-service",
  "pod": "apolaki-solar-service-xyz123",
  "namespace": "production",
  "message": "Solar installation data processed",
  "context": {
    "installationId": "inst_12345",
    "duration_ms": 245,
    "status": "success"
  },
  "traceId": "trace_abc123",
  "userId": "user_12345"
}
```

### Application Logging

#### Frontend (Vue.js)

```javascript
// Install logger
npm install winston

// src/services/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### Backend Services

```javascript
// middleware/netlify-db-service/src/logger.ts
const logger = require('winston');

logger.info('Database service started', {
  port: process.env.PORT,
  environment: process.env.NODE_ENV
});
```

```go
// middleware/solar-service/internal/logger/logger.go
import "go.uber.org/zap"

logger, _ := zap.NewProduction()
logger.Info("Solar service started",
    zap.String("version", "1.0.0"),
    zap.String("port", "8080"),
)
```

### Database Logging

```sql
-- Enable query logging in PostgreSQL
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
SELECT pg_reload_conf();

-- Check logs
SELECT * FROM pg_read_file('postgresql.log');

-- View slow queries
SELECT query, calls, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;
```

---

## Alerting & Notifications

### Alert Rules

Create alert rules for critical conditions:

```yaml
# prometheus/alert-rules.yaml
groups:
  - name: apolaki-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          severity: critical

      # High memory usage
      - alert: HighMemoryUsage
        expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.85
        for: 5m
        annotations:
          summary: "Memory usage above 85%"
          severity: warning

      # Pod restart loop
      - alert: PodRestartingTooOften
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
        for: 5m
        annotations:
          summary: "Pod is restarting too frequently"
          severity: critical

      # Database connection pool exhausted
      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_activity_count > 190
        for: 2m
        annotations:
          summary: "Database connection pool nearly exhausted"
          severity: warning
```

### Slack Notifications

```bash
# Using curl to send Slack notifications
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Send alert
curl -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "⚠️ Production Alert",
    "attachments": [{
      "color": "danger",
      "title": "High Error Rate Detected",
      "text": "Error rate is 5.2% (threshold: 5%)",
      "footer": "Apolaki Monitoring"
    }]
  }'
```

### PagerDuty Integration

```bash
# Trigger incident via PagerDuty API
curl -X POST "https://events.pagerduty.com/v2/enqueue" \
  -H 'Content-Type: application/json' \
  -d '{
    "routing_key": "$PAGERDUTY_ROUTING_KEY",
    "event_action": "trigger",
    "dedup_key": "db-cpu-alert-2026-02-26",
    "payload": {
      "summary": "High CPU usage on database server",
      "severity": "critical",
      "source": "Apolaki Monitoring"
    }
  }'
```

---

## Performance Tuning

### Database Performance

```sql
-- Create indexes for common queries
CREATE INDEX idx_installations_user_id ON solar.installations(user_id);
CREATE INDEX idx_performance_metrics_installation_id ON solar.performance_metrics(installation_id);
CREATE INDEX idx_trades_created_at ON trading.trades(created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE 
  SELECT * FROM solar.installations 
  WHERE user_id = $1 
  ORDER BY created_at DESC;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Vacuum and analyze
VACUUM ANALYZE solar.installations;
```

### Redis Optimization

```bash
# Monitor Redis memory
redis-cli INFO memory

# Find keys using most memory
redis-cli --memkeys

# Clear expired keys
redis-cli EVICTION

# Monitor commands
redis-cli MONITOR

# Analyze slowlog
redis-cli SLOWLOG GET 10
```

### Kubernetes Pod Resources

```yaml
# Set appropriate resource limits
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

# Add HPA (Horizontal Pod Autoscaling)
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

---

## Troubleshooting

### Common Issues

#### 1. High Memory Usage

```bash
# Check top processes
kubectl top pods -n production

# Analyze memory leaks
docker-compose logs memory-hungry-service | grep -i "memory"

# Restart service
kubectl rollout restart deployment/apolaki-service -n production
```

#### 2. Database Connection Issues

```bash
# Check connections
docker-compose exec postgres psql -U apolaki_user -c "SELECT * FROM pg_stat_activity;"

# Kill idle connections
docker-compose exec postgres psql -U apolaki_user -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"

# Increase connection pool
# Edit config/env/.env.prod: DATABASE_POOL_SIZE=100
```

#### 3. Service Not Responding

```bash
# Check service status
kubectl get svc -n production

# Check pod logs
kubectl logs <pod-name> -n production --tail=200

# Restart pod
kubectl delete pod <pod-name> -n production

# Check health endpoint
curl -v http://service-endpoint/health
```

#### 4. Slow Queries

```bash
# Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

# Find slowest queries
SELECT query, calls, mean_time, max_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Create indexes for missing columns
EXPLAIN ANALYZE <query>;
```

### Debug Commands

```bash
# Port forwarding to local machine
kubectl port-forward svc/apolaki-db-service 5432:5432 -n production

# Access pod shell
kubectl exec -it <pod-name> -n production -- /bin/sh

# Check network connectivity
kubectl exec <pod> -n production -- curl -v http://other-service:3000/health

# View environment variables
kubectl exec <pod> -n production -- printenv | grep DATABASE_URL
```

---

## Dashboards & Visualization

### Grafana Dashboard

Create custom dashboards for:

- Request latency (p50, p95, p99)
- Error rates by service
- CPU and memory usage
- Database connection pool
- Cache hit/miss ratios
- Message queue depth

### Kibana Dashboard

Create custom views for:

- Error logs with full stack traces
- User activity traces
- API response times
- Authentication events
- Business metrics (installations created, trades completed)

---

## Maintenance

### Daily Tasks

- [ ] Check error logs for critical issues
- [ ] Monitor resource utilization
- [ ] Verify backups completed
- [ ] Review alert logs

### Weekly Tasks

- [ ] Analyze performance metrics
- [ ] Review slow query logs
- [ ] Update monitoring dashboards
- [ ] Check disk space usage

### Monthly Tasks

- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Review and update alert thresholds
- [ ] Capacity planning analysis
- [ ] Security log review

---

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [ELK Stack Guide](https://www.elastic.co/guide/)
- [Kubernetes Monitoring](https://kubernetes.io/docs/tasks/debug-application-cluster/)
- [PostgreSQL Logging Configuration](https://www.postgresql.org/docs/current/runtime-config-logging.html)
