# Dockerfile
#
# 1) Берём минимальный образ Python 3.10
FROM python:3.10-slim

# 2) Устанавливаем рабочую директорию внутри контейнера
#    (физически здесь пока ничего нет, код попадёт сюда через volume)
WORKDIR /backend

# 3) Отключаем кеширование байт-кода и включаем «мгновенный» вывод логов
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 4) Устанавливаем OS-пакеты, нужные для psycopg2 и сборки Pillow и т. д.
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

    # создаём непривилегированного юзера
RUN addgroup --system app && adduser --system --ingroup app app

# 5) Копируем только файл зависимостей (requirements.txt) и устанавливаем их
#    (это нужно, чтобы не тащить сразу весь код; 
#     при изменении requirements-файла контейнер перекомпилирует зависимости)
COPY requirements.txt /backend/
RUN pip install --no-cache-dir -r /backend/requirements.txt

# 6) Копируем исходный код приложения. В локальной разработке он монтируется
#    через docker-compose, но в окружениях вроде Render его нужно включить в
#    образ, иначе приложение не найдёт модуль config и не запустится.
COPY . /backend/

# create a system user “celery” (no password, no home)
RUN addgroup --system celery \
 && adduser  --system --ingroup celery celery

# from here on, we’re no longer root
USER celery

# 7) По умолчанию команда daphne (ASGI-сервер). 
#    Но docker-compose её перекрывает vlastní командой.
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
