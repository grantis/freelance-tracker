# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy server package files
COPY server/package*.json ./server/

# Install dependencies including TypeScript
RUN npm ci

# Copy source files
COPY . .

# Build server
RUN npm run build:server

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --omit=dev --workspace=server

# Copy built server files
COPY --from=builder /app/dist/server ./dist/server

# Add container health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the server
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/server/index.js"] 