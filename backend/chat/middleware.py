from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTAuthMiddleware:
    """Middleware for Channels that authenticates WebSocket connections using a
    JWT token passed as a ``token`` query parameter."""

    def __init__(self, inner):
        self.inner = inner
        self.auth = JWTAuthentication()

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get("token", [None])[0]
        scope["user"] = await self._get_user(token)
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def _get_user(self, token):
        if not token:
            return AnonymousUser()
        try:
            validated = self.auth.get_validated_token(token)
            return self.auth.get_user(validated)
        except Exception:
            return AnonymousUser()