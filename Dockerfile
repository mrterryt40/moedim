# Railway-optimized Dockerfile for Mo'edim API
FROM node:20-alpine AS base
WORKDIR /app

# Install alpine packages needed for Prisma
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
# Copy package files for workspace
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

FROM base AS build
# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install all dependencies (including dev for build)
RUN npm ci

# Copy API source code
COPY apps/api ./apps/api

# Generate Prisma client and build
WORKDIR /app/apps/api
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# Verify build output exists
RUN ls -la dist/

FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy production dependencies
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/api/package*.json ./apps/api/
COPY --from=build --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma

# Copy Prisma client from build stage
COPY --from=build --chown=nestjs:nodejs /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=build --chown=nestjs:nodejs /app/apps/api/node_modules/@prisma ./apps/api/node_modules/@prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]