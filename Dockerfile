# Use Node.js as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json .npmrc* ./

# Install dependencies
# We use .npmrc (legacy-peer-deps=true) but also include the flag explicitly
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
# This runs vite build and bundles the server as dist/server.cjs
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
