# FILM!

Онлайн-сервис бронирования билетов в кинотеатр. Фронтенд на React (Vite),
бэкенд на Nest.js, данные хранятся в PostgreSQL через TypeORM.

## Структура

- `backend/` — Nest.js + TypeORM + PostgreSQL
- `backend/test/` — SQL-дампы для наполнения БД
- `src/` — фронтенд на React + Vite
- `docker-compose.yml` — конфигурация PostgreSQL для локального запуска

## Установка

### PostgreSQL

Поднимите СУБД в Docker:

    docker-compose up -d

Загрузите схему и тестовые данные:

    docker exec -i postgres_container psql -U exampleuser -d exampledb < backend/test/prac.init.sql
    docker exec -i postgres_container psql -U exampleuser -d exampledb < backend/test/prac.films.sql
    docker exec -i postgres_container psql -U exampleuser -d exampledb < backend/test/prac.shedules.sql

### Бэкенд

    cd backend
    npm ci
    cp .env.example .env

В `.env` укажите параметры подключения к PostgreSQL:

- `DATABASE_DRIVER` — тип драйвера СУБД, в нашем случае `postgres`
- `DATABASE_URL` — адрес PostgreSQL, например `postgres://localhost:5432/exampledb`
- `DATABASE_USERNAME` — логин пользователя БД
- `DATABASE_PASSWORD` — пароль пользователя БД

Запустите бэкенд:

    npm run start:debug

Для проверки отправьте тестовый запрос с помощью Postman или `curl`:

    curl http://localhost:3000/api/afisha/films

### Фронтенд

    cp .env.example .env
    npm ci
    npm run dev