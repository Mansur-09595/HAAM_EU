FROM python:3.10-slim

WORKDIR /backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
      build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# создаём непривилегированного юзера
RUN addgroup --system app && adduser --system --ingroup app app

COPY requirements.txt /backend/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /backend/

# переключаемся на непривилегированного юзера
USER app

# по умолчанию запускаем Daphne на порту 8000
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
