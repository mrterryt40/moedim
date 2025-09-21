# Railway-optimized Dockerfile for Mo'edim API
FROM node:20-alpine AS deps
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install production dependencies
RUN npm ci --only=production

FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install all dependencies (including dev for build)
RUN npm ci

# Copy API source code and prisma schema
COPY apps/api ./apps/api

# Generate Prisma client in the correct location
WORKDIR /app/apps/api
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the NestJS application
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built application and necessary files
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package*.json ./apps/api/
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

# Copy Prisma client from build stage (where it was generated)
COPY --from=build /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=build /app/apps/api/node_modules/@prisma ./apps/api/node_modules/@prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the application
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]