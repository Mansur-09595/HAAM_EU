# Avito Clone - Docker Deployment

Этот проект содержит полноценное веб-приложение с frontend (Next.js) и backend (Django) компонентами.

## Структура проекта

```
my-project/
├── frontend/          # Next.js приложение
├── backend/           # Django приложение
└── docker-compose.yml # Основной файл для запуска
```

## Быстрый старт

### Предварительные требования

1. Установите Docker и Docker Compose
2. Убедитесь, что порты 3000, 8000, 5432, 6379 свободны

### Настройка переменных окружения

1. Создайте файл `backend/.env`:
```bash
# Database
DB_NAME=avito_db
DB_USER=avito_user
DB_PASSWORD=your_secure_password

# Django
SECRET_KEY=your_django_secret_key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# AWS S3 (опционально)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=your_bucket_name

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
```

2. Создайте файл `frontend/.env`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=production
```

### Запуск приложения

```bash
# Собрать и запустить все сервисы
docker-compose up --build

# Запустить в фоновом режиме
docker-compose up -d --build

# Остановить все сервисы
docker-compose down

# Остановить и удалить тома
docker-compose down -v
```

### Доступ к приложениям

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## Сервисы

1. **frontend** - Next.js приложение (порт 3000)
2. **backend** - Django API сервер (порт 8000)
3. **db** - PostgreSQL база данных (порт 5432)
4. **redis** - Redis для кеширования и очередей (порт 6379)
5. **celery** - Celery worker для фоновых задач
6. **celery-beat** - Celery beat для периодических задач

## Полезные команды

```bash
# Просмотр логов
docker-compose logs -f frontend
docker-compose logs -f backend

# Выполнить команды в контейнере
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py collectstatic

# Перезапустить конкретный сервис
docker-compose restart frontend
docker-compose restart backend

# Обновить код без пересборки
docker-compose up -d
```

## Продакшн деплой

Для продакшн деплоя рекомендуется:

1. Изменить `ALLOWED_HOSTS` в `backend/.env`
2. Настроить SSL/TLS (например, через nginx)
3. Использовать внешнюю базу данных
4. Настроить мониторинг и логирование

## Troubleshooting

### Проблемы с портами
Если порты заняты, измените их в `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # frontend на порту 3001
  - "8001:8000"  # backend на порту 8001
```

### Проблемы с правами доступа
```bash
# На Linux/Mac может потребоваться
sudo chown -R $USER:$USER .
```

### Очистка Docker
```bash
# Удалить неиспользуемые образы
docker system prune -a

# Удалить все тома
docker volume prune
``` 