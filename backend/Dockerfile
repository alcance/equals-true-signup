FROM node:20-alpine as production
WORKDIR /app

# Install build dependencies for native modules (bcrypt needs these)
RUN apk add --no-cache python3 make g++ linux-headers libc6-compat

# Create non-root user for Express app
RUN addgroup -g 1001 -S expressjs && adduser -S appuser -u 1001 -G expressjs

# Use corepack to enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files first
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies with proper frozen lockfile handling
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build TypeScript
RUN pnpm run build

# Force rebuild bcrypt for Alpine Linux architecture
RUN pnpm rebuild bcrypt

# Change ownership to non-root user
RUN chown -R appuser:expressjs /app
USER appuser

EXPOSE 3001
CMD ["pnpm", "start"]
