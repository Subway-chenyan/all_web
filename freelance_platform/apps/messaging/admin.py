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


# Detailed admin classes for other models
@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ('message', 'filename', 'file_size', 'file_type', 'created_at')
    list_filter = ('file_type', 'created_at')
    search_fields = ('filename', 'message__content')
    ordering = ('-created_at',)


@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ('message', 'user', 'reaction_type', 'created_at')
    list_filter = ('reaction_type', 'created_at')
    search_fields = ('message__content', 'user__username')
    ordering = ('-created_at',)


@admin.register(MessageReport)
class MessageReportAdmin(admin.ModelAdmin):
    list_display = ('message', 'reporter', 'reason', 'status', 'created_at', 'reviewed_at')
    list_filter = ('reason', 'status', 'created_at')
    search_fields = ('message__content', 'reporter__username', 'description')
    ordering = ('-created_at',)
    raw_id_fields = ('message', 'reporter')


@admin.register(MessagingStat)
class MessagingStatAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_messages', 'active_conversations', 'active_users', 'created_at')
    list_filter = ('date',)
    ordering = ('-date',)


@admin.register(ConversationTag)
class ConversationTagAdmin(admin.ModelAdmin):
    list_display = ('user', 'conversation', 'tag_name', 'color', 'created_at')
    list_filter = ('tag_name', 'created_at')
    search_fields = ('user__username', 'tag_name', 'conversation__subject')
    ordering = ('-created_at',)