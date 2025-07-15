# EQUALS TRUE Sign-Up Flow

A full-stack TypeScript application with React frontend, Express backend, and PostgreSQL database, containerized with Docker and ready for AWS deployment.

**🎯 Live Demo**: [http://3.16.159.186](http://3.16.159.186) | **API**: [http://3.16.159.186:3001/api](http://3.16.159.186:3001/api)  | **Swagger Docs**: [http://3.16.159.186:3001/api/docs](http://3.16.159.186:3001/api/docs)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git
- AWS EC2 instance (for production deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd equals-true-signup
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Swagger Documentation: http://localhost:3001/api/docs

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Express.js + TypeScript + Prisma ORM
- **Database**: PostgreSQL 15
- **Authentication**: JWT + bcrypt
- **Infrastructure**: Docker + Docker Compose
- **Deployment**: AWS EC2

### Key Features
- ✅ Secure JWT Authentication with bcrypt password hashing
- ✅ Full TypeScript implementation across the stack
- ✅ Real-time form validation and user feedback
- ✅ Responsive design with Tailwind CSS and animations
- ✅ Comprehensive input validation and rate limiting
- ✅ Swagger API documentation
- ✅ Docker containerization for consistent environments
- ✅ Health checks and monitoring endpoints
- ✅ Production-ready AWS deployment

## 📁 Project Structure

```
equals-true-signup/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Authentication, validation, error handling
│   │   ├── routes/           # API route definitions
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/          # Helper functions and utilities
│   ├── prisma/            # Database schema and migrations
│   ├── tests/            # Unit and integration tests
│   └── Dockerfile       # Backend container configuration
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/    # React context providers
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API service layer
│   │   ├── types/     # TypeScript interfaces
│   │   └── utils/    # Utility functions
│   ├── public/      # Static assets
│   └── Dockerfile  # Frontend container configuration
├── docker-compose.yml     # Development environment
├── docker-compose.prod.yml # Production environment
├── deploy.sh             # AWS deployment script
└── README.md            # This file
```

## 🌐 AWS Production Deployment

### Prerequisites for AWS Deployment
- AWS EC2 instance (t3.medium or larger recommended)
- Security Group with proper inbound rules
- Docker and Docker Compose installed on EC2

### AWS EC2 Setup

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium or larger
   - Storage: 20GB+ EBS

2. **Configure Security Group**
   ```
   Type        Protocol    Port Range    Source          Description
   SSH         TCP         22           0.0.0.0/0       SSH access
   HTTP        TCP         80           0.0.0.0/0       Frontend access
   HTTPS       TCP         443          0.0.0.0/0       HTTPS (future)
   Custom TCP  TCP         3000         0.0.0.0/0       Frontend (alternative)
   Custom TCP  TCP         3001         0.0.0.0/0       Backend API
   ```

3. **Install Dependencies on EC2**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   sudo apt install docker.io docker-compose -y
   sudo usermod -aG docker ubuntu
   sudo systemctl enable docker
   sudo systemctl start docker

   # Install Node.js and pnpm (for development)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pnpm
   
   # Logout and login again for Docker group to take effect
   ```

### Deployment Steps

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd equals-true-signup
   ```

2. **Deploy to AWS**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Access your application**
   - Frontend: `http://YOUR_EC2_IP`
   - Backend: `http://YOUR_EC2_IP:3001/api`
   - API Docs: `http://YOUR_EC2_IP:3001/api/docs`

### Environment Configuration

The deployment script automatically creates `.env.production` with:
```env
DATABASE_URL=postgresql://signupuser:postgres@db:5432/signupdb
JWT_SECRET=super-secret-jwt-key-<timestamp>
VITE_API_URL=http://YOUR_EC2_IP:3001/api
NODE_ENV=production
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pnpm test                    # Run all tests
pnpm test:watch             # Run tests in watch mode
pnpm test:coverage          # Run tests with coverage
```

### Frontend Tests
```bash
cd frontend
pnpm test                   # Run all tests
pnpm test:ui               # Run tests with UI
```

### Integration Testing
```bash
# Run from root directory
pnpm test                  # Run all backend and frontend tests
```

## 📚 API Documentation

### Available Endpoints

**Authentication**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

**Health & Monitoring**
- `GET /api/health` - Application health check
- `GET /api` - API information

### Interactive Documentation
Visit `/api/docs` for complete Swagger documentation with request/response examples.

### Example API Usage

**Signup**
```bash
curl -X POST http://YOUR_IP:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Login**
```bash
curl -X POST http://YOUR_IP:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

## 🔧 Troubleshooting

### Complete System Cleanup (Nuclear Option)

When everything breaks, start fresh:

```bash
# 1. Complete Docker cleanup
docker system prune -af

# 2. System cleanup (use carefully!)
sudo apt-get clean
sudo rm -rf /var/log/*

# 3. Remove all project dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
rm -f pnpm-lock.yaml backend/pnpm-lock.yaml frontend/pnpm-lock.yaml

# 4. Fresh deployment
./deploy.sh
```

### Common Issues & Solutions

#### 1. **"Connection Refused" Error**
```bash
# Check container status
docker ps

# Restart services
docker-compose down && docker-compose up -d

# Check logs
docker logs equals-true-signup-frontend-1
docker logs equals-true-signup-backend-1
```

#### 2. **"Failed to construct 'URL': Invalid URL"**
This indicates wrong API URL configuration.

```bash
# Check .env.production
cat .env.production

# Should show: VITE_API_URL=http://YOUR_IP:3001/api
# If missing IP, fix and rebuild:
vim .env.production  # Add correct IP
docker-compose build --no-cache frontend
docker-compose up -d
```

#### 3. **Database Connection Issues**
Complete database troubleshooting sequence:

```bash
# Check if database is accessible
docker exec equals-true-signup-db-1 pg_isready -U signupuser -d signupdb

# Run database migrations
docker exec equals-true-signup-backend-1 pnpm prisma migrate deploy

# Or force create tables if migrations fail
docker exec equals-true-signup-backend-1 pnpm prisma db push

# Generate Prisma client
docker exec equals-true-signup-backend-1 pnpm prisma generate

# Restart backend to reload Prisma client
docker restart equals-true-signup-backend-1
```

#### 4. **Swagger Documentation Not Loading**
Fix nginx proxy configuration for API documentation:

```bash
# 1. Update nginx.conf file
sed -i 's|location /api {|location /api/ {|g' frontend/nginx.conf
sed -i 's|proxy_pass http://backend:3001;|proxy_pass http://backend:3001/api/;|g' frontend/nginx.conf

# 2. Rebuild frontend
docker-compose down
docker image rm equals-true-signup-frontend
docker-compose build --no-cache frontend
docker-compose up -d

# 3. Test swagger
curl -I http://localhost:80/api/docs/
```

**Access Swagger at**: http://YOUR_IP/api/docs/ or http://YOUR_IP:3001/api/docs/

#### 5. **bcrypt/Native Module Issues**
```bash
# Clean rebuild with dependency refresh
docker-compose down
docker system prune -f
rm -rf node_modules backend/node_modules frontend/node_modules
docker-compose build --no-cache
docker-compose up -d
```

#### 6. **Container Shows "Unhealthy"**
```bash
# Check health check logs
docker inspect equals-true-signup-frontend-1 --format='{{range .State.Health.Log}}{{.Output}}{{end}}'

# Test manual health check
curl http://localhost/health

# If health check fails but app works, it's usually just a health check script issue
```

#### 7. **Frontend Container Won't Start**
```bash
# Check frontend build logs
docker logs equals-true-signup-frontend-1

# Common fix - rebuild with correct environment
export $(cat .env.production | xargs)
docker-compose build --no-cache frontend
docker-compose up -d
```

#### 8. **API Requests Fail (500 errors)**
```bash
# Check backend logs for errors
docker logs equals-true-signup-backend-1 --tail 50

# Common database-related fix sequence
docker exec equals-true-signup-backend-1 pnpm prisma generate
docker exec equals-true-signup-backend-1 pnpm prisma db push
docker restart equals-true-signup-backend-1

# Wait and test
sleep 15
curl -s http://localhost:3001/api/health
```

### Debug Commands

**System Status**
```bash
# Container status
docker ps -a

# Service logs
docker logs equals-true-signup-backend-1 --tail 50
docker logs equals-true-signup-frontend-1 --tail 50

# Test connectivity
curl -I http://localhost:3001/api/health
curl -I http://localhost:3000
```

**Database Debug**
```bash
# Connect to database
docker exec -it equals-true-signup-db-1 psql -U signupuser -d signupdb

# Check tables
docker exec equals-true-signup-db-1 psql -U signupuser -d signupdb -c "\dt"

# Check users table
docker exec equals-true-signup-db-1 psql -U signupuser -d signupdb -c "SELECT * FROM users LIMIT 5;"
```

**Application Debug**
```bash
# Check environment variables
docker exec equals-true-signup-backend-1 printenv | grep -E "(DATABASE|JWT|NODE_ENV)"

# Test backend directly
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@test.com","password":"Test123456"}'
```

### Performance Monitoring

**Resource Usage**
```bash
# Container resource usage
docker stats

# System resources
free -h && df -h
```

**Health Monitoring**
```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
while true; do
  echo "$(date): Checking health..."
  curl -s http://localhost:3001/api/health | jq '.data.uptime' || echo "Backend down"
  curl -s http://localhost:3000 > /dev/null && echo "Frontend OK" || echo "Frontend down"
  sleep 30
done
EOF

chmod +x monitor.sh && ./monitor.sh
```

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based auth with expiration
- **Input Validation**: Comprehensive server-side validation with Joi
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Isolation**: Separate development and production configs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## 🚀 Production Considerations

### Scaling
- Use AWS Application Load Balancer for multiple instances
- Implement Redis for session storage
- Use AWS RDS for managed PostgreSQL
- Consider AWS ECS or EKS for container orchestration

### Monitoring
- Implement logging with Winston or similar
- Add application performance monitoring (APM)
- Set up CloudWatch for AWS monitoring
- Configure alerts for health check failures

### Security Enhancements
- Use AWS Secrets Manager for sensitive data
- Implement SSL/TLS certificates
- Add request logging and audit trails
- Set up Web Application Firewall (WAF)

## 📊 Performance Metrics

**Target Performance**
- Frontend load time: < 2 seconds
- API response time: < 200ms
- Database query time: < 50ms
- Container startup time: < 30 seconds

**Monitoring Endpoints**
- Health: `/api/health`
- Status: Container health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**🎯 Assignment Goals Achieved**
- ✅ Full-stack TypeScript implementation
- ✅ Secure authentication with password hashing
- ✅ REST API with comprehensive documentation
- ✅ Responsive React frontend with validation
- ✅ Scalable architecture and clean code
- ✅ Docker containerization
- ✅ AWS cloud deployment
- ✅ Comprehensive testing strategy
- ✅ Production-ready security measures
- ✅ Detailed documentation and troubleshooting guides