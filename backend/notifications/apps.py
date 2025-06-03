# listings/apps.py
from django.apps import AppConfig
import os

class NotificationsConfig(AppConfig):
    name = "notifications"
    # не хардкодим путь, а вычисляем его по __file__
    path = os.path.dirname(os.path.abspath(__file__))
    verbose_name = "Notifications"

