import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .serializers import MessageSerializer
from django.contrib.auth.models import AnonymousUser

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")

        if not self.user or self.user.is_anonymous or isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return

        self.group_name = f"chat_{self.user.id}"

        print(f"[DEBUG] WebSocket CONNECT: user={self.user} scope={self.scope}")
        print(f"[DEBUG] Adding to group: {self.group_name}")

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"WebSocket подключён: пользователь {self.user.username} (ID {self.user.id})")

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            print(f"WebSocket отключён: пользователь {getattr(self.user, 'username', 'неизвестен')} (код {close_code})")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get("type")

            # PING/PONG обработка
            if msg_type == "ping":
                await self.send(text_data=json.dumps({"type": "pong"}))
                return

            if msg_type != "chat_message":
                await self.send(text_data=json.dumps({"type": "error", "message": "Неподдерживаемый тип сообщения"}))
                return

            conversation_id = data.get("conversation_id")
            content = data.get("content", "").strip()

            if not conversation_id or not content:
                await self.send(text_data=json.dumps({"type": "error", "message": "Необходимо указать conversation_id и content"}))
                return

            # Проверка участия в беседе
            if not await self.check_conversation_participant(conversation_id):
                await self.send(text_data=json.dumps({"type": "error", "message": "Вы не участник этой беседы"}))
                return

            message = await self.save_message(conversation_id, content)
            if not message:
                await self.send(text_data=json.dumps({"type": "error", "message": "Не удалось сохранить сообщение"}))
                return

            serialized = await self.serialize_message(message)
            recipients = await self.get_participants(conversation_id)

            for participant in recipients:
                group_name = f"chat_{participant.id}"
                print(f"[DEBUG] Sending to group: {group_name} — data: {serialized}")
                await self.channel_layer.group_send(
                    group_name,
                    {
                        "type": "chat_message",
                        "message": serialized
                    }
                )

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"type": "error", "message": "Неверный формат JSON"}))
        except Exception as e:
            print(f"Ошибка в receive: {e}")
            await self.send(text_data=json.dumps({"type": "error", "message": "Внутренняя ошибка сервера"}))

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                "type": "chat_message",
                "message": event["message"]
            }))
        except Exception as e:
            print(f"Ошибка при отправке сообщения клиенту: {e}")

    @database_sync_to_async
    def check_conversation_participant(self, conversation_id):
        try:
            from .models import Conversation
            conversation = Conversation.objects.get(id=conversation_id)
            return conversation.participants.filter(id=self.user.id).exists()
        except:
            return False

    @database_sync_to_async
    def save_message(self, conversation_id, content):
        try:
            from .models import Conversation, Message
            conv = Conversation.objects.get(id=conversation_id)
            msg = Message.objects.create(
                conversation=conv,
                sender=self.user,
                content=content
            )
            conv.save()
            return msg
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def get_participants(self, conversation_id):
        try:
            from .models import Conversation
            conversation = Conversation.objects.get(id=conversation_id)
            return list(conversation.participants.all())
        except:
            return []

    @database_sync_to_async
    def serialize_message(self, message):
        try:
            return MessageSerializer(message).data
        except Exception as e:
            print(f"Error serializing message: {e}")
            return None
