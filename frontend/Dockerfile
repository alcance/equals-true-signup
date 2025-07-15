# Build stage
FROM node:20-alpine as builder
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package*.json ./
# Don't copy lock file to force fresh resolution

# Install dependencies fresh
RUN pnpm store prune && \
    pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Accept build args
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the app (NO PRISMA - this is frontend only!)
RUN pnpm run build

# Production stage
FROM nginx:alpine as production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck for nginx
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]