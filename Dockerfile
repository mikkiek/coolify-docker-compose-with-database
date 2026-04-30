FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files first (better for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code (server.js, etc.)
COPY . .

# Start the application
CMD ["node", "server.js"]
