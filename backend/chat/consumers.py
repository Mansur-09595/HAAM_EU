# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .serializers import MessageSerializer
from django.contrib.auth.models import AnonymousUser

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            user = self.scope.get("user")
            if not user or user.is_anonymous or isinstance(user, AnonymousUser):
                print(f"WebSocket connection rejected: user={user}")
                await self.close(code=4001)
                return

            self.user = user
            self.user_group_name = f"chat_{user.id}"
            
            # Присоединяемся к группе пользователя
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
            await self.accept()
            
            print(f"WebSocket connected for user {user.id} ({user.username})")
            
        except Exception as e:
            print(f"Error in WebSocket connect: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        try:
            # Если user_group_name был установлен, удаляем из группы
            if hasattr(self, "user_group_name"):
                await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
                print(f"WebSocket disconnected for user {getattr(self, 'user', 'unknown')}, code: {close_code}")
        except Exception as e:
            print(f"Error in WebSocket disconnect: {e}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")
            
            if message_type == "chat_message":
                conversation_id = data.get("conversation_id")
                content = data.get("content", "").strip()

                if not conversation_id or not content:
                    await self.send(text_data=json.dumps({
                        "type": "error",
                        "message": "conversation_id and content are required"
                    }))
                    return

                # Проверяем, что пользователь является участником беседы
                is_participant = await self.check_conversation_participant(conversation_id)
                if not is_participant:
                    await self.send(text_data=json.dumps({
                        "type": "error",
                        "message": "You are not a participant of this conversation"
                    }))
                    return

                # Сохраняем сообщение
                message = await self.save_message(conversation_id, content)
                if not message:
                    await self.send(text_data=json.dumps({
                        "type": "error",
                        "message": "Failed to save message"
                    }))
                    return

                # Получаем участников беседы
                conversation = await self.get_conversation(conversation_id)
                participants = await self.get_participants(conversation)

                # Отправляем сообщение всем участникам
                message_data = await self.serialize_message(message)
                
                for participant in participants:
                    group_name = f"chat_{participant.id}"
                    await self.channel_layer.group_send(
                        group_name,
                        {
                            "type": "chat_message",
                            "message": message_data,
                        }
                    )
                    
                print(f"Message sent from user {self.user.id} to conversation {conversation_id}")
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "Invalid JSON format"
            }))
        except Exception as e:
            print(f"Error in WebSocket receive: {e}")
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "Internal server error"
            }))

    async def chat_message(self, event):
        """Отправляет сообщение клиенту"""
        try:
            await self.send(text_data=json.dumps({
                "type": "chat_message",
                "message": event["message"]
            }))
        except Exception as e:
            print(f"Error sending chat message: {e}")

    @database_sync_to_async
    def check_conversation_participant(self, conversation_id):
        """Проверяет, является ли пользователь участником беседы"""
        try:
            from .models import Conversation
            conversation = Conversation.objects.get(id=conversation_id)
            return conversation.participants.filter(id=self.user.id).exists()
        except:
            return False

    @database_sync_to_async
    def save_message(self, conversation_id, content):
        """Сохраняет сообщение в базу данных"""
        try:
            from .models import Conversation, Message
            conv = Conversation.objects.get(id=conversation_id)
            msg = Message.objects.create(
                conversation=conv, 
                sender=self.user, 
                content=content
            )
            # Обновляем время последнего обновления беседы
            conv.save()
            return msg
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def get_conversation(self, conversation_id):
        """Получает объект беседы"""
        try:
            from .models import Conversation
            return Conversation.objects.get(id=conversation_id)
        except:
            return None

    @database_sync_to_async
    def get_participants(self, conversation):
        """Получает участников беседы"""
        try:
            return list(conversation.participants.all())
        except:
            return []

    @database_sync_to_async
    def serialize_message(self, message):
        """Сериализует сообщение для отправки"""
        try:
            return MessageSerializer(message).data
        except Exception as e:
            print(f"Error serializing message: {e}")
            return None