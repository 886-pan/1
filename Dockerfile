FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY api/server.js ./api/
COPY api/*.json ./api/
COPY dist ./dist
COPY uploads ./uploads

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "api/server.js"]