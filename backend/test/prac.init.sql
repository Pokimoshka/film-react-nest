-- Схема БД проекта Film!
-- Запускать от пользователя с правами на создание таблиц.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "films" (
  "id"          uuid PRIMARY KEY,
  "rating"      numeric(3,1),
  "director"    text,
  "tags"        text[] NOT NULL DEFAULT '{}',
  "image"       text,
  "cover"       text,
  "title"       text,
  "about"       text,
  "description" text
);

CREATE TABLE IF NOT EXISTS "schedules" (
  "id"       uuid PRIMARY KEY,
  "filmId"   uuid NOT NULL REFERENCES "films"("id") ON DELETE CASCADE,
  "daytime"  text NOT NULL,
  "hall"     integer NOT NULL,
  "rows"     integer NOT NULL,
  "seats"    integer NOT NULL,
  "price"    integer NOT NULL,
  "taken"    text[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS "idx_schedules_filmId" ON "schedules" ("filmId");