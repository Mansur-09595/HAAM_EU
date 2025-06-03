from django.apps import AppConfig
import os

class ChatConfig(AppConfig):
    name = "chat"
    path = os.path.dirname(os.path.abspath(__file__))
    verbose_name = "Chat"