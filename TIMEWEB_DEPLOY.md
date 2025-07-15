# 🚀 Деплой на Timeweb.cloud - Пошаговая инструкция

## 📋 Подготовка

### 1. Подключение к серверу

```bash
# Подключитесь к вашему серверу через SSH
ssh root@your-server-ip

# Обновите систему
sudo apt update && sudo apt upgrade -y
```

### 2. Установка необходимых пакетов

```bash
# Устанавливаем базовые пакеты
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Устанавливаем Python и pip
sudo apt install -y python3 python3-pip python3-venv
```

## 🐳 Установка Docker и Docker Compose

### Автоматическая установка

```bash
# Запустите скрипт деплоя
chmod +x deploy-timeweb.sh
./deploy-timeweb.sh
```

### Ручная установка

```bash
# Устанавливаем Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER
```

## 📁 Клонирование проекта

```bash
# Клонируем проект
git clone https://github.com/Mansur-09595/HAAM_EU
cd my-project

# Даем права на выполнение скриптов
chmod +x *.sh
```

## ⚙️ Настройка переменных окружения

### Backend (.env файл)

Создайте файл `backend/.env`:

```bash
# Database
DB_NAME=avito_db
DB_USER=avito_user
DB_PASSWORD=your_very_secure_password_here

# Django
SECRET_KEY=your_django_secret_key_here_make_it_long_and_random
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,haam.be,www.haam.be

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
```

### Frontend (.env файл)

Создайте файл `frontend/.env`:

```bash
NEXT_PUBLIC_API_URL=https://haam.be
NODE_ENV=production
```

## 🔥 Запуск приложения

### Вариант 1: Простой запуск (без Nginx)

```bash
# Запускаем с базовым docker-compose.yml
docker-compose up -d --build

# Проверяем статус
docker-compose ps

# Смотрим логи
docker-compose logs -f
```

### Вариант 2: Продакшн запуск (с Nginx)

```bash
# Запускаем с продакшн конфигурацией
docker-compose -f docker-compose.prod.yml up -d --build

# Проверяем статус
docker-compose -f docker-compose.prod.yml ps
```

## 🔒 Настройка SSL сертификатов

### Автоматическая настройка

```bash
# Настройте SSL для вашего домена
chmod +x setup-ssl.sh
./setup-ssl.sh haam.be
```

### Ручная настройка

```bash
# Устанавливаем Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получаем сертификат
sudo certbot --nginx -d haam.be -d www.haam.be

# Создаем директорию для сертификатов
mkdir -p ssl
sudo cp /etc/letsencrypt/live/haam.be/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/haam.be/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
```

## 🛡️ Настройка файрвола

```bash
# Открываем необходимые порты
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Frontend (если не используете Nginx)
sudo ufw allow 8000/tcp  # Backend (если не используете Nginx)

# Включаем файрвол
sudo ufw enable
```

## 👤 Создание суперпользователя

```bash
# Создаем админа Django
docker-compose exec backend python manage.py createsuperuser

# Или для продакшн версии
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## 📊 Мониторинг и обслуживание

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

Создайте скрипт `auto-update.sh`:

```bash
#!/bin/bash
cd /path/to/your/project
git pull
docker-compose down
docker-compose up -d --build
docker system prune -f
```

Добавьте в crontab:

```bash
# Обновление каждый день в 3:00
crontab -e
# Добавьте строку:
# 0 3 * * * /path/to/your/project/auto-update.sh
```

## 🔧 Устранение неполадок

### Проблемы с подключением к базе данных

```bash
# Проверьте переменные окружения
docker-compose exec backend env | grep DB_

# Проверьте подключение к базе
docker-compose exec backend python manage.py dbshell
```

### Проблемы с Redis

```bash
# Проверьте статус Redis
docker-compose exec redis redis-cli ping

# Проверьте логи Celery
docker-compose logs celery
```

### Проблемы с SSL

```bash
# Проверьте сертификаты
sudo certbot certificates

# Обновите сертификаты
sudo certbot renew

# Проверьте конфигурацию Nginx
sudo nginx -t
```

### Проблемы с портами

```bash
# Проверьте какие порты заняты
sudo netstat -tlnp

# Убейте процесс на порту
sudo fuser -k 80/tcp
```

## 📈 Оптимизация производительности

### Настройка Nginx

```bash
# Оптимизируем Nginx
sudo nano /etc/nginx/nginx.conf

# Добавьте в http блок:
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### Настройка PostgreSQL

```bash
# Оптимизируем PostgreSQL
docker-compose exec db psql -U avito_user avito_db -c "
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
"
```

## 🚀 Готово!

Ваше приложение должно быть доступно по адресу:
- Frontend: `https://haam.be`
- Backend API: `https://haam.be/api/`
- Admin panel: `https://haam.be/admin/`

### Проверка работоспособности

```bash
# Проверьте статус всех сервисов
docker-compose ps

# Проверьте логи
docker-compose logs --tail=50

# Проверьте доступность сайта
curl -I https://haam.be
```

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус сервисов: `docker-compose ps`
3. Проверьте файрвол: `sudo ufw status`
4. Проверьте SSL: `sudo certbot certificates`

## 🔄 Обновление приложения

```bash
# Остановите приложение
docker-compose down

# Обновите код
git pull

# Пересоберите и запустите
docker-compose up -d --build

# Проверьте статус
docker-compose ps
``` 