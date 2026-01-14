# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared dependencies first
COPY shared ./shared
WORKDIR /app/shared
RUN npm install && npm run build

# Copy and build client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install

COPY client ./
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
