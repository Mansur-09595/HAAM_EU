# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .serializers import MessageSerializer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user or user.is_anonymous:
            await self.close()
            return

        self.user = user
        self.user_group_name = f"chat_{user.id}"
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Если user_group_name не был установлен (connect сразу закрыл соединение), просто ничего не делаем
        if hasattr(self, "user_group_name"):
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get("type") == "chat_message":
            conversation_id = data.get("conversation_id")
            content = data.get("content")

            message = await self.save_message(conversation_id, content)
            conversation = await self.get_conversation(conversation_id)

            participants = await self.get_participants(conversation)
            for participant in participants:
                group_name = f"chat_{participant.id}"
                await self.channel_layer.group_send(
                    group_name,
                    {
                        "type": "chat_message",
                        'message': MessageSerializer(message).data,
                    }
                )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"]
        }))

    @database_sync_to_async
    def save_message(self, conversation_id, content):
        from .models import Conversation, Message
        conv = Conversation.objects.get(id=conversation_id)
        msg = Message.objects.create(conversation=conv, sender=self.user, content=content)
        conv.save()
        return msg

    @database_sync_to_async
    def get_conversation(self, conversation_id):
        from .models import Conversation
        return Conversation.objects.get(id=conversation_id)

    @database_sync_to_async
    def get_participants(self, conversation):
        return list(conversation.participants.all())
