# Development stage
FROM node:18-alpine as development
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source code
COPY . .
RUN pnpm prisma generate

EXPOSE 3001
CMD ["pnpm", "run", "dev"]

# Build stage
FROM node:18-alpine as builder
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source and build
COPY . .
RUN pnpm prisma generate
RUN pnpm run build

# Production stage
FROM node:18-alpine as production
WORKDIR /app

# Install build dependencies for native modules (needed for bcrypt)
RUN apk add --no-cache python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy built application and prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client
RUN pnpm prisma generate

# Rebuild native modules for this environment
RUN pnpm rebuild bcrypt

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3001
CMD ["pnpm", "start"]
