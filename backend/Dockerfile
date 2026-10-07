# --- Этап 1: сборка ---
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json ./
RUN npm install --include=optional --no-audit --no-fund

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# --- Этап 2: прод-зависимости ---
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --include=optional --no-audit --no-fund \
    && npm cache clean --force

# --- Этап 3: финальный образ ---
FROM node:20-slim AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY public ./public
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/main"]