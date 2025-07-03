# Dockerfile
# 1) Берём минимальный образ Python 3.10
FROM python:3.10-slim

# 2) Устанавливаем рабочую директорию внутри контейнера
WORKDIR /backend

# 3) Отключаем кеширование байт-кода и включаем «мгновенный» вывод логов
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 4) Устанавливаем OS-пакеты, нужные для psycopg2, Pillow и libvips
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libssl-dev \
    libvips-dev \
  && rm -rf /var/lib/apt/lists/*

# 5) Создаём непривилегированного юзера
RUN addgroup --system app && adduser --system --ingroup app app

# 6) Копируем зависимости и устанавливаем их вместе с pyvips[binary]
COPY requirements.txt /backend/
# Устанавливаем сначала pyvips[binary] для поддержки WebP и других форматов
RUN pip install --no-cache-dir "pyvips[binary]"
# Затем устанавливаем остальные пакеты
RUN pip install --no-cache-dir -r /backend/requirements.txt

# 7) Копируем исходный код приложения
COPY . /backend/

# 8) Создаём пользователя для Celery
RUN addgroup --system celery \
 && adduser --system --ingroup celery celery

# 9) Переключаемся на неправа пользовател
USER celery

# 10) По умолчанию запускаем Daphne (ASGI-сервер)
CMD ["python manage.py migrate --noinput && daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]