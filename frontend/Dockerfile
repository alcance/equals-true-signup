# Development stage
FROM node:18-alpine as development
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first (for better caching)
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source code
COPY . .

EXPOSE 3000
CMD ["pnpm", "run", "dev", "--", "--host"]

# Build stage
FROM node:18-alpine as builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .

# Accept build args for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine as production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Create nginx user and set permissions
RUN addgroup -g 101 -S nginx \
    && adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx

EXPOSE 80

# Run as non-root user
USER nginx

CMD ["nginx", "-g", "daemon off;"]
