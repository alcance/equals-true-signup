#!/bin/bash
# deploy-simple.sh - Super simple AWS deployment (Fixed)

set -e

echo "🚀 Deploying EQUALS TRUE to AWS..."

# 1. Get server IP automatically
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
echo "📍 Server IP: $PUBLIC_IP"

# 2. Create environment file with actual values
cat > .env.production << EOF
DATABASE_URL=postgresql://postgres:mypassword123@db:5432/signupdb
JWT_SECRET=super-secret-jwt-key-for-production-change-this-in-real-production
VITE_API_URL=http://${PUBLIC_IP}:3001/api
POSTGRES_PASSWORD=mypassword123
NODE_ENV=production
POSTGRES_DB=signupdb
POSTGRES_USER=postgres
EOF

echo "✅ Environment configured"

# 3. Fix Dockerfiles to not require frozen lockfile (common issue)
echo "🔧 Fixing Dockerfiles..."
if [ -f "backend/Dockerfile" ]; then
    sed -i 's/--frozen-lockfile//g' backend/Dockerfile 2>/dev/null || true
fi
if [ -f "frontend/Dockerfile" ]; then
    sed -i 's/--frozen-lockfile//g' frontend/Dockerfile 2>/dev/null || true
fi

# 4. Export environment variables for docker-compose
export $(cat .env.production | grep -v '^#' | xargs)

# 5. Stop any existing containers
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# 6. Clean up old images
echo "🧹 Cleaning up..."
docker system prune -f 2>/dev/null || true

# 7. Build services
echo "📦 Building application..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 8. Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# 9. Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# 10. Health checks with better error reporting
echo "🩺 Checking service health..."

# Check backend
echo -n "Backend API: "
if curl -f -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Failed"
    echo "Backend logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=10 backend
fi

# Check frontend
echo -n "Frontend: "
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Failed"
    echo "Frontend logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=10 frontend
fi

# 11. Show final status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://${PUBLIC_IP}:3000"
echo "   Backend:  http://${PUBLIC_IP}:3001/api"
echo "   API Docs: http://${PUBLIC_IP}:3001/api/docs"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop all:  docker-compose -f docker-compose.prod.yml down"
echo "   Restart:   ./deploy-simple.sh"
