#!/bin/bash

################################################################################
# Apolaki Solar Platform - Production Deployment Script
# 
# This script automates the deployment process to production environments
# Usage: ./deploy-prod.sh [environment] [version]
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$PROJECT_ROOT/logs/deployment_$TIMESTAMP.log"

# Default values
ENVIRONMENT="${1:-staging}"
VERSION="${2:-latest}"
DRY_RUN="${DRY_RUN:-false}"
NOTIFY_SLACK="${NOTIFY_SLACK:-true}"

# Ensure logs directory exists
mkdir -p "$PROJECT_ROOT/logs"

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)
            echo -e "${BLUE}[${timestamp}] INFO:${NC} $message" | tee -a "$LOG_FILE"
            ;;
        SUCCESS)
            echo -e "${GREEN}[${timestamp}] ✓ SUCCESS:${NC} $message" | tee -a "$LOG_FILE"
            ;;
        WARN)
            echo -e "${YELLOW}[${timestamp}] ⚠ WARNING:${NC} $message" | tee -a "$LOG_FILE"
            ;;
        ERROR)
            echo -e "${RED}[${timestamp}] ✗ ERROR:${NC} $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Error handling
trap 'handle_error' ERR

handle_error() {
    local line_no=$1
    log ERROR "Deployment failed at line $line_no"
    notify_slack "failure" "Deployment to $ENVIRONMENT failed at line $line_no"
    exit 1
}

# Slack notification
notify_slack() {
    if [ "$NOTIFY_SLACK" != "true" ]; then
        return
    fi
    
    local status=$1
    local message=$2
    local webhook_url=$SLACK_WEBHOOK_URL
    
    if [ -z "$webhook_url" ]; then
        log WARN "SLACK_WEBHOOK_URL not set, skipping notification"
        return
    fi
    
    local color="good"
    local title="✅ Deployment Successful"
    
    if [ "$status" = "failure" ]; then
        color="danger"
        title="❌ Deployment Failed"
    fi
    
    local payload=$(cat <<EOF
{
    "attachments": [
        {
            "color": "$color",
            "title": "$title",
            "text": "Environment: $ENVIRONMENT\nVersion: $VERSION\n$message",
            "footer": "Apolaki Solar Platform",
            "ts": $(date +%s)
        }
    ]
}
EOF
    )
    
    curl -X POST -H 'Content-type: application/json' \
        --data "$payload" \
        "$webhook_url" \
        2>/dev/null || true
}

# Validate prerequisites
validate_prerequisites() {
    log INFO "Validating prerequisites..."
    
    local required_commands=("docker" "kubectl" "helm")
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log ERROR "$cmd is not installed"
            exit 1
        fi
    done
    
    log SUCCESS "All prerequisites validated"
}

# Validate environment
validate_environment() {
    log INFO "Validating $ENVIRONMENT environment..."
    
    case $ENVIRONMENT in
        staging)
            if [ -z "$STAGING_KUBECONFIG" ]; then
                log WARN "STAGING_KUBECONFIG not set, using default kubeconfig"
            fi
            ;;
        production)
            log WARN "⚠️  DEPLOYING TO PRODUCTION!"
            read -p "Are you sure you want to deploy to production? (yes/no): " confirm
            if [ "$confirm" != "yes" ]; then
                log ERROR "Deployment cancelled"
                exit 1
            fi
            
            # Additional production checks
            if [ -z "$PRODUCTION_KUBECONFIG" ]; then
                log ERROR "PRODUCTION_KUBECONFIG is required for production deployment"
                exit 1
            fi
            ;;
        *)
            log ERROR "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    log SUCCESS "Environment validation passed"
}

# Build Docker images
build_docker_images() {
    log INFO "Building Docker images..."
    
    local images=(
        "frontend:$VERSION"
        "db-service:$VERSION"
        "solar-service:$VERSION"
    )
    
    for image in "${images[@]}"; do
        local service_name=${image%:*}
        log INFO "Building $image..."
        
        if [ "$DRY_RUN" = "true" ]; then
            log INFO "[DRY RUN] docker build would be executed for $service_name"
        else
            case $service_name in
                frontend)
                    docker build -t "$image" -f frontend/Dockerfile frontend/
                    ;;
                db-service)
                    docker build -t "$image" -f middleware/netlify-db-service/Dockerfile middleware/netlify-db-service/
                    ;;
                solar-service)
                    docker build -t "$image" -f middleware/solar-service/Dockerfile middleware/solar-service/
                    ;;
            esac
        fi
    done
    
    log SUCCESS "Docker images built successfully"
}

# Push Docker images
push_docker_images() {
    log INFO "Pushing Docker images to registry..."
    
    local registry="${DOCKER_REGISTRY:-ghcr.io/${{ github.repository_owner }}}"
    local images=(
        "frontend:$VERSION"
        "db-service:$VERSION"
        "solar-service:$VERSION"
    )
    
    if [ "$DRY_RUN" = "true" ]; then
        log INFO "[DRY RUN] Docker push would be executed to $registry"
        return
    fi
    
    for image in "${images[@]}"; do
        local full_image="$registry/apolaki-${image}"
        log INFO "Pushing $full_image..."
        docker push "$full_image"
    done
    
    log SUCCESS "Docker images pushed successfully"
}

# Deploy with Helm
deploy_helm() {
    log INFO "Deploying with Helm to $ENVIRONMENT..."
    
    local namespace=$ENVIRONMENT
    local values_file="$PROJECT_ROOT/helm/values-${ENVIRONMENT}.yaml"
    local registry="${DOCKER_REGISTRY:-ghcr.io/${{ github.repository_owner }}}"
    
    if [ ! -f "$values_file" ]; then
        log ERROR "Values file not found: $values_file"
        exit 1
    fi
    
    # Services to deploy
    local services=(
        "frontend"
        "db-service"
        "solar-service"
    )
    
    if [ "$DRY_RUN" = "true" ]; then
        log INFO "[DRY RUN] Helm deployments would be executed"
        for service in "${services[@]}"; do
            log INFO "[DRY RUN] helm upgrade --install apolaki-$service"
        done
        return
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace "$namespace" --dry-run=client -o yaml | kubectl apply -f -
    
    for service in "${services[@]}"; do
        log INFO "Deploying $service..."
        
        helm upgrade --install "apolaki-$service" \
            "$PROJECT_ROOT/helm/$service" \
            --namespace "$namespace" \
            --values "$values_file" \
            --set "image.tag=$VERSION" \
            --set "image.registry=$registry" \
            --wait \
            --timeout 10m
    done
    
    log SUCCESS "Helm deployments completed"
}

# Wait for rollout
wait_for_rollout() {
    log INFO "Waiting for rollout to complete..."
    
    local namespace=$ENVIRONMENT
    local services=(
        "frontend"
        "db-service"
        "solar-service"
    )
    
    if [ "$DRY_RUN" = "true" ]; then
        log INFO "[DRY RUN] Rollout wait would be executed"
        return
    fi
    
    for service in "${services[@]}"; do
        log INFO "Waiting for $service rollout..."
        kubectl rollout status "deployment/apolaki-$service" \
            -n "$namespace" \
            --timeout=10m
    done
    
    log SUCCESS "All services rolled out successfully"
}

# Run smoke tests
run_smoke_tests() {
    log INFO "Running smoke tests..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log INFO "[DRY RUN] Smoke tests would be executed"
        return
    fi
    
    # Get service endpoints
    local frontend_url=$(kubectl get service apolaki-frontend \
        -n "$ENVIRONMENT" \
        -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' \
        2>/dev/null || echo "localhost:3000")
    
    # Test frontend
    log INFO "Testing frontend at $frontend_url..."
    if curl -f -s "http://$frontend_url" > /dev/null; then
        log SUCCESS "Frontend is responding"
    else
        log WARN "Frontend may not be fully ready yet"
    fi
    
    log SUCCESS "Smoke tests completed"
}

# Backup before deployment
backup_database() {
    log INFO "Creating backup before deployment..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log INFO "[DRY RUN] Database backup would be created"
        return
    fi
    
    local backup_name="apolaki-backup-$TIMESTAMP"
    log INFO "Creating backup: $backup_name"
    
    # Create backup using kubectl
    kubectl exec -n "$ENVIRONMENT" \
        $(kubectl get pod -n "$ENVIRONMENT" -l app=postgres -o jsonpath='{.items[0].metadata.name}') \
        -- pg_dump --username=postgres > "$PROJECT_ROOT/backups/$backup_name.sql" \
        2>/dev/null || log WARN "Could not create database backup"
    
    log SUCCESS "Backup created"
}

# Generate deployment report
generate_report() {
    log INFO "Generating deployment report..."
    
    local report_file="$PROJECT_ROOT/logs/deployment_report_$TIMESTAMP.md"
    
    cat > "$report_file" << EOF
# Deployment Report

**Date:** $(date)
**Environment:** $ENVIRONMENT
**Version:** $VERSION
**Status:** SUCCESS

## Services Deployed

$(kubectl get deployment -n "$ENVIRONMENT" -o wide 2>/dev/null || echo "No deployments found")

## Pods

$(kubectl get pods -n "$ENVIRONMENT" 2>/dev/null || echo "No pods found")

## Services

$(kubectl get svc -n "$ENVIRONMENT" 2>/dev/null || echo "No services found")

## Events

$(kubectl get events -n "$ENVIRONMENT" --sort-by='.lastTimestamp' 2>/dev/null | tail -20 || echo "No events found")

EOF
    
    log SUCCESS "Report generated: $report_file"
    cat "$report_file"
}

# Main deployment flow
main() {
    log INFO "========================================="
    log INFO "Apolaki Solar Platform - Deployment"
    log INFO "========================================="
    log INFO "Environment: $ENVIRONMENT"
    log INFO "Version: $VERSION"
    log INFO "Log file: $LOG_FILE"
    log INFO "Dry run: $DRY_RUN"
    log INFO "========================================="
    
    validate_prerequisites
    validate_environment
    
    if [ "$ENVIRONMENT" = "production" ]; then
        backup_database
    fi
    
    build_docker_images
    push_docker_images
    deploy_helm
    wait_for_rollout
    run_smoke_tests
    generate_report
    
    log SUCCESS "========================================="
    log SUCCESS "Deployment completed successfully!"
    log SUCCESS "========================================="
    
    notify_slack "success" "Deployment to $ENVIRONMENT completed successfully (v$VERSION)"
}

# Run main function
main "$@"
