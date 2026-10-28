# --- Этап 1: сборка Vite ---
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json ./
RUN npm install --include=optional --no-audit --no-fund

COPY . .
RUN npm run build

# --- Этап 2: рантайм-образ, публикующий dist в общий volume ---
FROM alpine:3.20

WORKDIR /src
COPY --from=builder /app/dist ./dist
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["entrypoint.sh"]