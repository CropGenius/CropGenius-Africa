#!/bin/bash

# 🚀 CROPGENIUS DEPLOYMENT SCRIPTS
# Environment-driven deployment for deterministic builds

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌾 CropGenius Deployment System${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to validate environment files
validate_env_file() {
    local env_file=$1
    local env_name=$2
    
    echo -e "${YELLOW}🔍 Validating $env_name environment file...${NC}"
    
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}❌ $env_file not found!${NC}"
        exit 1
    fi
    
    # Check for required Supabase variables
    required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "APP_URL" "AUTH_CALLBACK_URL")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" && ! grep -q "^VITE_${var}=" "$env_file" && ! grep -q "^NEXT_PUBLIC_${var}=" "$env_file"; then
            echo -e "${RED}❌ Missing required variable: $var${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}✅ $env_name environment validated${NC}"
}

# Function to deploy to Vercel
deploy_to_vercel() {
    local env_file=$1
    local env_name=$2
    local vercel_flags=$3
    
    echo -e "${BLUE}🚀 Deploying to Vercel ($env_name)...${NC}"
    
    # Copy environment file to root for Vercel to pick up
    cp "$env_file" .env.local
    
    # Deploy with Vercel
    if [ "$env_name" = "production" ]; then
        vercel --prod $vercel_flags
    else
        vercel $vercel_flags
    fi
    
    # Clean up
    rm -f .env.local
    
    echo -e "${GREEN}✅ $env_name deployment completed${NC}"
}

# Function to run local development
run_local() {
    echo -e "${BLUE}🏠 Starting local development server...${NC}"
    
    validate_env_file ".envs/.env.local" "local"
    
    # Copy local env file
    cp .envs/.env.local .env.local
    
    echo -e "${GREEN}✅ Environment configured for local development${NC}"
    echo -e "${YELLOW}Run: npm run dev${NC}"
}

# Function to deploy staging
deploy_staging() {
    echo -e "${BLUE}🚧 Deploying to staging...${NC}"
    
    validate_env_file ".envs/.env.staging" "staging"
    deploy_to_vercel ".envs/.env.staging" "staging" "--env-file .envs/.env.staging"
}

# Function to deploy production
deploy_production() {
    echo -e "${BLUE}🌍 Deploying to production...${NC}"
    
    validate_env_file ".envs/.env.production" "production"
    
    # Extra validation for production
    echo -e "${YELLOW}🔒 Running production security checks...${NC}"
    
    # Check for debug flags (should be false in production)
    if grep -q "ENABLE_DEBUG_LOGGING=true" .envs/.env.production; then
        echo -e "${RED}❌ Debug logging enabled in production!${NC}"
        exit 1
    fi
    
    deploy_to_vercel ".envs/.env.production" "production" "--env-file .envs/.env.production"
    
    echo -e "${GREEN}🎉 Production deployment completed!${NC}"
    echo -e "${GREEN}Visit: https://cropgenius.africa${NC}"
}

# Function to show environment status
show_env_status() {
    echo -e "${BLUE}📊 Environment Status${NC}"
    echo -e "${BLUE}===================${NC}"
    
    for env in "local" "staging" "production"; do
        env_file=".envs/.env.$env"
        if [ -f "$env_file" ]; then
            echo -e "${GREEN}✅ $env: $env_file${NC}"
            
            # Show key variables
            echo -e "   ${YELLOW}App URL:${NC} $(grep -E '^(VITE_)?APP_URL=' "$env_file" | cut -d'=' -f2 | tr -d '\"')"
            echo -e "   ${YELLOW}Environment:${NC} $(grep -E '^(VITE_)?NODE_ENV=' "$env_file" | cut -d'=' -f2 | tr -d '\"')"
        else
            echo -e "${RED}❌ $env: $env_file (missing)${NC}"
        fi
    done
}

# Main script logic
case "$1" in
    "local")
        run_local
        ;;
    "staging")
        deploy_staging
        ;;
    "production")
        deploy_production
        ;;
    "status")
        show_env_status
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 {local|staging|production|status}${NC}"
        echo -e "${YELLOW}Examples:${NC}"
        echo -e "  $0 local      # Setup local development"
        echo -e "  $0 staging    # Deploy to staging"
        echo -e "  $0 production # Deploy to production"
        echo -e "  $0 status     # Show environment status"
        exit 1
        ;;
esac