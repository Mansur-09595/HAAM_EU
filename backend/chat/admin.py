# admin.py с jazzmin UI и улучшенными админ-классами
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ('sender', 'content', 'is_read', 'created_at')
    show_change_link = True
    ordering = ['-created_at']
    verbose_name_plural = "Messages"


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing_title', 'participants_display', 'message_count', 'last_message_time', 'open_link')
    list_display_links = ('id', 'listing_title')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('listing__title', 'participants__username')
    filter_horizontal = ('participants',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [MessageInline]

    def listing_title(self, obj):
        return getattr(obj.listing, 'title', '—')
    listing_title.short_description = "Listing"

    def participants_display(self, obj):
        return ", ".join([user.username for user in obj.participants.all()])
    participants_display.short_description = "Participants"

    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = "# Messages"

    def last_message_time(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        return last_msg.created_at if last_msg else "—"
    last_message_time.short_description = "Last Msg Time"

    def open_link(self, obj):
        url = reverse('admin:chat_conversation_change', args=[obj.pk])
        return format_html(f"<a class='button' style='padding:4px 10px; background:#1688f0; color:#fff; border-radius:4px;' href='{url}' target='_blank'>Open</a>")
    open_link.short_description = "Action"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation_id', 'sender_username', 'short_content', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('content', 'sender__username', 'conversation__id')
    readonly_fields = ('created_at',)

    def sender_username(self, obj):
        return obj.sender.username
    sender_username.short_description = "Sender"

    def conversation_id(self, obj):
        return obj.conversation.id
    conversation_id.short_description = "Conversation"

    def short_content(self, obj):
        return obj.content[:50] + ('...' if len(obj.content) > 50 else '')
    short_content.short_description = "Message"
