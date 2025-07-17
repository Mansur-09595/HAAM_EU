#!/bin/bash

echo "🚀 Запуск Avito Clone проекта..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

# Проверяем наличие Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

# Проверяем наличие .env файлов
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Файл backend/.env не найден. Создайте его на основе backend/.env.example"
    echo "Пример содержимого:"
    echo "DB_NAME=avito_db"
    echo "DB_USER=avito_user"
    echo "DB_PASSWORD=your_secure_password"
    echo "SECRET_KEY=your_django_secret_key"
    echo "DEBUG=False"
    echo "ALLOWED_HOSTS=localhost,127.0.0.1"
    echo "CELERY_BROKER_URL=redis://redis:6379/0"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Файл frontend/.env не найден. Создайте его:"
    echo "NEXT_PUBLIC_API_BASE=/api"
    echo "NODE_ENV=production"
    exit 1
fi

echo "✅ Проверки пройдены"

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose down

# Удаляем старые образы
echo "🧹 Очищаем старые образы..."
docker-compose build --no-cache

# Запускаем все сервисы
echo "🚀 Запускаем все сервисы..."
docker-compose up -d --build

# Ждем немного для запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 10

# Проверяем статус
echo "📊 Статус сервисов:"
docker-compose ps

echo ""
echo "🎉 Проект запущен!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "👨‍💼 Admin Panel: http://localhost:8000/admin"
echo ""
echo "📝 Полезные команды:"
echo "  docker-compose logs -f frontend  # Логи frontend"
echo "  docker-compose logs -f backend   # Логи backend"
echo "  docker-compose down              # Остановить все"
echo "  docker-compose restart frontend  # Перезапустить frontend"
echo "  docker-compose restart backend   # Перезапустить backend" 