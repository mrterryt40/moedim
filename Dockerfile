# Mo'edim Production Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy all package files for monorepo workspace resolution
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/

# Install all dependencies (including dev for build step)
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy root package.json and package-lock.json first for workspace structure
COPY package.json package-lock.json* ./

# Copy workspace package.json files
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Build the API application
RUN npm run build:api

# Production dependencies only
FROM base AS prod-deps
WORKDIR /app

# Copy all package files for monorepo workspace resolution
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/

# Install only production dependencies
RUN npm ci --omit=dev

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 moedim

# Copy built application
COPY --from=builder --chown=moedim:nodejs /app/apps/api/dist ./dist
COPY --from=prod-deps --chown=moedim:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=moedim:nodejs /app/apps/api/package.json ./package.json

USER moedim

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/main.js"]