from rest_framework import serializers
from .models import Notification
from users.serializers import UserSerializer

class NotificationSerializer(serializers.ModelSerializer):
    recipient = UserSerializer(read_only=True)
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ('id', 'recipient', 'sender', 'notification_type', 'content', 'object_id', 'is_read', 'created_at')
        read_only_fields = ('id', 'recipient', 'sender', 'notification_type', 'content', 'object_id', 'created_at')
