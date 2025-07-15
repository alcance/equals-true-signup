# Development stage
FROM node:18-alpine as development
WORKDIR /app

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

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --prod

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN pnpm prisma generate

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3001
CMD ["pnpm", "start"]