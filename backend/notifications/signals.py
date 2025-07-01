import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from chat.models import Message
from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)
User = get_user_model()

@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    if not created:
        return

    sender_user = instance.sender
    conversation = instance.conversation
    participants = conversation.participants.all()
    # exclude the sender by primary key
    recipients = participants.exclude(pk=sender_user.pk)

    # --- DEBUG LOGGING ---
    logger.debug(
        f"[notify] New message {instance.pk} from user #{sender_user.pk} "
        f"to conversation #{conversation.pk}. "
        f"Participants: {[u.pk for u in participants]}, "
        f"Recipients (excl. sender): {[u.pk for u in recipients]}"
    )
    # ---------------------

    channel_layer = get_channel_layer()
    for recipient in recipients:
        notification = Notification.objects.create(
            recipient=recipient,
            sender=sender_user,
            notification_type='message',
            content=f'Вы получили новое сообщение от {sender_user.username}',
            object_id=conversation.pk
        )

        # more debug
        logger.debug(f"[notify] Created notification #{notification.pk} for user #{recipient.pk}")

        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"notifications_{recipient.pk}",
                {
                    "type": "notification",
                    "notification": NotificationSerializer(notification).data,
                },
            )
