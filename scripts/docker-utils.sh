#!/bin/bash

################################################################################
# Apolaki Solar Platform - Docker Utilities
# 
# Useful commands for Docker operations
# Usage: ./scripts/docker-utils.sh [command]
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    cat << EOF
${BLUE}Apolaki Docker Utilities${NC}

Usage: ./scripts/docker-utils.sh [command] [options]

Commands:
  build              Build all Docker images
  build-frontend     Build frontend image
  build-db-service   Build database service image
  build-solar-service Build solar service image
  
  push               Push all images to registry
  push-frontend      Push frontend image
  push-db-service    Push database service image
  push-solar-service Push solar service image
  
  start              Start all containers
  stop               Stop all containers
  restart            Restart all containers
  
  logs               Show container logs
  logs-frontend      Show frontend logs
  logs-db-service    Show database service logs
  logs-solar-service Show solar service logs
  logs-postgres      Show PostgreSQL logs
  logs-redis         Show Redis logs
  
  clean              Remove all containers and images
  prune              Prune Docker system (remove unused resources)
  
  status             Show container status
  inspect [service]  Inspect specific service
  
  help               Show this help message

Examples:
  ./scripts/docker-utils.sh build
  ./scripts/docker-utils.sh logs-frontend
  ./scripts/docker-utils.sh push
  ./scripts/docker-utils.sh clean
EOF
}

build_all() {
    echo "${GREEN}Building all Docker images...${NC}"
    docker build -t apolaki-frontend:latest -f "$PROJECT_ROOT/frontend/Dockerfile" "$PROJECT_ROOT/frontend"
    docker build -t apolaki-db-service:latest -f "$PROJECT_ROOT/middleware/netlify-db-service/Dockerfile" "$PROJECT_ROOT/middleware/netlify-db-service"
    docker build -t apolaki-solar-service:latest -f "$PROJECT_ROOT/middleware/solar-service/Dockerfile" "$PROJECT_ROOT/middleware/solar-service"
    echo "${GREEN}✓ All images built${NC}"
}

push_all() {
    echo "${GREEN}Pushing all Docker images...${NC}"
    local registry="${DOCKER_REGISTRY:-ghcr.io}"
    
    docker push "$registry/apolaki-frontend:latest"
    docker push "$registry/apolaki-db-service:latest"
    docker push "$registry/apolaki-solar-service:latest"
    echo "${GREEN}✓ All images pushed${NC}"
}

show_status() {
    echo "${GREEN}Container Status:${NC}"
    docker-compose -f "$PROJECT_ROOT/config/docker-compose.yml" ps
}

show_logs() {
    docker-compose -f "$PROJECT_ROOT/config/docker-compose.yml" logs -f
}

start_services() {
    echo "${GREEN}Starting services...${NC}"
    docker-compose -f "$PROJECT_ROOT/config/docker-compose.yml" up -d
}

stop_services() {
    echo "${GREEN}Stopping services...${NC}"
    docker-compose -f "$PROJECT_ROOT/config/docker-compose.yml" down
}

restart_services() {
    echo "${GREEN}Restarting services...${NC}"
    docker-compose -f "$PROJECT_ROOT/config/docker-compose.yml" restart
}

clean_docker() {
    echo "${GREEN}Cleaning Docker resources...${NC}"
    docker-compose -f "$PROJECT_ROOT/config/docker-compose.yml" down -v
    echo "${GREEN}✓ Docker resources cleaned${NC}"
}

prune_docker() {
    echo "${GREEN}Pruning Docker system...${NC}"
    docker system prune -f
    echo "${GREEN}✓ Docker system pruned${NC}"
}

# Main command handler
case "${1:-help}" in
    build) build_all ;;
    build-frontend) docker build -t apolaki-frontend:latest -f "$PROJECT_ROOT/frontend/Dockerfile" "$PROJECT_ROOT/frontend" ;;
    build-db-service) docker build -t apolaki-db-service:latest -f "$PROJECT_ROOT/middleware/netlify-db-service/Dockerfile" "$PROJECT_ROOT/middleware/netlify-db-service" ;;
    build-solar-service) docker build -t apolaki-solar-service:latest -f "$PROJECT_ROOT/middleware/solar-service/Dockerfile" "$PROJECT_ROOT/middleware/solar-service" ;;
    
    push) push_all ;;
    push-frontend) docker push "${DOCKER_REGISTRY:-ghcr.io}/apolaki-frontend:latest" ;;
    push-db-service) docker push "${DOCKER_REGISTRY:-ghcr.io}/apolaki-db-service:latest" ;;
    push-solar-service) docker push "${DOCKER_REGISTRY:-ghcr.io}/apolaki-solar-service:latest" ;;
    
    start) start_services ;;
    stop) stop_services ;;
    restart) restart_services ;;
    
    logs) show_logs ;;
    logs-frontend) docker logs -f apolaki-frontend ;;
    logs-db-service) docker logs -f apolaki-netlify-db-service ;;
    logs-solar-service) docker logs -f apolaki-solar-service ;;
    logs-postgres) docker logs -f apolaki-postgres ;;
    logs-redis) docker logs -f apolaki-redis ;;
    
    clean) clean_docker ;;
    prune) prune_docker ;;
    
    status) show_status ;;
    inspect) docker inspect "${2:-apolaki-postgres}" ;;
    
    help) show_help ;;
    *) show_help && exit 1 ;;
esac
