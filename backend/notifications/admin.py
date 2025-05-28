# admin.py с jazzmin UI и улучшенными админ-классами
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('recipient__username', 'content')
    readonly_fields = ('created_at',)
