# config/asgi.py

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Это стандартный синхронный Django-код (HTTP-запросы)
django_asgi_app = get_asgi_application()

from chat.middleware import JWTAuthMiddleware
import chat.routing  # ваш файл chat/routing.py
import notifications.routing

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,  # все HTTP обрабатывает Django, как обычно
        "websocket": JWTAuthMiddleware(
            AuthMiddlewareStack(
                URLRouter(
                    chat.routing.websocket_urlpatterns +
                    notifications.routing.websocket_urlpatterns
                )
            )
        )
    }
)