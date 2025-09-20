# Mo'edim Production Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the API application
RUN npm run build:api

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 moedim

# Copy built application
COPY --from=builder --chown=moedim:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=moedim:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=moedim:nodejs /app/apps/api/package.json ./package.json

USER moedim

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/main.js"]