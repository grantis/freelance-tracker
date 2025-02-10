# Use Node.js 20
FROM node:20-slim

# Create app directory
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files
COPY dist/ ./dist/

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start the server
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"] 