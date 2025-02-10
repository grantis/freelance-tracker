# Use Node.js 20
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy all package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm install

# Copy built application
COPY dist/ ./dist/

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Expose the port
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"] 