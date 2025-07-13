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

# 5) Обновляем pip, setuptools и wheel перед установкой зависимостей
RUN python -m pip install --upgrade pip setuptools wheel

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

# 9) Даем права на запись в папку проекта
RUN chown -R celery:celery /backend

# 10) Переключаемся на пользователя celery
USER celery

# 11) По умолчанию запускаем миграции и Daphne (ASGI-сервер)
CMD ["sh", "-c", "python manage.py migrate --noinput && daphne -b 0.0.0.0 -p 8000 config.asgi:application"]
