# Mo'edim Production Dockerfile - Pattern A (Monorepo at runtime)
FROM node:20 AS deps
WORKDIR /app

# Copy all package files for monorepo workspace resolution
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/

# Install all dependencies
RUN npm ci

FROM node:20 AS build
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Build the API application via root workspace script
RUN npm run build:api

FROM node:20 AS runner
WORKDIR /app

# Keep root workspace files AND folders at runtime
COPY package.json package-lock.json* ./
COPY apps ./apps
COPY packages ./packages

# Copy built API dist to the correct location
COPY --from=build /app/apps/api/dist ./apps/api/dist

# Copy node_modules
COPY --from=deps /app/node_modules ./node_modules

# Quick assert to avoid silent misconfig
RUN node -e "const p=require('./package.json'); if(!p.workspaces) { process.exit(1) }"

ENV NODE_ENV=production
# Railway expects your server to listen on PORT
ENV PORT=8080
EXPOSE 8080

# ✅ Start via root wrapper (no trailing flags)
CMD ["npm","run","start:api"]