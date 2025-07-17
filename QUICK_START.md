# 🚀 Быстрый старт

## Что нужно сделать для запуска проекта

### 1. Создайте файлы .env

**backend/.env:**
```bash
DB_NAME=avito_db
DB_USER=avito_user
DB_PASSWORD=your_password_here
SECRET_KEY=your_secret_key_here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CELERY_BROKER_URL=redis://redis:6379/0
```

**frontend/.env:**
```bash
NEXT_PUBLIC_API_BASE=/api
NODE_ENV=production
```

### 2. Запустите проект

```bash
# Быстрый запуск
./start.sh

# Или вручную
docker-compose up -d --build
```

### 3. Проверьте работу

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

### 4. Создайте админа

```bash
docker-compose exec backend python manage.py createsuperuser
```

## Полезные команды

```bash
# Остановить проект
./stop.sh

# Посмотреть логи
docker-compose logs -f frontend
docker-compose logs -f backend

# Перезапустить сервис
docker-compose restart frontend
docker-compose restart backend
```

## Структура проекта

```
my-project/
├── frontend/          # Next.js приложение
├── backend/           # Django API
├── docker-compose.yml # Основной файл запуска
├── start.sh          # Скрипт запуска
├── stop.sh           # Скрипт остановки
└── README.md         # Подробная документация
```

## Сервисы

- **frontend** (порт 3000) - Next.js приложение
- **backend** (порт 8000) - Django API
- **db** (порт 5432) - PostgreSQL
- **redis** (порт 6379) - Redis для кеша
- **celery** - Фоновые задачи
- **celery-beat** - Периодические задачи 