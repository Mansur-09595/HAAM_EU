from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('message', 'New Message'),
        ('favorite', 'New Favorite'),
        ('comment', 'New Comment'),
        ('price_change', 'Price Change'),
        ('status_change', 'Status Change'),
        ('subscription', 'New Listing from Subscription'),
    ]
    
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    content = models.TextField()
    object_id = models.PositiveIntegerField(null=True, blank=True)  # ID of related object (listing, message, etc.)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} notification to {self.recipient.username}"
