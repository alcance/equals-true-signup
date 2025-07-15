#!/bin/bash
# deploy-simple.sh - Super simple AWS deployment

set -e

echo "🚀 Deploying EQUALS TRUE to AWS..."

# 1. Get server IP automatically
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
echo "📍 Server IP: $PUBLIC_IP"

# 2. Create simple environment file
cat > .env.production << EOF
DATABASE_URL=postgresql://postgres:mypassword123@db:5432/signupdb
JWT_SECRET=super-secret-jwt-key-for-production
VITE_API_URL=http://${PUBLIC_IP}:3001/api
POSTGRES_PASSWORD=mypassword123
EOF

echo "✅ Environment configured"

# 3. Stop any existing containers
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# 4. Build and start
echo "📦 Building application..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# 5. Wait a moment
echo "⏳ Waiting for services..."
sleep 30

# 6. Check if everything works
if curl -f -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start" 
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "🌐 Access your app:"
echo "   Frontend: http://${PUBLIC_IP}:3000"
echo "   Backend:  http://${PUBLIC_IP}:3001/api"
echo ""
echo "📊 Check status: docker-compose -f docker-compose.prod.yml ps"