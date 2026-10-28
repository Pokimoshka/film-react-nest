# FILM! — backend

Бэкенд проекта Film! на Nest.js. Работа с данными — через TypeORM и PostgreSQL.

## Установка

### PostgreSQL

Поднимите СУБД в Docker (из корня репозитория):

    docker-compose up -d

Загрузите схему и данные:

    docker exec -i postgres_container psql -U exampleuser -d exampledb < test/prac.init.sql
    docker exec -i postgres_container psql -U exampleuser -d exampledb < test/prac.films.sql
    docker exec -i postgres_container psql -U exampleuser -d exampledb < test/prac.shedules.sql

### Зависимости

    npm ci

### Переменные окружения

Создайте `.env` из примера:

    cp .env.example .env

Параметры в `.env`:

- `DATABASE_DRIVER` — тип драйвера СУБД, в нашем случае `postgres`
- `DATABASE_URL` — строка подключения к PostgreSQL, например `postgres://localhost:5432/exampledb`
- `DATABASE_USERNAME` — логин пользователя БД
- `DATABASE_PASSWORD` — пароль пользователя БД
- `PORT` — порт приложения, по умолчанию `3000`

## Запуск

    # режим разработки (watch)
    npm run start:dev

    # режим отладки (watch + debugger)
    npm run start:debug

    # продакшн-сборка
    npm run build
    npm run start:prod

Приложение поднимается по адресу `http://localhost:3000`, все API-методы
доступны с префиксом `/api/afisha`, статика — по пути `/content/afisha/*`.

## API

- `GET /api/afisha/films` — список фильмов
- `GET /api/afisha/films/:id/schedule` — сеансы выбранного фильма
- `POST /api/afisha/order` — бронирование билетов
- `GET /content/afisha/*` — статический контент (изображения)

## Проверка качества

    npm run lint
    npm run build

## Структура

- `src/films/` — модуль фильмов: контроллер, сервис, репозиторий, сущности Film и Schedule
- `src/order/` — модуль заказа билетов
- `src/common/filters/` — глобальный фильтр исключений
- `test/` — e2e-тесты и SQL-дампы
- `public/content/afisha/` — статические файлы, раздаваемые приложением