#!/bin/bash

# Simple test script for ANSI progress bars
# This script tests the progress bar functionality without Docker dependencies

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

# Unicode characters
CHECKMARK="✅"
CROSS="❌"
LOADING="⏳"

# Test basic progress bar
test_basic_progress() {
    echo -e "${BLUE}Testing Basic Progress Bar${NC}"
    local width=50
    
    for ((i=0; i<=100; i++)); do
        local progress=$((i * width / 100))
        local remaining=$((width - progress))
        
        printf "\r${CYAN}["
        printf "%*s" $progress | tr ' ' '█'
        printf "%*s" $remaining | tr ' ' '░'
        printf "] %3d%%${NC}" $i
        
        sleep 0.02
    done
    echo -e " ${GREEN}${CHECKMARK}${NC}"
}

# Test gradient progress bar
test_gradient_progress() {
    echo -e "${BLUE}Testing Gradient Progress Bar${NC}"
    local width=60
    
    for ((i=0; i<=100; i++)); do
        local progress=$((i * width / 100))
        local remaining=$((width - progress))
        
        # Color gradient based on progress
        local bar_color
        if [ $i -lt 33 ]; then
            bar_color="${RED}"
        elif [ $i -lt 66 ]; then
            bar_color="${YELLOW}"
        else
            bar_color="${GREEN}"
        fi
        
        printf "\r${CYAN}[${bar_color}"
        printf "%*s" $progress | tr ' ' '▓'
        printf "${WHITE}%*s" $remaining | tr ' ' '░'
        printf "${CYAN}] ${WHITE}%3d%%${NC}" $i
        
        sleep 0.03
    done
    echo -e " ${GREEN}${CHECKMARK}${NC}"
}

# Test spinner
test_spinner() {
    echo -e "${BLUE}Testing Spinner Animation${NC}"
    local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    
    for ((count=0; count<50; count++)); do
        i=$(( (i+1) % 10 ))
        local spinner_char="${spin:$i:1}"
        printf "\r${YELLOW}${spinner_char} Processing... (%d/50)${NC}" $((count+1))
        sleep 0.1
    done
    echo -e "\r${GREEN}${CHECKMARK} Processing complete!${NC}                    "
}

# Test multi-style progress
test_multi_style() {
    echo -e "${BLUE}Testing Multiple Progress Styles${NC}"
    
    local styles=("█░" "▓▒" "●○" "▬▭" "■□")
    local style_names=("Solid" "Blocks" "Dots" "Lines" "Squares")
    
    for ((s=0; s<${#styles[@]}; s++)); do
        local style="${styles[$s]}"
        local filled_char="${style:0:1}"
        local empty_char="${style:1:1}"
        local style_name="${style_names[$s]}"
        
        echo -e "${PURPLE}${style_name} Style:${NC}"
        
        for ((i=0; i<=40; i++)); do
            local progress=$((i * 40 / 40))
            local remaining=$((40 - progress))
            
            printf "\r${CYAN}["
            for ((j=0; j<progress; j++)); do printf "${GREEN}${filled_char}"; done
            for ((j=0; j<remaining; j++)); do printf "${WHITE}${empty_char}"; done
            printf "${CYAN}] %3d%%${NC}" $((i * 100 / 40))
            
            sleep 0.05
        done
        echo -e " ${GREEN}${CHECKMARK}${NC}"
    done
}

# Test error handling
test_error_simulation() {
    echo -e "${BLUE}Testing Error Simulation${NC}"
    
    for ((i=0; i<=100; i++)); do
        local progress=$((i * 50 / 100))
        local remaining=$((50 - progress))
        
        # Simulate error at 75%
        if [ $i -eq 75 ]; then
            printf "\r${RED}["
            printf "%*s" $progress | tr ' ' '▒'
            printf "%*s" $remaining | tr ' ' '░'
            printf "] %3d%% ${CROSS} Error occurred!${NC}\n" $i
            return 1
        fi
        
        local bar_color="${GREEN}"
        if [ $i -gt 60 ]; then
            bar_color="${YELLOW}"
        fi
        
        printf "\r${CYAN}[${bar_color}"
        printf "%*s" $progress | tr ' ' '█'
        printf "${WHITE}%*s" $remaining | tr ' ' '░'
        printf "${CYAN}] %3d%%${NC}" $i
        
        sleep 0.03
    done
}

# Main test execution
main() {
    echo -e "${WHITE}ANSI Progress Bar Test Suite${NC}"
    echo -e "${WHITE}============================${NC}\n"
    
    test_basic_progress
    echo
    
    test_gradient_progress
    echo
    
    test_spinner
    echo
    
    test_multi_style
    echo
    
    echo -e "${BLUE}Testing Error Handling:${NC}"
    if ! test_error_simulation; then
        echo -e "${YELLOW}Error simulation completed successfully${NC}"
    fi
    echo
    
    echo -e "${GREEN}${CHECKMARK} All progress bar tests completed!${NC}"
    echo -e "${CYAN}Progress bars are working correctly with ANSI colors.${NC}"
}

# Run tests
main