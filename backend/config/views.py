from django.http import JsonResponse
from django.views import View
from django.db import connection
from django.db.utils import OperationalError


class HealthCheckView(View):
    def get(self, request):
        try:
            # Проверяем подключение к базе данных
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            
            return JsonResponse({
                "status": "healthy",
                "database": "connected"
            }, status=200)
        except OperationalError:
            return JsonResponse({
                "status": "unhealthy",
                "database": "disconnected"
            }, status=503) 