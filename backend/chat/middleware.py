from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.db import database_sync_to_async

@database_sync_to_async
def get_user(validated_token):
    User = get_user_model()
    user_id = validated_token[api_settings.USER_ID_CLAIM]
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query = parse_qs(scope.get("query_string", b"").decode())
        token = query.get("token", [None])[0]

        if token:
            try:
                validated = JWTAuthentication().get_validated_token(token)
                scope["user"] = await get_user(validated)
            except TokenError as e:
                print(f"[JWTAuthMiddleware] Недействительный токен: {e}")
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
