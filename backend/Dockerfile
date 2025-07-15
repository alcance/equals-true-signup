# Development stage
FROM node:18-alpine as development
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first (for better caching)
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy prisma schema
COPY prisma ./prisma
RUN pnpm prisma generate

# Copy source code
COPY . .

EXPOSE 3001
CMD ["pnpm", "run", "dev"]

# Build stage
FROM node:18-alpine as builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN pnpm prisma generate

# Copy source and build
COPY . .
RUN pnpm run build

# Production stage
FROM node:18-alpine as production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install production dependencies
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Copy prisma schema and built application
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Generate Prisma client for production
RUN pnpm prisma generate

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

EXPOSE 3001

# Start the application
CMD ["pnpm", "start"]
