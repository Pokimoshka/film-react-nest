# --- Этап 1: сборка Vite ---
FROM node:20-slim AS builder
WORKDIR /app

# НЕ используем package-lock.json: он сгенерирован на Windows и не содержит
# Linux-бинарников Rollup. Ставим зависимости заново внутри контейнера.
COPY package.json ./
RUN npm install --include=optional --no-audit --no-fund

COPY . .
RUN npm run build

# --- Этап 2: минимальный образ с одним dist ---
FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/dist ./dist

CMD ["tail", "-f", "/dev/null"]