import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing  # ваш файл chat/routing.py

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Это стандартный синхронный Django-код (HTTP-запросы)
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,  # все HTTP обрабатывает Django, как обычно
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
