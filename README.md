# FILM!

Онлайн-сервис бронирования билетов в кинотеатр. Фронтенд на React (Vite),
бэкенд на Nest.js, данные хранятся в PostgreSQL через TypeORM.

> 🚀 **Задеплоенное приложение:** [https://backpm17yandex.ru](https://backpm17yandex.ru)
>
> API доступно на поддомене: [https://api.backpm17yandex.ru](https://api.backpm17yandex.ru)


## Структура

- `backend/` — Nest.js + TypeORM + PostgreSQL
- `backend/test/` — SQL-дампы для наполнения БД
- `frontend/` — React + Vite
- `nginx/` — конфигурация reverse proxy и раздачи SPA
- `docker-compose.yml` — локальный запуск приложения и PostgreSQL

## Запуск через Docker Compose

Скопируйте пример переменных окружения и запустите сервисы:

```sh
cp .env.example .env
docker compose up -d --build
```

Приложение будет доступно на `http://localhost`, pgAdmin — на `http://localhost:8080`. Данные для входа в pgAdmin задаются переменными `PGADMIN_EMAIL` и `PGADMIN_PASSWORD` в `.env`.

После запуска заполните базу SQL-файлами из `backend/test`:

```sh
docker compose exec -T database psql -U exampleuser -d exampledb < backend/test/prac.init.sql
docker compose exec -T database psql -U exampleuser -d exampledb < backend/test/prac.films.sql
docker compose exec -T database psql -U exampleuser -d exampledb < backend/test/prac.shedules.sql
```

Пользователя, пароль и имя базы при необходимости измените в `.env`. Формат логов бэкенда задаётся `LOG_FORMAT`: `dev`, `json` или `tskv`.

## Локальная разработка

Для запуска бэкенда и фронтенда отдельно установите зависимости в соответствующих каталогах и используйте команды:

```sh
cd backend
npm ci
npm run start:dev
```

```sh
cd frontend
npm ci
npm run dev
```

## Деплой

Приложение задеплоено на удалённом сервере и доступно по ссылке:

- 🌐 [https://backpm17yandex.ru](https://backpm17yandex.ru)
- 🗄️ pgAdmin: https://backpm17yandex.ru:8080 (доступ только через SSH-туннель)

Сборка и публикация Docker-образов в GitHub Container Registry (GHCR) автоматизированы через GitHub Actions workflow (`.github/workflows/docker.yml`). При каждом пуше в ветку `main` собираются и пушатся образы `backend`, `frontend` и `nginx`.

На сервере приложение запускается через `docker compose` с файлом `docker-compose.prod.yml`, который тянет опубликованные образы из GHCR.

### Обновление фронтенда при повторном деплое

Собранные файлы фронтенда хранятся в именованном томе `frontend_dist`. При выходе новой версии образа перед перезапуском обязательно выполните `docker compose pull`, чтобы Docker подтянул свежий образ, а затем `docker compose up -d` — контейнер пересоздастся, entrypoint скопирует актуальный `dist` в том и nginx начнёт отдавать новую версию:

```sh
docker compose pull
docker compose up -d
```

При желании можно принудительно пересоздать контейнеры:

```sh
docker compose up -d --force-recreate
```