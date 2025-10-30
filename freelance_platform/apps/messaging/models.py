from django.db import models
from django.utils import timezone
from apps.common.models import BaseModel
from apps.accounts.models import User
from apps.orders.models import Order
import uuid


class Conversation(BaseModel):
    """Conversation between users"""

    CONVERSATION_TYPES = [
        ('direct', 'Direct Message'),
        ('order', 'Order Related'),
        ('gig_inquiry', 'Gig Inquiry'),
        ('support', 'Support'),
    ]

    # Participants
    participant1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations_as_participant1'
    )
    participant2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations_as_participant2'
    )

    # Conversation details
    conversation_type = models.CharField(
        max_length=20,
        choices=CONVERSATION_TYPES,
        default='direct',
        db_index=True
    )
    subject = models.CharField(max_length=200, blank=True)

    # Related object (optional)
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversations'
    )
    gig_id = models.UUIDField(null=True, blank=True, db_index=True)  # Reference to gig

    # Status and settings
    is_active = models.BooleanField(default=True, db_index=True)
    is_archived_by_participant1 = models.BooleanField(default=False, db_index=True)
    is_archived_by_participant2 = models.BooleanField(default=False, db_index=True)

    # Last message info
    last_message = models.ForeignKey(
        'Message',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='last_message_in_conversations'
    )
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)

    # Read status
    participant1_unread_count = models.PositiveIntegerField(default=0, db_index=True)
    participant2_unread_count = models.PositiveIntegerField(default=0, db_index=True)

    # Blocking
    is_blocked_by_participant1 = models.BooleanField(default=False, db_index=True)
    is_blocked_by_participant2 = models.BooleanField(default=False, db_index=True)

    class Meta:
        db_table = 'messaging_conversation'
        verbose_name = '对话'
        verbose_name_plural = '对话'
        indexes = [
            models.Index(fields=['participant1', 'is_active']),
            models.Index(fields=['participant2', 'is_active']),
            models.Index(fields=['conversation_type']),
            models.Index(fields=['order']),
            models.Index(fields=['gig_id']),
            models.Index(fields=['last_message_at']),
            models.Index(fields=['participant1_unread_count']),
            models.Index(fields=['participant2_unread_count']),
        ]

    def __str__(self):
        return f"Conversation between {self.participant1.username} and {self.participant2.username}"

    def get_participant(self, user):
        """Get the other participant in the conversation"""
        if user == self.participant1:
            return self.participant2
        elif user == self.participant2:
            return self.participant1
        return None

    def get_unread_count(self, user):
        """Get unread count for a specific user"""
        if user == self.participant1:
            return self.participant1_unread_count
        elif user == self.participant2:
            return self.participant2_unread_count
        return 0

    def mark_as_read(self, user):
        """Mark conversation as read for a specific user"""
        if user == self.participant1:
            self.participant1_unread_count = 0
        elif user == self.participant2:
            self.participant2_unread_count = 0
        self.save(update_fields=['participant1_unread_count', 'participant2_unread_count'])

    def increment_unread_count(self, sender):
        """Increment unread count for recipient"""
        if sender == self.participant1:
            self.participant2_unread_count += 1
        elif sender == self.participant2:
            self.participant1_unread_count += 1
        self.save(update_fields=['participant1_unread_count', 'participant2_unread_count'])


class Message(BaseModel):
    """Individual messages in conversations"""

    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
        ('audio', 'Audio'),
        ('video', 'Video'),
        ('system', 'System'),
        ('order_update', 'Order Update'),
        ('gig_recommendation', 'Gig Recommendation'),
    ]

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )

    # Message content
    message_type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default='text',
        db_index=True
    )
    content = models.TextField(blank=True)

    # Attachments
    attachments = models.JSONField(default=list, blank=True)  # Array of attachment info

    # Status
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    is_deleted_by_sender = models.BooleanField(default=False, db_index=True)
    is_deleted_by_recipient = models.BooleanField(default=False, db_index=True)

    # Message threading
    reply_to = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replies'
    )

    # Metadata
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'messaging_message'
        verbose_name = '消息'
        verbose_name_plural = '消息'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender']),
            models.Index(fields=['recipient']),
            models.Index(fields=['message_type']),
            models.Index(fields=['is_read']),
            models.Index(fields=['reply_to']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username}"

    def mark_as_read(self):
        """Mark message as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

    def delete_for_user(self, user):
        """Soft delete message for specific user"""
        if user == self.sender:
            self.is_deleted_by_sender = True
        elif user == self.recipient:
            self.is_deleted_by_recipient = True
        self.save(update_fields=['is_deleted_by_sender', 'is_deleted_by_recipient'])


class MessageAttachment(BaseModel):
    """File attachments for messages"""

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='message_attachments')

    file = models.FileField(upload_to='message_attachments/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    file_type = models.CharField(max_length=100)
    mime_type = models.CharField(max_length=100)

    # Image/Video specific
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)  # For audio/video

    class Meta:
        db_table = 'messaging_message_attachment'
        verbose_name = '消息附件'
        verbose_name_plural = '消息附件'
        indexes = [
            models.Index(fields=['message']),
            models.Index(fields=['file_type']),
        ]

    def __str__(self):
        return f"Attachment {self.filename} for message {self.message.id}"


class MessageTemplate(BaseModel):
    """Pre-defined message templates"""

    TEMPLATE_TYPES = [
        ('greeting', 'Greeting'),
        ('order_start', 'Order Start'),
        ('delivery', 'Delivery'),
        ('revision_request', 'Revision Request'),
        ('completion', 'Completion'),
        ('support', 'Support'),
        ('marketing', 'Marketing'),
    ]

    name = models.CharField(max_length=100, db_index=True)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES, db_index=True)
    subject = models.CharField(max_length=200, blank=True)
    content = models.TextField()

    # Variables in template (e.g., {{client_name}}, {{order_number}})
    variables = models.JSONField(default=list, blank=True)

    # Usage statistics
    usage_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'messaging_message_template'
        verbose_name = '消息模板'
        verbose_name_plural = '消息模板'
        indexes = [
            models.Index(fields=['template_type']),
            models.Index(fields=['is_active']),
            models.Index(fields=['usage_count']),
        ]

    def __str__(self):
        return f"Template: {self.name}"


class MessageReaction(BaseModel):
    """Reactions to messages (emoji responses)"""

    REACTION_TYPES = [
        ('like', '👍'),
        ('love', '❤️'),
        ('laugh', '😄'),
        ('wow', '😮'),
        ('sad', '😢'),
        ('angry', '😠'),
    ]

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_reactions')
    reaction_type = models.CharField(max_length=20, choices=REACTION_TYPES, db_index=True)

    class Meta:
        db_table = 'messaging_message_reaction'
        verbose_name = '消息表情回应'
        verbose_name_plural = '消息表情回应'
        unique_together = ['message', 'user', 'reaction_type']
        indexes = [
            models.Index(fields=['message', 'reaction_type']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.username} {self.get_reaction_type_display()} message {self.message.id}"


class BlockedUser(BaseModel):
    """Blocked users list"""

    blocker = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blocked_users'
    )
    blocked = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blocked_by_users'
    )
    reason = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'messaging_blocked_user'
        verbose_name = '拉黑用户'
        verbose_name_plural = '拉黑用户'
        unique_together = ['blocker', 'blocked']
        indexes = [
            models.Index(fields=['blocker']),
            models.Index(fields=['blocked']),
        ]

    def __str__(self):
        return f"{self.blocker.username} blocked {self.blocked.username}"


class MessageReport(BaseModel):
    """Report inappropriate messages"""

    REPORT_REASONS = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('inappropriate', 'Inappropriate Content'),
        ('fraud', 'Fraud'),
        ('threat', 'Threat'),
        ('other', 'Other'),
    ]

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_messages')
    reason = models.CharField(max_length=50, choices=REPORT_REASONS, db_index=True)
    description = models.TextField(blank=True)

    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('reviewed', 'Reviewed'),
            ('resolved', 'Resolved'),
            ('dismissed', 'Dismissed'),
        ],
        default='pending',
        db_index=True
    )

    # Admin response
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_message_reports'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'messaging_message_report'
        verbose_name = '消息报告'
        verbose_name_plural = '消息报告'
        indexes = [
            models.Index(fields=['message']),
            models.Index(fields=['reporter']),
            models.Index(fields=['reason']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Report on message {self.message.id}: {self.reason}"


class MessagingStat(BaseModel):
    """Daily messaging statistics"""

    date = models.DateField(db_index=True)

    # Message counts
    total_messages = models.PositiveIntegerField(default=0)
    text_messages = models.PositiveIntegerField(default=0)
    image_messages = models.PositiveIntegerField(default=0)
    file_messages = models.PositiveIntegerField(default=0)

    # Conversation counts
    new_conversations = models.PositiveIntegerField(default=0)
    active_conversations = models.PositiveIntegerField(default=0)

    # User activity
    active_users = models.PositiveIntegerField(default=0)

    # Reports
    message_reports = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'messaging_messaging_stat'
        verbose_name = '消息统计'
        verbose_name_plural = '消息统计'
        unique_together = ['date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"Messaging stats for {self.date}"


class ConversationTag(BaseModel):
    """Tags for organizing conversations"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversation_tags')
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='tags')
    tag_name = models.CharField(max_length=50, db_index=True)
    color = models.CharField(max_length=7, default='#007bff')  # Hex color code

    class Meta:
        db_table = 'messaging_conversation_tag'
        verbose_name = '对话标签'
        verbose_name_plural = '对话标签'
        unique_together = ['user', 'conversation', 'tag_name']
        indexes = [
            models.Index(fields=['user', 'tag_name']),
            models.Index(fields=['conversation']),
        ]

    def __str__(self):
        return f"{self.user.username} tagged conversation {self.conversation.id} as {self.tag_name}"