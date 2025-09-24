# Use Node.js 23 LTS
FROM node:23-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Copy source code first (needed for build)
COPY src ./src

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["pnpm", "start"]