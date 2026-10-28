#!/bin/sh
set -eu

SHARED_DIR="${SHARED_DIR:-/shared}"

if [ -d "${SHARED_DIR}" ]; then
  echo "[frontend] Синхронизирую dist → ${SHARED_DIR}"
  rm -rf "${SHARED_DIR:?}"/*
  cp -a /src/dist/. "${SHARED_DIR}/"
else
  echo "[frontend] ${SHARED_DIR} не смонтирован" >&2
  exit 1
fi

# Держим контейнер живым, чтобы Docker не отмонтировал общий volume.
exec tail -f /dev/null