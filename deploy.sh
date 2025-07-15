#!/bin/bash
set -e

echo "🚀 Deploying EQUALS TRUE Sign-Up App to AWS..."

# Get EC2 public IP automatically
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
echo "📍 Server IP: $PUBLIC_IP"

# Create production environment file
cat > .env.production << EOF
DATABASE_URL=postgresql://signupuser:postgres@db:5432/signupdb
JWT_SECRET=super-secret-jwt-key-for-production-$(date +%s)
VITE_API_URL=http://${PUBLIC_IP}:3001/api
NODE_ENV=production
POSTGRES_DB=signupdb
POSTGRES_USER=signupuser
POSTGRES_PASSWORD=postgres
EOF

echo "✅ Environment configuration created"

# Export environment variables for Docker Compose
export $(cat .env.production | grep -v '^#' | xargs)

# Stop any existing containers
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Clean up Docker resources
echo "🧹 Cleaning up resources..."
docker system prune -f 2>/dev/null || true

# Build and start services
echo "📦 Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 45

# Health checks
echo "🩺 Performing health checks..."

# Check database
echo -n "Database: "
if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U signupuser > /dev/null 2>&1; then
    echo "✅ Ready"
else
    echo "❌ Not ready"
fi

# Check backend
echo -n "Backend API: "
if curl -f -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "⚠️  Starting up..."
    sleep 15
    if curl -f -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Now running"
    else
        echo "❌ Failed to start"
        echo "Backend logs:"
        docker-compose -f docker-compose.prod.yml logs --tail=10 backend
    fi
fi

# Check frontend
echo -n "Frontend: "
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not accessible"
    echo "Frontend logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=10 frontend
fi

# Show final status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:     http://${PUBLIC_IP}:3000"
echo "   Backend API:  http://${PUBLIC_IP}:3001/api"
echo "   API Docs:     http://${PUBLIC_IP}:3001/api/docs"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop all:     docker-compose -f docker-compose.prod.yml down"
echo "   Restart:      ./deploy-simple.sh"
echo ""
echo "🎯 Test your app:"
echo "   curl http://${PUBLIC_IP}:3001/api/health"
echo "   curl http://${PUBLIC_IP}:3000"