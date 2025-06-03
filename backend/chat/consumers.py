import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user = self.scope['user']
        
        if not self.user.is_authenticated or str(self.user.id) != self.user_id:
            await self.close()
            return
        
        self.user_group_name = f'chat_{self.user_id}'
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'chat_message':
            conversation_id = data.get('conversation_id')
            content = data.get('content')

            message = await self.save_message(conversation_id, content)
            conversation = await self.get_conversation(conversation_id)

            for participant in await self.get_participants(conversation):
                participant_group_name = f'chat_{participant.id}'
                await self.channel_layer.group_send(
                    participant_group_name,
                    {
                        'type': 'chat_message',
                        'message': {
                            'id': message.id,
                            'conversation_id': conversation_id,
                            'sender_id': self.user.id,
                            'sender_name': self.user.username,
                            'content': content,
                            'is_read': False,
                            'created_at': message.created_at.isoformat()
                        }
                    }
                )
    
    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    @database_sync_to_async
    def save_message(self, conversation_id, content):
        from .models import Conversation, Message
        conversation = Conversation.objects.get(id=conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            content=content
        )
        conversation.save()
        return message

    @database_sync_to_async
    def get_conversation(self, conversation_id):
        from .models import Conversation
        return Conversation.objects.get(id=conversation_id)

    @database_sync_to_async
    def get_participants(self, conversation):
        return list(conversation.participants.all())
