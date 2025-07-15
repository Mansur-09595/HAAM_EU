#!/bin/bash

# Быстрый деплой на Timeweb.cloud
# Автор: AI Assistant
# Версия: 1.0

set -e

echo "🚀 Быстрый деплой на Timeweb.cloud..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Проверяем аргументы
if [ $# -eq 0 ]; then
    log_error "Использование: $0 <your-domain.com> [--ssl] [--prod]"
    echo "Примеры:"
    echo "  $0 mysite.com                    # Базовый деплой"
    echo "  $0 mysite.com --ssl              # С SSL сертификатами"
    echo "  $0 mysite.com --ssl --prod       # Продакшн с Nginx"
    exit 1
fi

DOMAIN=$1
USE_SSL=false
USE_PROD=false

# Парсим аргументы
for arg in "$@"; do
    case $arg in
        --ssl)
            USE_SSL=true
            shift
            ;;
        --prod)
            USE_PROD=true
            shift
            ;;
    esac
done

log_info "Домен: $DOMAIN"
log_info "SSL: $USE_SSL"
log_info "Продакшн: $USE_PROD"

# 1. Обновляем систему
log_step "1. Обновляем систему..."
sudo apt update && sudo apt upgrade -y

# 2. Устанавливаем Docker (если не установлен)
if ! command -v docker &> /dev/null; then
    log_step "2. Устанавливаем Docker..."
    
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
log_step "3. Настраиваем файрвол..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend
sudo ufw --force enable

# 4. Создаем .env файлы
log_step "4. Создаем .env файлы..."

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
ALLOWED_HOSTS=localhost,127.0.0.1,$DOMAIN,www.$DOMAIN

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Email (настройте под ваши нужды)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (опционально)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=your_bucket_name
EOF
    log_info "backend/.env создан. Не забудьте настроить переменные!"
else
    log_info "backend/.env уже существует"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    log_warn "Создаем frontend/.env файл..."
    if [ "$USE_SSL" = true ]; then
        API_URL="https://$DOMAIN"
    else
        API_URL="http://$DOMAIN"
    fi
    
    cat > frontend/.env << EOF
NEXT_PUBLIC_API_URL=$API_URL
NODE_ENV=production
EOF
    log_info "frontend/.env создан"
else
    log_info "frontend/.env уже существует"
fi

# 5. Останавливаем существующие контейнеры
log_step "5. Останавливаем существующие контейнеры..."
docker-compose down 2>/dev/null || true
if [ "$USE_PROD" = true ]; then
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
fi

# 6. Очищаем старые образы
log_step "6. Очищаем старые образы..."
docker system prune -f

# 7. Собираем и запускаем
log_step "7. Собираем и запускаем контейнеры..."

if [ "$USE_PROD" = true ]; then
    log_info "Запускаем продакшн версию с Nginx..."
    docker-compose -f docker-compose.prod.yml up -d --build
    COMPOSE_FILE="docker-compose.prod.yml"
else
    log_info "Запускаем базовую версию..."
    docker-compose up -d --build
    COMPOSE_FILE="docker-compose.yml"
fi

# 8. Ждем запуска базы данных
log_step "8. Ждем запуска базы данных..."
sleep 15

# 9. Выполняем миграции
log_step "9. Выполняем миграции..."
docker-compose -f $COMPOSE_FILE exec -T backend python manage.py migrate

# 10. Собираем статические файлы
log_step "10. Собираем статические файлы..."
docker-compose -f $COMPOSE_FILE exec -T backend python manage.py collectstatic --noinput

# 11. Настраиваем SSL (если нужно)
if [ "$USE_SSL" = true ]; then
    log_step "11. Настраиваем SSL сертификаты..."
    
    # Устанавливаем Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Создаем временную конфигурацию Nginx
    sudo tee /etc/nginx/sites-available/temp-ssl << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Активируем временную конфигурацию
    sudo ln -sf /etc/nginx/sites-available/temp-ssl /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx

    # Получаем SSL сертификат
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

    # Создаем директорию для SSL сертификатов
    mkdir -p ssl
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
    sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
    sudo chmod 644 ssl/cert.pem
    sudo chmod 600 ssl/key.pem

    # Обновляем nginx.conf с правильным доменом
    sed -i "s/your-domain.com/$DOMAIN/g" nginx.conf

    # Удаляем временную конфигурацию
    sudo rm -f /etc/nginx/sites-enabled/temp-ssl
    sudo rm -f /etc/nginx/sites-available/temp-ssl

    # Настраиваем автообновление сертификатов
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem && docker-compose restart nginx") | crontab -

    log_info "SSL сертификаты настроены!"
fi

# 12. Создаем суперпользователя (если нужно)
read -p "Создать суперпользователя Django? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_step "12. Создаем суперпользователя..."
    docker-compose -f $COMPOSE_FILE exec -T backend python manage.py createsuperuser
fi

# 13. Проверяем статус
log_step "13. Проверяем статус сервисов..."
docker-compose -f $COMPOSE_FILE ps

# 14. Показываем информацию
log_info "✅ Деплой завершен!"
log_info "Домен: $DOMAIN"
if [ "$USE_SSL" = true ]; then
    log_info "SSL: Настроен"
    log_info "URL: https://$DOMAIN"
else
    log_info "SSL: Не настроен"
    log_info "URL: http://$DOMAIN"
fi

if [ "$USE_PROD" = true ]; then
    log_info "Режим: Продакшн (с Nginx)"
else
    log_info "Режим: Базовый"
fi

log_info "Полезные команды:"
log_info "  Просмотр логов: docker-compose -f $COMPOSE_FILE logs -f"
log_info "  Статус: docker-compose -f $COMPOSE_FILE ps"
log_info "  Перезапуск: docker-compose -f $COMPOSE_FILE restart"
log_info "  Обновление: git pull && docker-compose -f $COMPOSE_FILE up -d --build"

# 15. Показываем логи
read -p "Показать логи? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Показываем логи (Ctrl+C для выхода)..."
    docker-compose -f $COMPOSE_FILE logs -f
fi 