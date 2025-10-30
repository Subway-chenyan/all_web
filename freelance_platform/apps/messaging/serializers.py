"""
消息系统序列化器

这个模块包含了消息和评价系统的所有序列化器，用于API数据转换和验证。
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    Conversation, Message, MessageAttachment, MessageTemplate,
    MessageReaction, BlockedUser, MessageReport, MessagingStat,
    ConversationTag
)

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    """用户最小信息序列化器"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'user_type']


class ConversationListSerializer(serializers.ModelSerializer):
    """对话列表序列化器"""
    participant_info = serializers.SerializerMethodField()
    last_message_preview = serializers.CharField(source='last_message.content', read_only=True)
    last_message_at = serializers.DateTimeField(read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'participant1', 'participant2', 'conversation_type',
            'subject', 'order', 'gig_id', 'is_active', 'last_message_preview',
            'last_message_at', 'unread_count', 'participant_info'
        ]

    def get_participant_info(self, obj):
        """获取对话参与者的信息"""
        request = self.context.get('request')
        if request and request.user:
            participant = obj.get_participant(request.user)
            if participant:
                return UserMinimalSerializer(participant).data
        return None

    def get_unread_count(self, obj):
        """获取当前用户的未读消息数"""
        request = self.context.get('request')
        if request and request.user:
            return obj.get_unread_count(request.user)
        return 0


class ConversationDetailSerializer(serializers.ModelSerializer):
    """对话详情序列化器"""
    participant1_info = UserMinimalSerializer(source='participant1', read_only=True)
    participant2_info = UserMinimalSerializer(source='participant2', read_only=True)
    messages = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'participant1', 'participant2', 'participant1_info', 'participant2_info',
            'conversation_type', 'subject', 'order', 'gig_id', 'is_active',
            'is_archived_by_participant1', 'is_archived_by_participant2',
            'is_blocked_by_participant1', 'is_blocked_by_participant2',
            'participant1_unread_count', 'participant2_unread_count',
            'unread_count', 'messages', 'created_at', 'updated_at'
        ]

    def get_messages(self, obj):
        """获取对话的消息列表"""
        messages = obj.messages.filter(
            # 过滤掉用户删除的消息
            models.Q(is_deleted_by_sender=False) | models.Q(is_deleted_by_recipient=False)
        ).order_by('created_at')

        request = self.context.get('request')
        if request and request.user:
            # 过滤掉当前用户删除的消息
            messages = messages.filter(
                models.Q(~models.Q(sender=request.user, is_deleted_by_sender=True)) &
                models.Q(~models.Q(recipient=request.user, is_deleted_by_recipient=True))
            )

        return MessageSerializer(messages, many=True, context=self.context).data

    def get_unread_count(self, obj):
        """获取当前用户的未读消息数"""
        request = self.context.get('request')
        if request and request.user:
            return obj.get_unread_count(request.user)
        return 0


class MessageAttachmentSerializer(serializers.ModelSerializer):
    """消息附件序列化器"""
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MessageAttachment
        fields = [
            'id', 'file', 'filename', 'file_size', 'file_type', 'mime_type',
            'width', 'height', 'duration', 'file_url', 'created_at'
        ]

    def get_file_url(self, obj):
        """获取文件URL"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class MessageSerializer(serializers.ModelSerializer):
    """消息序列化器"""
    sender_info = UserMinimalSerializer(source='sender', read_only=True)
    recipient_info = UserMinimalSerializer(source='recipient', read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    reactions = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'recipient', 'sender_info', 'recipient_info',
            'message_type', 'content', 'attachments', 'is_read', 'read_at',
            'is_deleted_by_sender', 'is_deleted_by_recipient', 'reply_to',
            'reactions', 'is_mine', 'time_ago', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'read_at', 'created_at', 'updated_at']

    def get_reactions(self, obj):
        """获取消息的表情回应"""
        reactions = obj.reactions.values('reaction_type').annotate(count=models.Count('id'))
        return list(reactions)

    def get_is_mine(self, obj):
        """判断是否是当前用户的消息"""
        request = self.context.get('request')
        if request and request.user:
            return obj.sender == request.user
        return False

    def get_time_ago(self, obj):
        """获取相对时间"""
        now = timezone.now()
        diff = now - obj.created_at

        if diff.days > 0:
            return f"{diff.days}天前"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours}小时前"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes}分钟前"
        else:
            return "刚刚"

    def validate(self, attrs):
        """验证消息数据"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("用户未认证")

        # 验证消息内容
        message_type = attrs.get('message_type', 'text')
        content = attrs.get('content', '')

        if message_type == 'text' and not content.strip():
            raise serializers.ValidationError("文本消息内容不能为空")

        # 验证对话参与者
        conversation = attrs.get('conversation')
        if conversation:
            if request.user not in [conversation.participant1, conversation.participant2]:
                raise serializers.ValidationError("您不是此对话的参与者")

        return attrs

    def create(self, validated_data):
        """创建消息"""
        request = self.context.get('request')
        conversation = validated_data['conversation']

        # 确定接收者
        if request.user == conversation.participant1:
            recipient = conversation.participant2
        else:
            recipient = conversation.participant1

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            recipient=recipient,
            **validated_data
        )

        # 更新对话的最后消息信息
        conversation.last_message = message
        conversation.last_message_at = message.created_at
        conversation.increment_unread_count(request.user)
        conversation.save()

        return message


class MessageCreateSerializer(serializers.ModelSerializer):
    """消息创建序列化器"""

    class Meta:
        model = Message
        fields = ['conversation', 'message_type', 'content', 'reply_to', 'metadata']

    def validate_conversation(self, value):
        """验证对话"""
        request = self.context.get('request')
        if request.user not in [value.participant1, value.participant2]:
            raise serializers.ValidationError("您不是此对话的参与者")

        # 检查对话是否被阻止
        if (request.user == value.participant1 and value.is_blocked_by_participant1) or \
           (request.user == value.participant2 and value.is_blocked_by_participant2):
            raise serializers.ValidationError("此对话已被阻止")

        return value


class MessageReactionSerializer(serializers.ModelSerializer):
    """消息表情回应序列化器"""
    user_info = UserMinimalSerializer(source='user', read_only=True)

    class Meta:
        model = MessageReaction
        fields = ['id', 'message', 'user', 'user_info', 'reaction_type', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def validate(self, attrs):
        """验证表情回应"""
        request = self.context.get('request')
        message = attrs['message']

        # 检查用户是否有权限回应此消息
        if request.user not in [message.conversation.participant1, message.conversation.participant2]:
            raise serializers.ValidationError("您不是此对话的参与者")

        # 检查是否已经回应过
        if MessageReaction.objects.filter(
            message=message,
            user=request.user,
            reaction_type=attrs['reaction_type']
        ).exists():
            raise serializers.ValidationError("您已经对此消息进行了此回应")

        return attrs

    def create(self, validated_data):
        """创建表情回应"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class MessageTemplateSerializer(serializers.ModelSerializer):
    """消息模板序列化器"""

    class Meta:
        model = MessageTemplate
        fields = [
            'id', 'name', 'template_type', 'subject', 'content', 'variables',
            'usage_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']


class BlockedUserSerializer(serializers.ModelSerializer):
    """拉黑用户序列化器"""
    blocked_user_info = UserMinimalSerializer(source='blocked', read_only=True)

    class Meta:
        model = BlockedUser
        fields = ['id', 'blocker', 'blocked', 'blocked_user_info', 'reason', 'created_at']
        read_only_fields = ['id', 'blocker', 'created_at']

    def validate_blocked(self, value):
        """验证不能拉黑自己"""
        request = self.context.get('request')
        if request.user == value:
            raise serializers.ValidationError("不能拉黑自己")
        return value

    def validate(self, attrs):
        """验证是否已经拉黑"""
        request = self.context.get('request')
        if BlockedUser.objects.filter(blocker=request.user, blocked=attrs['blocked']).exists():
            raise serializers.ValidationError("您已经拉黑了此用户")
        return attrs

    def create(self, validated_data):
        """创建拉黑记录"""
        request = self.context.get('request')
        validated_data['blocker'] = request.user

        # 拉黑用户时，阻止所有相关对话
        blocked_user = validated_data['blocked']
        conversations = Conversation.objects.filter(
            models.Q(participant1=request.user, participant2=blocked_user) |
            models.Q(participant1=blocked_user, participant2=request.user)
        )

        for conversation in conversations:
            if conversation.participant1 == request.user:
                conversation.is_blocked_by_participant1 = True
            else:
                conversation.is_blocked_by_participant2 = True
            conversation.save()

        return super().create(validated_data)


class MessageReportSerializer(serializers.ModelSerializer):
    """消息报告序列化器"""
    reporter_info = UserMinimalSerializer(source='reporter', read_only=True)
    message_info = serializers.SerializerMethodField()

    class Meta:
        model = MessageReport
        fields = [
            'id', 'message', 'message_info', 'reporter', 'reporter_info',
            'reason', 'description', 'status', 'admin_notes',
            'reviewed_by', 'reviewed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']

    def get_message_info(self, obj):
        """获取消息基本信息"""
        message = obj.message
        return {
            'id': message.id,
            'content': message.content[:100] + '...' if len(message.content) > 100 else message.content,
            'sender': message.sender.username,
            'created_at': message.created_at
        }

    def validate_message(self, value):
        """验证消息"""
        request = self.context.get('request')

        # 检查用户是否有权限报告此消息
        if request.user not in [value.conversation.participant1, value.conversation.participant2]:
            raise serializers.ValidationError("您不是此对话的参与者")

        # 检查是否已经报告过
        if MessageReport.objects.filter(message=value, reporter=request.user).exists():
            raise serializers.ValidationError("您已经报告过此消息")

        return value

    def create(self, validated_data):
        """创建消息报告"""
        request = self.context.get('request')
        validated_data['reporter'] = request.user
        return super().create(validated_data)


class ConversationTagSerializer(serializers.ModelSerializer):
    """对话标签序列化器"""

    class Meta:
        model = ConversationTag
        fields = ['id', 'user', 'conversation', 'tag_name', 'color', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def validate(self, attrs):
        """验证标签"""
        request = self.context.get('request')
        conversation = attrs['conversation']

        # 检查用户是否有权限为此对话添加标签
        if request.user not in [conversation.participant1, conversation.participant2]:
            raise serializers.ValidationError("您不是此对话的参与者")

        # 检查是否已经存在相同标签
        if ConversationTag.objects.filter(
            user=request.user,
            conversation=conversation,
            tag_name=attrs['tag_name']
        ).exists():
            raise serializers.ValidationError("此对话已有此标签")

        return attrs

    def create(self, validated_data):
        """创建对话标签"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class ConversationCreateSerializer(serializers.ModelSerializer):
    """对话创建序列化器"""
    participant2 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Conversation
        fields = [
            'participant2', 'conversation_type', 'subject', 'order', 'gig_id'
        ]

    def validate_participant2(self, value):
        """验证对话参与者"""
        request = self.context.get('request')

        # 不能自己和自己对话
        if request.user == value:
            raise serializers.ValidationError("不能自己和自己对话")

        # 检查是否已经被拉黑
        if BlockedUser.objects.filter(
            models.Q(blocker=request.user, blocked=value) |
            models.Q(blocker=value, blocked=request.user)
        ).exists():
            raise serializers.ValidationError("无法与被拉黑的用户创建对话")

        return value

    def validate(self, attrs):
        """验证对话数据"""
        request = self.context.get('request')
        participant2 = attrs['participant2']
        conversation_type = attrs.get('conversation_type', 'direct')

        # 检查是否已经存在相同的对话
        existing_conversation = Conversation.objects.filter(
            models.Q(participant1=request.user, participant2=participant2) |
            models.Q(participant1=participant2, participant2=request.user),
            conversation_type=conversation_type,
            is_active=True
        ).first()

        if existing_conversation:
            raise serializers.ValidationError("已经存在相同的对话")

        # 验证订单相关对话
        if conversation_type == 'order':
            order = attrs.get('order')
            if not order:
                raise serializers.ValidationError("订单相关对话必须指定订单")

            # 检查用户是否是订单的参与者
            if request.user not in [order.client, order.freelancer] or \
               participant2 not in [order.client, order.freelancer]:
                raise serializers.ValidationError("只有订单参与者可以创建订单相关对话")

        return attrs

    def create(self, validated_data):
        """创建对话"""
        request = self.context.get('request')

        conversation = Conversation.objects.create(
            participant1=request.user,
            participant2=validated_data['participant2'],
            **{k: v for k, v in validated_data.items() if k != 'participant2'}
        )

        return conversation


class MessagingStatSerializer(serializers.ModelSerializer):
    """消息统计序列化器"""

    class Meta:
        model = MessagingStat
        fields = [
            'id', 'date', 'total_messages', 'text_messages', 'image_messages',
            'file_messages', 'new_conversations', 'active_conversations',
            'active_users', 'message_reports', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# 导入所需的模型
from django.db import models