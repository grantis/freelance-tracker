# Use Node.js 20
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Expose the port (this is for documentation)
EXPOSE ${PORT}

# Set environment variable
ENV PORT=5000

# Start the server
CMD [ "node", "dist/index.js" ] 