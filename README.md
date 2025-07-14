# EQUALS TRUE Sign-Up Flow

A full-stack TypeScript application with React frontend, Express backend, and PostgreSQL database, containerized with Docker and ready for AWS deployment.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Development Setup

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
   - Backend API: http://localhost:3001
   - Swagger Documentation: http://localhost:3001/api/docs

## 📁 Project Structure

```
equals-true-signup/
├── backend/                 # Express.js API
├── frontend/               # React application
├── docker-compose.yml      # Development environment
└── README.md              # This file
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript + Prisma
- **Database**: PostgreSQL
- **Infrastructure**: Docker + Docker Compose

### Key Features
- JWT Authentication
- Password hashing with bcrypt
- Input validation
- Rate limiting
- Swagger API documentation
- TypeScript throughout
- Docker containerization

## 📚 API Documentation

Visit http://localhost:3001/api/docs for interactive API documentation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend
```

## 🚀 Deployment

Ready for AWS deployment with:
- ECS Fargate (backend)
- S3 + CloudFront (frontend)  
- RDS PostgreSQL (database)

## 📄 License

MIT License
