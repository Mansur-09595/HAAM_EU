from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from channels.db import database_sync_to_async

@database_sync_to_async
def get_user(validated_token):
    try:
        user_id = validated_token[JWTAuthentication.user_id_claim]
        User = get_user_model()
        return User.objects.get(id=user_id)
    except Exception as e:
        print(f"[get_user] Ошибка: {e}")
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return JWTAuthMiddlewareInstance(scope, self.inner)

class JWTAuthMiddlewareInstance:
    def __init__(self, scope, inner):
        self.scope = dict(scope)
        self.inner = inner

    async def __call__(self, receive, send):
        query = parse_qs(self.scope.get("query_string", b"").decode())
        token = query.get("token", [None])[0]

        if token:
            try:
                validated = JWTAuthentication().get_validated_token(token)
                self.scope["user"] = await get_user(validated)
            except InvalidToken as e:
                print(f"[JWTAuthMiddleware] Недействительный токен: {e}")
                self.scope["user"] = AnonymousUser()
        else:
            self.scope["user"] = AnonymousUser()

        return await self.inner(self.scope, receive, send)
