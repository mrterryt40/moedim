# Railway-optimized Dockerfile for Mo'edim API
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci --only=production

FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install all dependencies including dev
RUN npm ci

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build the application
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Copy production dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules

# Copy built application
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package*.json ./apps/api/

# Copy Prisma files
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the application
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]