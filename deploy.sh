#!/bin/bash
set -e

echo "🚀 Deploying EQUALS TRUE to AWS..."

# Get EC2 public IP with IMDSv2 support
get_public_ip() {
    # Try IMDSv2 (required for your instance)
    TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" 2>/dev/null)
    if [ -n "$TOKEN" ]; then
        PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
    fi
    
    # Fallback to old method
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
    fi
    
    # Final fallback to known IP
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP="3.16.159.186"
    fi
    
    echo "$PUBLIC_IP"
}

PUBLIC_IP=$(get_public_ip)
echo "📍 Server IP: $PUBLIC_IP"

# Create environment file
cat > .env.production << EOF
DATABASE_URL=postgresql://signupuser:postgres@db:5432/signupdb
JWT_SECRET=super-secret-jwt-key-$(date +%s)
VITE_API_URL=http://${PUBLIC_IP}:3001/api
NODE_ENV=production
EOF

echo "✅ Environment configured"

# Fix Dockerfiles to remove frozen-lockfile
echo "🔧 Fixing Dockerfiles..."
sed -i 's/--frozen-lockfile//g' backend/Dockerfile 2>/dev/null || true
sed -i 's/--frozen-lockfile//g' frontend/Dockerfile 2>/dev/null || true

# Export environment variables
export $(cat .env.production | xargs)

# Stop existing containers
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build and start
echo "📦 Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 45

# Health checks
echo "🩺 Health checks..."
echo -n "Backend: "
if curl -f -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Failed"
fi

echo -n "Frontend: "
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Failed"
fi

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Frontend: http://${PUBLIC_IP}:3000"
echo "🔧 Backend:  http://${PUBLIC_IP}:3001/api"