# Build stage
FROM node:20-alpine as builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

# Accept build args
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build

# Production stage
FROM nginx:alpine as production

# Copy nginx config (optional, if you have custom config)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]