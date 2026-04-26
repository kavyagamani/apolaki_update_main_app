#!/bin/bash

################################################################################
# Apolaki Solar Platform - Kubernetes Utilities
# 
# Useful commands for Kubernetes operations
# Usage: ./scripts/k8s-utils.sh [command]
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

show_help() {
    cat << EOF
${BLUE}Apolaki Kubernetes Utilities${NC}

Usage: ./scripts/k8s-utils.sh [command] [options]

Commands:
  status [env]              Show cluster status (default: staging)
  deploy [env] [version]    Deploy to environment
  
  pods [env]                List pods
  services [env]            List services
  ingress [env]             List ingress
  
  logs [env] [pod]          Show pod logs
  shell [env] [pod]         Open shell in pod
  exec [env] [pod] [cmd]    Execute command in pod
  
  scale [env] [service] [n] Scale deployment to n replicas
  restart [env] [service]   Restart deployment
  rollback [env] [service]  Rollback to previous version
  
  port-forward [env] [port] Port forward to service
  get-url [env]             Get service URLs
  
  describe [env] [resource] Describe Kubernetes resource
  events [env]              Show cluster events
  
  cleanup [env]             Delete all resources in namespace
  
  help                      Show this help message

Examples:
  ./scripts/k8s-utils.sh status staging
  ./scripts/k8s-utils.sh pods production
  ./scripts/k8s-utils.sh logs staging frontend
  ./scripts/k8s-utils.sh scale production frontend 3
EOF
}

check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${YELLOW}kubectl is not installed${NC}"
        exit 1
    fi
}

set_context() {
    local env=${1:-staging}
    local context="apolaki-$env"
    
    kubectl config use-context "$context" 2>/dev/null || true
}

show_status() {
    local env=${1:-staging}
    set_context "$env"
    
    echo -e "${GREEN}Cluster Status for $env${NC}"
    kubectl cluster-info
    echo ""
    echo -e "${GREEN}Nodes:${NC}"
    kubectl get nodes
    echo ""
    echo -e "${GREEN}Namespaces:${NC}"
    kubectl get namespaces
}

list_pods() {
    local env=${1:-staging}
    set_context "$env"
    
    echo -e "${GREEN}Pods in $env${NC}"
    kubectl get pods -n "$env" -o wide
}

list_services() {
    local env=${1:-staging}
    set_context "$env"
    
    echo -e "${GREEN}Services in $env${NC}"
    kubectl get services -n "$env" -o wide
}

list_ingress() {
    local env=${1:-staging}
    set_context "$env"
    
    echo -e "${GREEN}Ingress in $env${NC}"
    kubectl get ingress -n "$env" -o wide
}

show_logs() {
    local env=${1:-staging}
    local pod=${2:-frontend}
    set_context "$env"
    
    kubectl logs -f "deployment/apolaki-$pod" -n "$env" || kubectl logs -f "$pod" -n "$env"
}

open_shell() {
    local env=${1:-staging}
    local pod=${2:-frontend}
    set_context "$env"
    
    kubectl exec -it "$(kubectl get pod -n "$env" -l "app=apolaki-$pod" -o jsonpath='{.items[0].metadata.name}')" -n "$env" -- /bin/sh
}

exec_command() {
    local env=$1
    local pod=$2
    shift 2
    local cmd="$@"
    set_context "$env"
    
    kubectl exec -it "$(kubectl get pod -n "$env" -l "app=$pod" -o jsonpath='{.items[0].metadata.name}')" -n "$env" -- $cmd
}

scale_deployment() {
    local env=$1
    local service=$2
    local replicas=$3
    set_context "$env"
    
    echo -e "${GREEN}Scaling $service to $replicas replicas in $env${NC}"
    kubectl scale deployment "apolaki-$service" -n "$env" --replicas="$replicas"
}

restart_deployment() {
    local env=$1
    local service=$2
    set_context "$env"
    
    echo -e "${GREEN}Restarting $service in $env${NC}"
    kubectl rollout restart deployment "apolaki-$service" -n "$env"
}

rollback_deployment() {
    local env=$1
    local service=$2
    set_context "$env"
    
    echo -e "${GREEN}Rolling back $service in $env${NC}"
    kubectl rollout undo deployment "apolaki-$service" -n "$env"
}

port_forward() {
    local env=${1:-staging}
    local port=${2:-8080}
    set_context "$env"
    
    echo -e "${GREEN}Port forwarding to $env on port $port${NC}"
    kubectl port-forward -n "$env" "svc/apolaki-frontend" "$port:80"
}

get_urls() {
    local env=${1:-staging}
    set_context "$env"
    
    echo -e "${GREEN}Service URLs for $env${NC}"
    kubectl get ingress -n "$env" -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.rules[0].host}{"\n"}{end}'
}

describe_resource() {
    local env=$1
    local resource=$2
    set_context "$env"
    
    kubectl describe "$resource" -n "$env"
}

show_events() {
    local env=${1:-staging}
    set_context "$env"
    
    echo -e "${GREEN}Recent events in $env${NC}"
    kubectl get events -n "$env" --sort-by='.lastTimestamp'
}

cleanup_namespace() {
    local env=$1
    set_context "$env"
    
    echo -e "${YELLOW}WARNING: This will delete all resources in the $env namespace${NC}"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        kubectl delete all --all -n "$env"
        echo -e "${GREEN}Cleanup completed${NC}"
    fi
}

# Main command handler
check_kubectl

case "${1:-help}" in
    status) show_status "$2" ;;
    pods) list_pods "$2" ;;
    services) list_services "$2" ;;
    ingress) list_ingress "$2" ;;
    logs) show_logs "$2" "$3" ;;
    shell) open_shell "$2" "$3" ;;
    exec) exec_command "$2" "$3" "${@:4}" ;;
    scale) scale_deployment "$2" "$3" "$4" ;;
    restart) restart_deployment "$2" "$3" ;;
    rollback) rollback_deployment "$2" "$3" ;;
    port-forward) port_forward "$2" "$3" ;;
    get-url) get_urls "$2" ;;
    describe) describe_resource "$2" "$3" ;;
    events) show_events "$2" ;;
    cleanup) cleanup_namespace "$2" ;;
    help) show_help ;;
    *) show_help && exit 1 ;;
esac
