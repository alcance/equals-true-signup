# Production stage - Single stage to avoid bcrypt issues
FROM node:18-alpine as production
WORKDIR /app

# Install build dependencies for native modules (bcrypt needs these)
RUN apk add --no-cache python3 make g++ linux-headers

# Create non-root user for Express app
RUN addgroup -g 1001 -S expressjs && adduser -S appuser -u 1001 -G expressjs

# Install pnpm
RUN npm install -g pnpm

# Copy package files first
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies (this will compile bcrypt for Alpine Linux)
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build TypeScript
RUN pnpm run build

# Force rebuild bcrypt specifically for this environment
RUN cd /app/node_modules/bcrypt && node-gyp rebuild

# Change ownership
RUN chown -R appuser:expressjs /app
USER appuser

EXPOSE 3001
CMD ["pnpm", "start"]