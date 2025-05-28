from rest_framework import serializers
from .models import Conversation, Message
from users.serializers import UserSerializer
from listings.serializers import ListingSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ('id', 'sender', 'content', 'is_read', 'created_at')
        read_only_fields = ('id', 'sender', 'created_at')

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    listing = ListingSerializer(read_only=True)
    
    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'listing', 'created_at', 'updated_at', 'last_message', 'unread_count')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_last_message(self, obj):
        message = obj.messages.last()
        if message:
            return MessageSerializer(message).data
        return None
    
    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()

class ConversationCreateSerializer(serializers.ModelSerializer):
    participant_id = serializers.IntegerField(write_only=True)
    listing_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Conversation
        fields = ('participant_id', 'listing_id')
    
    def create(self, validated_data):
        participant_id = validated_data.pop('participant_id')
        listing_id = validated_data.pop('listing_id', None)
        
        user = self.context['request'].user
        
        # Check if conversation already exists
        if listing_id:
            existing = Conversation.objects.filter(
                participants=user
            ).filter(
                participants=participant_id
            ).filter(
                listing_id=listing_id
            ).first()
        else:
            existing = Conversation.objects.filter(
                participants=user
            ).filter(
                participants=participant_id
            ).filter(
                listing__isnull=True
            ).first()
        
        if existing:
            return existing
        
        # Create new conversation
        conversation = Conversation.objects.create(**validated_data)
        if listing_id:
            conversation.listing_id = listing_id
            conversation.save()
        
        conversation.participants.add(user, participant_id)
        
        return conversation
