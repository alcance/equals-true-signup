#!/bin/bash
# aws-setup.sh - AWS-specific setup and deployment script

set -e

# Colors
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Get EC2 instance metadata
get_instance_info() {
    print_status "Getting EC2 instance information..."
    
    # Try to get public IP from AWS metadata service
    if command -v curl &> /dev/null; then
        PUBLIC_IP=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")
        PRIVATE_IP=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/local-ipv4 2>/dev/null || echo "")
        INSTANCE_ID=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null || echo "")
        AZ=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/placement/availability-zone 2>/dev/null || echo "")
    fi
    
    if [ -n "$PUBLIC_IP" ]; then
        print_success "Running on EC2 instance"
        echo "   Instance ID: $INSTANCE_ID"
        echo "   Public IP: $PUBLIC_IP"
        echo "   Private IP: $PRIVATE_IP"
        echo "   Availability Zone: $AZ"
    else
        print_warning "Not running on EC2 or metadata service unavailable"
        echo "Please provide your server's public IP manually"
        read -p "Enter your server's public IP: " PUBLIC_IP
    fi
    
    if [ -z "$PUBLIC_IP" ]; then
        print_error "Public IP is required for AWS deployment"
        exit 1
    fi
}

# Generate AWS-optimized environment file
create_aws_env() {
    print_status "Creating AWS-optimized environment configuration..."
    
    # Generate secure secrets
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '/')
    else
        JWT_SECRET=$(head -c 64 /dev/urandom | base64 | tr -d '\n')
        DB_PASSWORD=$(head -c 32 /dev/urandom | base64 | tr -d '\n' | tr -d '/')
    fi
    
    # Backup existing file if it exists
    if [ -f .env.production ]; then
        cp .env.production .env.production.backup.$(date +%s)
        print_warning "Backed up existing .env.production"
    fi
    
    # Create AWS-optimized environment file
    cat > .env.production << EOF
# AWS EC2 Deployment Configuration
# Generated on: $(date)
# Instance: $INSTANCE_ID ($PUBLIC_IP)

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

# Frontend Configuration - AWS EC2
VITE_API_URL=http://${PUBLIC_IP}:3001/api

# AWS Specific
AWS_REGION=${AZ%?}
PUBLIC_IP=${PUBLIC_IP}
PRIVATE_IP=${PRIVATE_IP}

# Optional: Custom domain configuration
# Uncomment and update when you have a domain
# VITE_API_URL=https://api.yourdomain.com
# FRONTEND_URL=https://yourdomain.com
EOF
    
    print_success "AWS environment configuration created"
    echo "   API URL: http://${PUBLIC_IP}:3001/api"
    echo "   Frontend URL: http://${PUBLIC_IP}:3000"
}

# Update docker-compose for AWS
update_docker_compose() {
    print_status "Updating Docker Compose for AWS deployment..."
    
    # Create AWS-optimized docker-compose file
    cat > docker-compose.aws.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: signup-db-aws
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-signupdb}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data_aws:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - signup-network
    # Only expose to internal network
    expose:
      - "5432"

  backend:
    build:
      context: ./backend
      target: production
    container_name: signup-backend-aws
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3001
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - signup-network
    command: sh -c "pnpm prisma migrate deploy && pnpm start"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      target: production
      args:
        - VITE_API_URL=${VITE_API_URL}
    container_name: signup-frontend-aws
    ports:
      - "80:80"
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - signup-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data_aws:
    driver: local

networks:
  signup-network:
    driver: bridge
EOF
    
    print_success "AWS Docker Compose configuration created"
}

# Create AWS deployment script
create_aws_deploy_script() {
    print_status "Creating AWS deployment script..."
    
    cat > deploy-aws.sh << 'EOF'
#!/bin/bash
# deploy-aws.sh - AWS-specific deployment script

set -e

echo "🚀 Deploying to AWS EC2..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | grep -v '^$' | xargs)
else
    echo "❌ .env.production not found!"
    exit 1
fi

# Determine compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

# Stop existing services
echo "🛑 Stopping existing services..."
$COMPOSE_CMD -f docker-compose.aws.yml down 2>/dev/null || true

# Clean up
echo "🧹 Cleaning up..."
docker system prune -f

# Build and start services
echo "📦 Building services..."
$COMPOSE_CMD -f docker-compose.aws.yml build --no-cache

echo "🚀 Starting services..."
$COMPOSE_CMD -f docker-compose.aws.yml up -d

# Wait for services
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check health
echo "🩺 Checking service health..."
if curl -f -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    $COMPOSE_CMD -f docker-compose.aws.yml logs backend
    exit 1
fi

if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
    $COMPOSE_CMD -f docker-compose.aws.yml logs frontend
    exit 1
fi

echo ""
echo "🎉 AWS deployment completed successfully!"
echo ""
echo "🌐 Your application is now live:"
echo "   Frontend: http://${PUBLIC_IP}:3000"
echo "   Frontend (HTTP): http://${PUBLIC_IP}"
echo "   Backend API: http://${PUBLIC_IP}:3001/api"
echo "   API Documentation: http://${PUBLIC_IP}:3001/api/docs"
echo ""
echo "📊 Service Status:"
$COMPOSE_CMD -f docker-compose.aws.yml ps
EOF

    chmod +x deploy-aws.sh
    print_success "AWS deployment script created"
}

# Create monitoring and management scripts
create_management_scripts() {
    print_status "Creating management scripts..."
    
    # Create status script
    cat > status.sh << 'EOF'
#!/bin/bash
# status.sh - Check application status

echo "📊 Application Status on AWS EC2"
echo "================================="

# Load environment
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | grep -v '^$' | xargs)
fi

# Determine compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

echo ""
echo "🐳 Docker Services:"
$COMPOSE_CMD -f docker-compose.aws.yml ps

echo ""
echo "🩺 Health Checks:"
echo -n "Backend: "
if curl -f -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

echo -n "Frontend: "
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

echo ""
echo "💾 System Resources:"
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "Disk: $(df -h / | grep / | awk '{print $3 "/" $2}')"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"

echo ""
echo "🌐 Access URLs:"
echo "Frontend: http://${PUBLIC_IP}:3000"
echo "Backend: http://${PUBLIC_IP}:3001/api"
echo "API Docs: http://${PUBLIC_IP}:3001/api/docs"
EOF

    # Create update script
    cat > update.sh << 'EOF'
#!/bin/bash
# update.sh - Update application

set -e

echo "🔄 Updating application..."

# Pull latest changes
if [ -d .git ]; then
    echo "📥 Pulling latest code..."
    git pull origin main
fi

# Deploy
echo "🚀 Deploying updates..."
./deploy-aws.sh

echo "✅ Update completed!"
EOF

    # Create backup script
    cat > backup.sh << 'EOF'
#!/bin/bash
# backup.sh - Backup database

set -e

echo "💾 Creating database backup..."

# Load environment
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | grep -v '^$' | xargs)
fi

# Create backup directory
mkdir -p backups

# Create backup filename with timestamp
BACKUP_FILE="backups/backup-$(date +%Y%m%d-%H%M%S).sql"

# Determine compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

# Create backup
$COMPOSE_CMD -f docker-compose.aws.yml exec -T db pg_dump -U postgres signupdb > "$BACKUP_FILE"

echo "✅ Database backup created: $BACKUP_FILE"

# Keep only last 7 backups
ls -t backups/backup-*.sql | tail -n +8 | xargs rm -f 2>/dev/null || true

echo "🧹 Old backups cleaned up"
EOF

    chmod +x status.sh update.sh backup.sh
    print_success "Management scripts created"
}

# Main function
main() {
    echo ""
    print_status "🚀 Setting up EQUALS TRUE Sign-Up App for AWS EC2..."
    echo ""
    
    get_instance_info
    create_aws_env
    update_docker_compose
    create_aws_deploy_script
    create_management_scripts
    
    echo ""
    print_success "🎉 AWS setup completed!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Review .env.production configuration"
    echo "  2. Deploy with: ./deploy-aws.sh"
    echo "  3. Check status with: ./status.sh"
    echo ""
    echo "🔗 After deployment, access your app at:"
    echo "  Frontend: http://${PUBLIC_IP}:3000"
    echo "  Backend: http://${PUBLIC_IP}:3001/api"
    echo ""
    echo "🛠️ Management commands:"
    echo "  ./status.sh    - Check application status"
    echo "  ./update.sh    - Update application"
    echo "  ./backup.sh    - Backup database"
    echo ""
}

main "$@"