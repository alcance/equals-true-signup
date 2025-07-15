# Development stage
FROM nginx:alpine as production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
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
RUN pnpm install

# Copy source and build
COPY . .

# Accept build args
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build

# Production stage
FROM nginx:alpine as production

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]