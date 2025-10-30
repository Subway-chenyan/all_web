from django.contrib import admin
from .models import (
    Conversation, Message, MessageAttachment, MessageReaction,
    MessageReport, MessageTemplate, MessagingStat, BlockedUser, ConversationTag
)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('participant1', 'participant2', 'conversation_type', 'last_message_at', 'is_active', 'created_at')
    list_filter = ('conversation_type', 'is_active', 'created_at')
    search_fields = ('participant1__username', 'participant2__username')
    ordering = ('-last_message_at',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'recipient', 'message_type', 'is_read', 'created_at')
    list_filter = ('message_type', 'is_read', 'created_at')
    search_fields = ('sender__username', 'recipient__username', 'message_content')
    ordering = ('-created_at',)


@admin.register(MessageTemplate)
class MessageTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type', 'is_active', 'created_at')
    list_filter = ('template_type', 'is_active', 'created_at')
    search_fields = ('name', 'subject', 'content')
    ordering = ('name',)


@admin.register(BlockedUser)
class BlockedUserAdmin(admin.ModelAdmin):
    list_display = ('blocker', 'blocked', 'reason', 'created_at')
    list_filter = ('reason', 'created_at')
    search_fields = ('blocker__username', 'blocked__username')
    ordering = ('-created_at',)


# Register other models with basic admin
admin.site.register(MessageAttachment)
admin.site.register(MessageReaction)
admin.site.register(MessageReport)
admin.site.register(MessagingStat)
admin.site.register(ConversationTag)