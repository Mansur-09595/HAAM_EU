from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from listings.models import Listing, Favorite
from chat.models import Message
from .models import Notification
from .serializers import NotificationSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()

@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    if created:
        # Create notification for message recipient
        conversation = instance.conversation
        recipients = conversation.participants.exclude(id=instance.sender.id)
        
        channel_layer = get_channel_layer()
        for recipient in recipients:
            notification = Notification.objects.create(
                recipient=recipient,
                sender=instance.sender,
                notification_type='Новое сообщение',
                content=f'Вы получили новое сообщения от {instance.sender.username}',
                object_id=conversation.id
            )
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"notifications_{recipient.id}",
                    {
                        "type": "notification",
                        "notification": NotificationSerializer(notification).data,
                    },
                )

@receiver(post_save, sender=Favorite)
def create_favorite_notification(sender, instance, created, **kwargs):
    if created:
        # Create notification for listing owner
        listing = instance.listing
        if listing.owner != instance.user:  # Don't notify if user favorites their own listing
            Notification.objects.create(
                recipient=listing.owner,
                sender=instance.user,
                notification_type='favorite',
                content=f'{instance.user.username} added your listing "{listing.title}" to favorites',
                object_id=listing.id
            )

@receiver(post_save, sender=Listing)
def create_subscription_notification(sender, instance, created, **kwargs):
    if created:
        # Create notifications for all followers of the listing owner
        from users.models import Subscription
        
        # Get all followers of the listing owner
        subscriptions = Subscription.objects.filter(following=instance.owner)
        
        for subscription in subscriptions:
            Notification.objects.create(
                recipient=subscription.follower,
                sender=instance.owner,
                notification_type='subscription',
                content=f'{instance.owner.username} posted a new listing: "{instance.title}"',
                object_id=instance.id
            )
