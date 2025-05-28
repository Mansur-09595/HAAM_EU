import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# ⚠️ Получаем обычное Django-приложение СИНХРОННО
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    # ✅ Все обычные HTTP-запросы обрабатываются как sync
    "http": django_asgi_app,
    # ✅ WebSocket только тут работает как async
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
