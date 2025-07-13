#!/bin/bash

echo "🧪 Тестирование деплоя..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

# Проверяем наличие Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    exit 1
fi

# Проверяем наличие .env файлов
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env не найден"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "❌ frontend/.env не найден"
    exit 1
fi

echo "✅ Все проверки пройдены"

# Запускаем проект
echo "🚀 Запускаем проект..."
docker-compose up -d --build

# Ждем запуска
echo "⏳ Ждем запуска сервисов..."
sleep 30

# Проверяем статус контейнеров
echo "📊 Статус контейнеров:"
docker-compose ps

# Проверяем доступность сервисов
echo "🔍 Проверяем доступность сервисов..."

# Проверяем frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend доступен на http://localhost:3000"
else
    echo "❌ Frontend недоступен"
fi

# Проверяем backend
if curl -f http://localhost:8000 > /dev/null 2>&1; then
    echo "✅ Backend доступен на http://localhost:8000"
else
    echo "❌ Backend недоступен"
fi

# Проверяем базу данных
if docker-compose exec db pg_isready -U avito_user > /dev/null 2>&1; then
    echo "✅ База данных работает"
else
    echo "❌ Проблемы с базой данных"
fi

# Проверяем Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis работает"
else
    echo "❌ Проблемы с Redis"
fi

echo ""
echo "🎉 Тестирование завершено!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "👨‍💼 Admin: http://localhost:8000/admin" 