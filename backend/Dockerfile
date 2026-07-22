# =========================
# Builder Stage
# =========================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generate Prisma Client and compile TypeScript
RUN npm run render:build

# =========================
# Runner Stage
# =========================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["npm", "run", "render:start"]
