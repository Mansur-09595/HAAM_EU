# users/apps.py
from django.apps import AppConfig
import os

class UsersConfig(AppConfig):
    name = "users"
    path = os.path.dirname(os.path.abspath(__file__))
    verbose_name = "Users"
