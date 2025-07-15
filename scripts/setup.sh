#!/bin/bash
# setup.sh - Quick setup script for production deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Generate secure secrets
generate_secrets() {
    print_status "Generating secure secrets..."
    
    # Check if openssl is available
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '/')
    else
        # Fallback method using /dev/urandom
        JWT_SECRET=$(head -c 64 /dev/urandom | base64 | tr -d '\n')
        DB_PASSWORD=$(head -c 32 /dev/urandom | base64 | tr -d '\n' | tr -d '/')
    fi
    
    print_success "Secure secrets generated"
}

# Create production environment file
create_env_file() {
    print_status "Creating production environment file..."
    
    if [ -f .env.production ]; then
        print_warning ".env.production already exists. Creating backup..."
        cp .env.production .env.production.backup.$(date +%s)
    fi
    
    cat > .env.production << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/signupdb
POSTGRES_DB=signupdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${DB_PASSWORD}

# JWT Configuration  
JWT_SECRET=${JWT_SECRET}

# API Configuration
PORT=3001
NODE_ENV=production

# Frontend Configuration
VITE_API_URL=http://localhost:3001/api

# Optional: For AWS deployment (uncomment and update when deploying to AWS)
# DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/signupdb
# VITE_API_URL=https://your-api-domain.com/api
EOF
    
    print_success "Production environment file created"
}

# Make scripts executable
make_scripts_executable() {
    print_status "Making deployment scripts executable..."
    
    chmod +x deploy.sh 2>/dev/null || true
    chmod +x cleanup.sh 2>/dev/null || true  
    chmod +x test-deployment.sh 2>/dev/null || true
    
    print_success "Scripts are now executable"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if command -v pnpm &> /dev/null; then
        print_status "Installing root dependencies..."
        pnpm install
        
        print_status "Installing backend dependencies..."
        cd backend && pnpm install && cd ..
        
        print_status "Installing frontend dependencies..."
        cd frontend && pnpm install && cd ..
        
        print_success "All dependencies installed"
    else
        print_warning "pnpm not found. Please install dependencies manually:"
        echo "  1. Install pnpm: npm install -g pnpm"
        echo "  2. Run: pnpm install (in root, backend, and frontend directories)"
    fi
}

# Main setup function
main() {
    echo ""
    print_status "🛠️  Setting up EQUALS TRUE Sign-Up Application for production..."
    echo ""
    
    generate_secrets
    create_env_file
    make_scripts_executable
    install_dependencies
    
    echo ""
    print_success "🎉 Setup completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Review and customize .env.production if needed"
    echo "  2. Deploy with: ./deploy.sh"
    echo "  3. Test with: ./test-deployment.sh"
    echo ""
    echo "🔐 Important Security Notes:"
    echo "  • Keep .env.production secure and never commit it to Git"
    echo "  • Change default secrets before production use"
    echo "  • Use proper secret management in AWS (AWS Secrets Manager)"
    echo ""
    echo "🌐 After deployment, your app will be available at:"
    echo "  • Frontend: http://localhost:3000"
    echo "  • Backend:  http://localhost:3001/api"
    echo ""
}

main "$@"