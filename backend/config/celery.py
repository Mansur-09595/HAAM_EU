import os
import ssl
from celery import Celery

# Указываем settings Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('backend')

#
# 1) Настройка SSL для брокера и бекенда
#
# Поскольку Render использует Let's Encrypt, мы можем полагаться
# на системный пул корневых сертификатов.
COMMON_SSL = {
    'ssl_cert_reqs': ssl.CERT_REQUIRED,
    'ssl_ca_certs': '/etc/ssl/certs/ca-certificates.crt',
}

# Обновляем конфиг Celery ДО загрузки настроек из Django
app.conf.update(
    broker_use_ssl=COMMON_SSL,
    result_backend_use_ssl=COMMON_SSL,
)

#
# 2) Загружаем остальные настройки из Django (namespace CELERY)
#
app.config_from_object('django.conf:settings', namespace='CELERY')

#
# 3) Автоматический поиск тасков в установленных приложениях
#
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
