#!/bin/bash

# Скрипт для настройки SSL сертификатов на Timeweb.cloud
# Автор: AI Assistant
# Версия: 1.0

set -e

echo "🔒 Настраиваем SSL сертификаты..."

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

# Проверяем аргументы
if [ $# -eq 0 ]; then
    log_error "Использование: $0 <haam.be>"
    exit 1
fi

DOMAIN=$1

log_info "Настраиваем SSL для домена: $DOMAIN"

# 1. Устанавливаем Certbot
log_info "Устанавливаем Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 2. Создаем временную конфигурацию Nginx для получения сертификата
log_info "Создаем временную конфигурацию Nginx..."
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

# 3. Активируем временную конфигурацию
log_info "Активируем временную конфигурацию..."
sudo ln -sf /etc/nginx/sites-available/temp-ssl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 4. Получаем SSL сертификат
log_info "Получаем SSL сертификат от Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 5. Создаем директорию для SSL сертификатов
log_info "Создаем директорию для SSL сертификатов..."
sudo mkdir -p ssl

# 6. Копируем сертификаты
log_info "Копируем сертификаты..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
sudo chmod 644 ssl/cert.pem
sudo chmod 600 ssl/key.pem

# 7. Обновляем nginx.conf с правильным доменом
log_info "Обновляем nginx.conf..."
sed -i "s/haam.be/$DOMAIN/g" nginx.conf

# 8. Удаляем временную конфигурацию
log_info "Удаляем временную конфигурацию..."
sudo rm -f /etc/nginx/sites-enabled/temp-ssl
sudo rm -f /etc/nginx/sites-available/temp-ssl

# 9. Настраиваем автообновление сертификатов
log_info "Настраиваем автообновление сертификатов..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem && docker-compose restart nginx") | crontab -

# 10. Создаем скрипт для обновления сертификатов
cat > update-ssl.sh << EOF
#!/bin/bash
# Обновляем SSL сертификаты
sudo certbot renew --quiet
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
sudo chown \$USER:\$USER ssl/cert.pem ssl/key.pem
sudo chmod 644 ssl/cert.pem
sudo chmod 600 ssl/key.pem
docker-compose restart nginx
echo "SSL сертификаты обновлены!"
EOF

chmod +x update-ssl.sh

log_info "✅ SSL сертификаты настроены!"
log_info "Домен: $DOMAIN"
log_info "Сертификаты сохранены в: ssl/cert.pem и ssl/key.pem"
log_info "Автообновление настроено в crontab"
log_info "Для ручного обновления используйте: ./update-ssl.sh" 