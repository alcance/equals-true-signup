FROM node:20-alpine as production
WORKDIR /app

# Install build dependencies for native modules (bcrypt needs these)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    linux-headers \
    libc6-compat

# Create non-root user for Express app
RUN addgroup -g 1001 -S expressjs && \
    adduser -S appuser -u 1001 -G expressjs

# Use corepack to enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files first
COPY package*.json ./
# Don't copy pnpm-lock.yaml to force fresh resolution

# Clear any existing pnpm cache and install fresh
RUN pnpm store prune && \
    pnpm install --no-frozen-lockfile --shamefully-hoist

# Copy source code (including prisma directory!)
COPY . .

# Generate Prisma client (this should work now)
RUN pnpm prisma generate

# Build TypeScript
RUN pnpm run build

# Rebuild bcrypt specifically for Alpine Linux using pnpm
RUN pnpm rebuild bcrypt

# Change ownership to non-root user
RUN chown -R appuser:expressjs /app
USER appuser

EXPOSE 3001
CMD ["pnpm", "start"]