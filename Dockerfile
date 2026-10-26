# Base image with LTS Node.js on Alpine Linux
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment by default
ENV NODE_ENV=production
ENV PORT=3000

# Copy package management files first to take advantage of Docker layer caching
COPY package*.json ./

# Install only production dependencies cleanly
RUN npm ci --only=production

# Copy application source code and configurations
COPY server.js ./
COPY src/ ./src/

# Expose backend port
EXPOSE 3000

# Run container as non-root user for security
USER node

# Health check to ensure service is alive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start Node.js application
CMD ["npm", "start"]
