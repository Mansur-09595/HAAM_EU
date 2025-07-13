# Инструкции по деплою на сервер

## Подготовка сервера

### 1. Установка Docker и Docker Compose

```bash
# Обновляем пакеты
sudo apt update && sudo apt upgrade -y

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

# Перезагружаем систему или выходим/входим
sudo reboot
```

### 2. Клонирование проекта

```bash
# Клонируем проект
git clone <your-repository-url>
cd my-project

# Даем права на выполнение скриптов
chmod +x start.sh stop.sh
```

### 3. Настройка переменных окружения

#### Backend (.env файл)

Создайте файл `backend/.env`:

```bash
# Database
DB_NAME=avito_db
DB_USER=avito_user
DB_PASSWORD=your_very_secure_password_here

# Django
SECRET_KEY=your_django_secret_key_here_make_it_long_and_random
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,localhost,127.0.0.1

# AWS S3 (если используете)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=your_bucket_name

# Celery
CELERY_BROKER_URL=redis://redis:6379/0

# Email (если используете)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

#### Frontend (.env файл)

Создайте файл `frontend/.env`:

```bash
NEXT_PUBLIC_API_URL=http://your-domain.com:8000
NODE_ENV=production
```

### 4. Настройка файрвола

```bash
# Открываем необходимые порты
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend

# Включаем файрвол
sudo ufw enable
```

## Запуск приложения

### Быстрый запуск

```bash
# Запускаем все сервисы
./start.sh
```

### Ручной запуск

```bash
# Собираем и запускаем
docker-compose up -d --build

# Проверяем статус
docker-compose ps

# Смотрим логи
docker-compose logs -f
```

### Создание суперпользователя

```bash
# Создаем админа Django
docker-compose exec backend python manage.py createsuperuser
```

## Настройка домена и SSL

### 1. Настройка Nginx (опционально)

Создайте файл `/etc/nginx/sites-available/avito-clone`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin panel
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/avito-clone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Настройка SSL с Let's Encrypt

```bash
# Устанавливаем Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получаем SSL сертификат
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Настраиваем автообновление
sudo crontab -e
# Добавьте строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Мониторинг и обслуживание

### Полезные команды

```bash
# Просмотр логов
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f celery

# Перезапуск сервисов
docker-compose restart frontend
docker-compose restart backend

# Обновление кода
git pull
docker-compose up -d --build

# Резервное копирование базы данных
docker-compose exec db pg_dump -U avito_user avito_db > backup.sql

# Восстановление базы данных
docker-compose exec -T db psql -U avito_user avito_db < backup.sql

# Очистка Docker
docker system prune -a
docker volume prune
```

### Автоматическое обновление

Создайте скрипт для автоматического обновления:

```bash
#!/bin/bash
cd /path/to/your/project
git pull
docker-compose down
docker-compose up -d --build
```

Добавьте в crontab:

```bash
# Обновление каждый день в 3:00
0 3 * * * /path/to/update-script.sh
```

## Troubleshooting

### Проблемы с портами

```bash
# Проверяем занятые порты
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8000

# Убиваем процессы на портах
sudo fuser -k 3000/tcp
sudo fuser -k 8000/tcp
```

### Проблемы с правами доступа

```bash
# Исправляем права на файлы
sudo chown -R $USER:$USER .
sudo chmod -R 755 .
```

### Проблемы с памятью

```bash
# Очищаем Docker
docker system prune -a
docker volume prune

# Проверяем использование диска
df -h
docker system df
```

### Логи ошибок

```bash
# Просмотр всех логов
docker-compose logs

# Просмотр логов конкретного сервиса
docker-compose logs backend

# Просмотр логов в реальном времени
docker-compose logs -f backend
``` 