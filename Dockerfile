# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/dist ./dist

# Add container health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the server
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Verify the build output before starting
RUN ls -la /app/dist/server

# Add startup verification script
COPY <<'EOF' /app/start.sh
#!/bin/sh
echo "=== Container Starting ==="
echo "Working Directory: $(pwd)"
echo "Directory Contents:"
ls -la
echo "Server Directory Contents:"
ls -la dist/server
echo "Environment Variables:"
env | grep -v 'SECRET\|KEY\|PASSWORD\|TOKEN'
echo "=== Starting Application ==="
exec node dist/server/index.js
EOF

RUN chmod +x /app/start.sh
CMD ["/app/start.sh"] 