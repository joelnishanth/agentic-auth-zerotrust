#!/bin/bash

# Zero Trust Architecture Deployment Script
# Features: Progress bars, health checks, and status monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Unicode characters for progress
CHECKMARK="✅"
CROSS="❌"
LOADING="⏳"
ROCKET="🚀"
SHIELD="🛡️"
DATABASE="🗄️"
BRAIN="🤖"
GLOBE="🌐"

# Enhanced progress bar function with better ANSI handling
show_progress() {
    local duration=$1
    local message=$2
    local width=50
    local use_colors=${3:-true}
    
    # Detect if terminal supports colors
    if [ "$use_colors" = "true" ] && [ -t 1 ]; then
        local bar_color="${CYAN}"
        local text_color="${BLUE}"
        local percent_color="${WHITE}"
        local reset="${NC}"
    else
        local bar_color=""
        local text_color=""
        local percent_color=""
        local reset=""
    fi
    
    echo -e "${text_color}${message}${reset}"
    
    for ((i=0; i<=duration; i++)); do
        local progress=$((i * width / duration))
        local remaining=$((width - progress))
        local percentage=$((i * 100 / duration))
        
        # Build progress bar
        local bar=""
        local filled_char="█"
        local empty_char="░"
        local progress_char="▶"
        
        # Create filled portion
        for ((j=0; j<progress; j++)); do
            bar+="${filled_char}"
        done
        
        # Add progress indicator
        if [ $progress -lt $width ] && [ $i -lt $duration ]; then
            bar+="${progress_char}"
            remaining=$((remaining - 1))
        fi
        
        # Add empty portion
        for ((j=0; j<remaining; j++)); do
            bar+="${empty_char}"
        done
        
        # Print progress bar with proper ANSI escape handling
        printf "\r${bar_color}[${bar}] ${percent_color}%3d%%${reset}" $percentage
        
        # Flush output to ensure immediate display
        if command -v tput >/dev/null 2>&1; then
            tput el  # Clear to end of line
        fi
        
        sleep 0.05
    done
    
    # Final newline and success indicator
    printf "\r${bar_color}[${bar}] ${GREEN}%3d%% ✓${reset}\n" 100
}

# Advanced progress bar with custom styling
show_advanced_progress() {
    local duration=$1
    local message=$2
    local style=${3:-"modern"}
    local width=60
    
    echo -e "${BLUE}${message}${NC}"
    
    case $style in
        "classic")
            local filled_char="="
            local empty_char="-"
            local progress_char=">"
            ;;
        "modern")
            local filled_char="█"
            local empty_char="░"
            local progress_char="▶"
            ;;
        "dots")
            local filled_char="●"
            local empty_char="○"
            local progress_char="◐"
            ;;
        "blocks")
            local filled_char="▓"
            local empty_char="▒"
            local progress_char="▶"
            ;;
    esac
    
    for ((i=0; i<=duration; i++)); do
        local progress=$((i * width / duration))
        local remaining=$((width - progress))
        local percentage=$((i * 100 / duration))
        
        # Color gradient based on progress
        local bar_color
        if [ $percentage -lt 33 ]; then
            bar_color="${RED}"
        elif [ $percentage -lt 66 ]; then
            bar_color="${YELLOW}"
        else
            bar_color="${GREEN}"
        fi
        
        # Build the bar
        printf "\r${CYAN}["
        
        # Filled portion
        printf "${bar_color}"
        for ((j=0; j<progress; j++)); do
            printf "${filled_char}"
        done
        
        # Progress indicator
        if [ $progress -lt $width ] && [ $i -lt $duration ]; then
            printf "${YELLOW}${progress_char}"
            remaining=$((remaining - 1))
        fi
        
        # Empty portion
        printf "${WHITE}"
        for ((j=0; j<remaining; j++)); do
            printf "${empty_char}"
        done
        
        printf "${CYAN}] ${WHITE}%3d%%${NC}" $percentage
        
        # Add time estimate
        if [ $i -gt 0 ]; then
            local elapsed=$((i))
            local estimated_total=$((duration))
            local remaining_time=$((estimated_total - elapsed))
            printf " ${PURPLE}(~%ds remaining)${NC}" $remaining_time
        fi
        
        sleep 0.08
    done
    
    printf "\r${CYAN}["
    printf "${GREEN}"
    for ((j=0; j<width; j++)); do
        printf "${filled_char}"
    done
    printf "${CYAN}] ${GREEN}100%% ✓ Complete!${NC}                    \n"
}

# Enhanced spinner function with multiple styles
show_spinner() {
    local pid=$1
    local message=$2
    local style=${3:-"braille"}
    local i=0
    
    # Different spinner styles
    case $style in
        "braille")
            local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
            local spin_length=10
            ;;
        "dots")
            local spin='⠁⠂⠄⡀⢀⠠⠐⠈'
            local spin_length=8
            ;;
        "line")
            local spin='|/-\'
            local spin_length=4
            ;;
        "arrow")
            local spin='←↖↑↗→↘↓↙'
            local spin_length=8
            ;;
        "bounce")
            local spin='⠁⠂⠄⠂'
            local spin_length=4
            ;;
    esac
    
    echo -ne "${BLUE}${message}${NC} "
    
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) % spin_length ))
        local spinner_char="${spin:$i:1}"
        
        # Add color cycling for visual appeal
        local color_index=$((i % 6))
        case $color_index in
            0) local spinner_color="${YELLOW}" ;;
            1) local spinner_color="${GREEN}" ;;
            2) local spinner_color="${CYAN}" ;;
            3) local spinner_color="${BLUE}" ;;
            4) local spinner_color="${PURPLE}" ;;
            5) local spinner_color="${WHITE}" ;;
        esac
        
        printf "\r${BLUE}${message}${NC} ${spinner_color}${spinner_char}${NC}"
        sleep 0.1
    done
    
    # Clear the line and show completion
    printf "\r${BLUE}${message}${NC} ${GREEN}${CHECKMARK}${NC}\n"
}

# Multi-line progress display for complex operations
show_multi_progress() {
    local steps_array=("$@")
    local total_steps=${#steps_array[@]}
    local current_step=0
    
    echo -e "${WHITE}Progress Overview:${NC}"
    echo -e "${WHITE}=================${NC}"
    
    for step in "${steps_array[@]}"; do
        ((current_step++))
        local percentage=$((current_step * 100 / total_steps))
        
        # Show overall progress
        printf "${CYAN}Overall: ["
        local overall_progress=$((current_step * 50 / total_steps))
        for ((i=0; i<overall_progress; i++)); do printf "█"; done
        for ((i=overall_progress; i<50; i++)); do printf "░"; done
        printf "] %d%%${NC}\n" $percentage
        
        # Show current step
        echo -e "${YELLOW}Step ${current_step}/${total_steps}: ${step}${NC}"
        
        # Simulate step execution with mini progress bar
        show_progress 8 "  Executing..." false
        
        echo
    done
    
    echo -e "${GREEN}${CHECKMARK} All steps completed successfully!${NC}"
}

# Enhanced health check function with progress visualization
check_service_health() {
    local service_name=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1
    local width=30
    
    echo -e "${YELLOW}${LOADING} Checking ${service_name} health...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            # Success - show completed progress bar
            printf "\r${GREEN}["
            for ((i=0; i<width; i++)); do printf "█"; done
            printf "] ${CHECKMARK} ${service_name} is healthy!${NC}                    \n"
            return 0
        fi
        
        # Show progress bar for health check attempts
        local progress=$((attempt * width / max_attempts))
        local remaining=$((width - progress))
        
        printf "\r${YELLOW}["
        for ((i=0; i<progress; i++)); do printf "▓"; done
        for ((i=0; i<remaining; i++)); do printf "░"; done
        printf "] Checking ${service_name}... (%d/%d)${NC}" $attempt $max_attempts
        
        sleep 2
        ((attempt++))
    done
    
    # Failed - show failed progress bar
    printf "\r${RED}["
    for ((i=0; i<width; i++)); do printf "▒"; done
    printf "] ${CROSS} ${service_name} health check failed${NC}                    \n"
    return 1
}

# Real-time service monitoring with live updates
monitor_service_startup() {
    local service_name=$1
    local container_name=$2
    local health_url=$3
    local timeout=${4:-60}
    
    echo -e "${BLUE}Monitoring ${service_name} startup...${NC}"
    
    local start_time=$(date +%s)
    local dots=0
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -ge $timeout ]; then
            echo -e "\r${RED}${CROSS} ${service_name} startup timeout (${timeout}s)${NC}                    "
            return 1
        fi
        
        # Check if container is running
        local container_status=$(docker-compose ps -q $container_name 2>/dev/null)
        if [ -z "$container_status" ]; then
            printf "\r${YELLOW}⏳ Waiting for ${service_name} container to start... (%ds)${NC}" $elapsed
            sleep 1
            continue
        fi
        
        local running=$(docker inspect -f '{{.State.Running}}' $(docker-compose ps -q $container_name) 2>/dev/null)
        if [ "$running" != "true" ]; then
            printf "\r${YELLOW}⏳ ${service_name} container starting... (%ds)${NC}" $elapsed
            sleep 1
            continue
        fi
        
        # Check health endpoint if provided
        if [ -n "$health_url" ]; then
            if curl -s -f "$health_url" > /dev/null 2>&1; then
                echo -e "\r${GREEN}${CHECKMARK} ${service_name} is running and healthy! (${elapsed}s)${NC}                    "
                return 0
            fi
        else
            echo -e "\r${GREEN}${CHECKMARK} ${service_name} container is running! (${elapsed}s)${NC}                    "
            return 0
        fi
        
        # Animated waiting indicator
        local spinner_chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
        local spinner_index=$((dots % 10))
        local spinner_char="${spinner_chars:$spinner_index:1}"
        
        printf "\r${CYAN}${spinner_char} ${service_name} starting up... (%ds)${NC}" $elapsed
        
        ((dots++))
        sleep 0.5
    done
}

# Service status check
check_container_status() {
    local container_name=$1
    local status=$(docker-compose ps -q $container_name 2>/dev/null)
    
    if [ -n "$status" ]; then
        local running=$(docker inspect -f '{{.State.Running}}' $(docker-compose ps -q $container_name) 2>/dev/null)
        if [ "$running" = "true" ]; then
            echo -e "${GREEN}${CHECKMARK} ${container_name}${NC}"
            return 0
        else
            echo -e "${RED}${CROSS} ${container_name} (not running)${NC}"
            return 1
        fi
    else
        echo -e "${RED}${CROSS} ${container_name} (not found)${NC}"
        return 1
    fi
}

# Main deployment function
deploy_stack() {
    echo -e "${WHITE}${ROCKET} Zero Trust Architecture Deployment${NC}"
    echo -e "${WHITE}======================================${NC}\n"
    
    # Step 1: Clean up existing containers
    echo -e "${PURPLE}Step 1: Cleaning up existing deployment${NC}"
    show_advanced_progress 15 "Stopping existing containers..." "modern"
    docker-compose down --remove-orphans > /dev/null 2>&1 || true
    echo -e "${GREEN}${CHECKMARK} Cleanup complete${NC}\n"
    
    # Step 2: Build images
    echo -e "${PURPLE}Step 2: Building container images${NC}"
    docker-compose build > /tmp/build.log 2>&1 &
    BUILD_PID=$!
    show_spinner $BUILD_PID "Building all service images"
    wait $BUILD_PID
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}${CHECKMARK} All images built successfully${NC}\n"
    else
        echo -e "${RED}${CROSS} Build failed. Check /tmp/build.log for details${NC}"
        exit 1
    fi
    
    # Step 3: Start core infrastructure
    echo -e "${PURPLE}Step 3: Starting core infrastructure${NC}"
    show_advanced_progress 12 "Starting databases and OPA..." "blocks"
    docker-compose up -d postgres_us postgres_eu postgres_sbx opa > /dev/null 2>&1
    
    # Wait for databases with enhanced monitoring
    echo -e "${DATABASE} Monitoring database initialization..."
    monitor_service_startup "PostgreSQL US" "postgres_us" "" 30 &
    MONITOR_PID=$!
    show_advanced_progress 20 "Database initialization..." "modern"
    wait $MONITOR_PID 2>/dev/null || true
    echo -e "${GREEN}${CHECKMARK} Databases ready${NC}\n"
    
    # Step 4: Start authentication service
    echo -e "${PURPLE}Step 4: Starting authentication service${NC}"
    show_advanced_progress 8 "Starting Keycloak..." "classic"
    docker-compose up -d auth-service > /dev/null 2>&1
    monitor_service_startup "Keycloak" "auth-service" "http://localhost:8080/realms/zerotrust" 45
    echo -e "${GREEN}${CHECKMARK} Keycloak ready${NC}\n"
    
    # Step 5: Start application services
    echo -e "${PURPLE}Step 5: Starting application services${NC}"
    show_advanced_progress 12 "Starting middleware, agent, and logger..." "dots"
    docker-compose up -d middleware agent logger mcp-server > /dev/null 2>&1
    
    # Monitor each service startup
    monitor_service_startup "Agent" "agent" "http://localhost:8000/health" 30 &
    monitor_service_startup "Middleware" "middleware" "http://localhost:8001/health" 30 &
    monitor_service_startup "MCP Server" "mcp-server" "http://localhost:5001/health" 30 &
    wait
    echo -e "${GREEN}${CHECKMARK} Application services ready${NC}\n"
    
    # Step 6: Start frontend
    echo -e "${PURPLE}Step 6: Starting frontend${NC}"
    show_advanced_progress 8 "Starting React frontend..." "modern"
    docker-compose up -d frontend > /dev/null 2>&1
    monitor_service_startup "Frontend" "frontend" "http://localhost:3000" 40
    echo -e "${GREEN}${CHECKMARK} Frontend ready${NC}\n"
    
    # Step 7: Run data generator
    echo -e "${PURPLE}Step 7: Populating databases${NC}"
    show_advanced_progress 5 "Starting data generator..." "blocks"
    docker-compose up -d data-generator > /dev/null 2>&1
    
    # Enhanced data generator monitoring
    echo -e "${BRAIN} Monitoring AI-powered data generation..."
    local data_gen_running=true
    local start_time=$(date +%s)
    local spinner_chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    local i=0
    
    while $data_gen_running; do
        if ! docker-compose ps data-generator | grep -q "Up"; then
            data_gen_running=false
        else
            local current_time=$(date +%s)
            local elapsed=$((current_time - start_time))
            local spinner_char="${spinner_chars:$((i % 10)):1}"
            
            printf "\r${CYAN}${spinner_char} ${YELLOW}Generating realistic data with AI... (%ds)${NC}" $elapsed
            ((i++))
            sleep 0.5
        fi
    done
    
    local total_time=$(($(date +%s) - start_time))
    echo -e "\r${GREEN}${CHECKMARK} Data generation complete! (${total_time}s)${NC}                    \n"
    
    # Step 8: Health checks
    echo -e "${PURPLE}Step 8: Performing comprehensive health checks${NC}"
    
    # Wait a moment for services to fully start
    show_advanced_progress 15 "Waiting for services to stabilize..." "modern"
    
    local all_healthy=true
    
    # Check each service
    echo -e "${SHIELD} Checking service health:"
    
    if ! check_service_health "Frontend" "http://localhost:3000"; then
        all_healthy=false
    fi
    
    if ! check_service_health "Agent" "http://localhost:8000/health"; then
        all_healthy=false
    fi
    
    if ! check_service_health "Middleware" "http://localhost:8001/health"; then
        all_healthy=false
    fi
    
    if ! check_service_health "MCP Server" "http://localhost:5001/health"; then
        all_healthy=false
    fi
    
    if ! check_service_health "Keycloak" "http://localhost:8080/realms/zerotrust"; then
        all_healthy=false
    fi
    
    if ! check_service_health "OPA" "http://localhost:8181/health"; then
        all_healthy=false
    fi
    
    echo
    
    # Step 9: Container status summary
    echo -e "${PURPLE}Step 9: Container status summary${NC}"
    echo -e "${SHIELD} Service Status:"
    
    check_container_status "frontend"
    check_container_status "agent"
    check_container_status "middleware"
    check_container_status "mcp-server"
    check_container_status "auth-service"
    check_container_status "opa"
    check_container_status "postgres_us"
    check_container_status "postgres_eu"
    check_container_status "postgres_sbx"
    check_container_status "logger"
    
    echo
    
    # Final status
    if $all_healthy; then
        echo -e "${WHITE}${ROCKET} DEPLOYMENT SUCCESSFUL! ${ROCKET}${NC}"
        echo -e "${WHITE}================================${NC}"
        echo -e "${GREEN}${CHECKMARK} Zero Trust Architecture is running${NC}"
        echo -e "${GREEN}${CHECKMARK} All services are healthy${NC}"
        echo -e "${GREEN}${CHECKMARK} Databases populated with AI-generated data${NC}"
        echo
        echo -e "${CYAN}${GLOBE} Access URLs:${NC}"
        echo -e "  ${WHITE}Frontend:${NC}     http://localhost:3000"
        echo -e "  ${WHITE}Keycloak:${NC}     http://localhost:8080"
        echo -e "  ${WHITE}Agent API:${NC}    http://localhost:8000"
        echo -e "  ${WHITE}Middleware:${NC}   http://localhost:8001"
        echo -e "  ${WHITE}MCP Server:${NC}   http://localhost:5001"
        echo
        echo -e "${YELLOW}${BRAIN} Test Accounts:${NC}"
        echo -e "  ${WHITE}Therapist:${NC}    sarah_therapist / password"
        echo -e "  ${WHITE}Admin:${NC}        alice_admin_us / password"
        echo -e "  ${WHITE}Analyst:${NC}      maya_analyst / password"
        echo -e "  ${WHITE}Support:${NC}      leo_support / password"
        echo -e "  ${WHITE}Superuser:${NC}    superdev / password"
        echo
        echo -e "${GREEN}Ready to demonstrate zero-trust security! ${SHIELD}${NC}"
    else
        echo -e "${RED}${CROSS} DEPLOYMENT COMPLETED WITH ISSUES${NC}"
        echo -e "${YELLOW}Some services may not be fully healthy. Check logs with:${NC}"
        echo -e "${WHITE}docker-compose logs [service-name]${NC}"
    fi
}

# Cleanup function
cleanup_deployment() {
    echo -e "${YELLOW}Cleaning up deployment...${NC}"
    show_progress 15 "Stopping all services..."
    docker-compose down --remove-orphans > /dev/null 2>&1
    echo -e "${GREEN}${CHECKMARK} Cleanup complete${NC}"
}

# Show logs function
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        echo -e "${BLUE}Available services:${NC}"
        docker-compose config --services
        echo
        echo -e "${YELLOW}Usage: $0 logs [service-name]${NC}"
        return
    fi
    
    echo -e "${BLUE}Showing logs for ${service}...${NC}"
    docker-compose logs -f "$service"
}

# Status function
show_status() {
    echo -e "${WHITE}${SHIELD} Zero Trust Architecture Status${NC}"
    echo -e "${WHITE}================================${NC}\n"
    
    echo -e "${PURPLE}Container Status:${NC}"
    docker-compose ps
    echo
    
    echo -e "${PURPLE}Service Health:${NC}"
    check_service_health "Frontend" "http://localhost:3000" || true
    check_service_health "Agent" "http://localhost:8000/health" || true
    check_service_health "Middleware" "http://localhost:8001/health" || true
    check_service_health "MCP Server" "http://localhost:5001/health" || true
    check_service_health "Keycloak" "http://localhost:8080/realms/zerotrust" || true
    check_service_health "OPA" "http://localhost:8181/health" || true
}

# Test progress bars function
test_progress_bars() {
    echo -e "${WHITE}Testing Enhanced ANSI Progress Bars${NC}"
    echo -e "${WHITE}===================================${NC}\n"
    
    echo -e "${PURPLE}Testing Classic Style:${NC}"
    show_advanced_progress 20 "Classic progress bar demo" "classic"
    echo
    
    echo -e "${PURPLE}Testing Modern Style:${NC}"
    show_advanced_progress 15 "Modern progress bar demo" "modern"
    echo
    
    echo -e "${PURPLE}Testing Dots Style:${NC}"
    show_advanced_progress 12 "Dots progress bar demo" "dots"
    echo
    
    echo -e "${PURPLE}Testing Blocks Style:${NC}"
    show_advanced_progress 18 "Blocks progress bar demo" "blocks"
    echo
    
    echo -e "${PURPLE}Testing Different Spinners:${NC}"
    
    # Test braille spinner
    sleep 3 &
    show_spinner $! "Braille spinner test" "braille"
    
    # Test dots spinner
    sleep 2 &
    show_spinner $! "Dots spinner test" "dots"
    
    # Test line spinner
    sleep 2 &
    show_spinner $! "Line spinner test" "line"
    
    # Test arrow spinner
    sleep 3 &
    show_spinner $! "Arrow spinner test" "arrow"
    
    echo
    echo -e "${PURPLE}Testing Multi-Step Progress:${NC}"
    show_multi_progress "Initializing system" "Loading configuration" "Starting services" "Running health checks" "Finalizing setup"
    
    echo -e "${GREEN}${CHECKMARK} All progress bar tests completed successfully!${NC}"
}

# Help function
show_help() {
    echo -e "${WHITE}Zero Trust Architecture Deployment Tool${NC}"
    echo -e "${WHITE}=======================================${NC}\n"
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  $0 deploy    - Deploy the complete stack"
    echo -e "  $0 cleanup   - Stop and remove all containers"
    echo -e "  $0 status    - Show current deployment status"
    echo -e "  $0 logs      - Show available services for logging"
    echo -e "  $0 logs [service] - Show logs for specific service"
    echo -e "  $0 test      - Test enhanced progress bars"
    echo -e "  $0 help      - Show this help message"
    echo
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  $0 deploy"
    echo -e "  $0 logs frontend"
    echo -e "  $0 status"
    echo -e "  $0 cleanup"
    echo -e "  $0 test"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy_stack
        ;;
    "cleanup")
        cleanup_deployment
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "test")
        test_progress_bars
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac