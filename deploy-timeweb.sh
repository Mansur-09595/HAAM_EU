#!/bin/bash

# Скрипт для деплоя на Timeweb.cloud
# Автор: AI Assistant
# Версия: 1.0

set -e

echo "🚀 Начинаем деплой на Timeweb.cloud..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции для логирования
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверяем, что мы в корневой директории проекта
if [ ! -f "docker-compose.yml" ]; then
    log_error "Скрипт должен быть запущен из корневой директории проекта!"
    exit 1
fi

# 1. Обновляем систему
log_info "Обновляем систему..."
sudo apt update && sudo apt upgrade -y

# 2. Устанавливаем Docker (если не установлен)
if ! command -v docker &> /dev/null; then
    log_info "Устанавливаем Docker..."
    
    # Устанавливаем необходимые пакеты
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

    # Добавляем GPG ключ Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

    # Добавляем репозиторий Docker
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

    # Устанавливаем Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io

    # Устанавливаем Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # Добавляем пользователя в группу docker
    sudo usermod -aG docker $USER
    
    log_warn "Docker установлен. Перезагрузите систему или выйдите/войдите в систему для применения изменений."
else
    log_info "Docker уже установлен"
fi

# 3. Настраиваем файрвол
log_info "Настраиваем файрвол..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend
sudo ufw --force enable

# 4. Создаем .env файлы если их нет
log_info "Проверяем .env файлы..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    log_warn "Создаем backend/.env файл..."
    cat > backend/.env << EOF
# Database
DB_NAME=avito_db
DB_USER=avito_user
DB_PASSWORD=$(openssl rand -base64 32)

# Django
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com,www.your-domain.com

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Email (настройте под ваши нужды)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=haam.information@gmail.com
EMAIL_HOST_PASSWORD=wpojjsyazqipwcsf

# Geonames
GEONAMES_USERNAME=mansur_musaev_1997

# AWS S3 (опционально)
AWS_ACCESS_KEY_ID=AKIAVSAPPUV6C5BNVPEP
AWS_S3_REGION_NAME=eu-north-1
AWS_SECRET_ACCESS_KEY=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
AWS_STORAGE_BUCKET_NAME=haam-bucket-media
EOF
    log_info "backend/.env создан. Не забудьте настроить переменные!"
else
    log_info "backend/.env уже существует"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    log_warn "Создаем frontend/.env файл..."
    cat > frontend/.env << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=production
EOF
    log_info "frontend/.env создан"
else
    log_info "frontend/.env уже существует"
fi

# 5. Останавливаем существующие контейнеры
log_info "Останавливаем существующие контейнеры..."
docker-compose down

# 6. Очищаем старые образы
log_info "Очищаем старые образы..."
docker system prune -f

# 7. Собираем и запускаем
log_info "Собираем и запускаем контейнеры..."
docker-compose up -d --build

# 8. Ждем запуска базы данных
log_info "Ждем запуска базы данных..."
sleep 10

# 9. Выполняем миграции
log_info "Выполняем миграции..."
docker-compose exec -T backend python manage.py migrate

# 10. Собираем статические файлы
log_info "Собираем статические файлы..."
docker-compose exec -T backend python manage.py collectstatic --noinput

# 11. Создаем суперпользователя (если нужно)
read -p "Создать суперпользователя Django? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Создаем суперпользователя..."
    docker-compose exec -T backend python manage.py createsuperuser
fi

# 12. Проверяем статус
log_info "Проверяем статус сервисов..."
docker-compose ps

# 13. Показываем логи
log_info "Показываем логи (Ctrl+C для выхода)..."
docker-compose logs -f 