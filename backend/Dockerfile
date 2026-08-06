# ---------------- STAGE 1: Production Dependencies ----------------
FROM node:24-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

# ---------------- STAGE 2: Build Stage ----------------
FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
RUN npx prisma generate && npm run build
RUN npx tsc --module commonjs --target ES2022 --esModuleInterop true --skipLibCheck true --outDir dist prisma/seed.ts

# ---------------- STAGE 3: Production Runtime ----------------
FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

# Copy production node_modules and compiled dist output
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder   /app/dist         ./dist
COPY prisma ./prisma

# Container listens on internal port 3500 (mapped to host port 4001)
EXPOSE 3500

# Native Node 24 Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3500/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

# Copy startup entrypoint script to handle DB migrations
COPY entrypoint.sh ./
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

ENTRYPOINT ["sh", "entrypoint.sh"]
