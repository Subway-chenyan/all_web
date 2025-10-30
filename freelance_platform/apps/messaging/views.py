"""
消息系统API视图

这个模块包含了消息系统的所有API视图，支持：
- 对话管理
- 消息发送和接收
- 实时消息功能
- 用户拉黑和举报
- 消息模板和标签
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import (
    Conversation, Message, MessageAttachment, MessageTemplate,
    MessageReaction, BlockedUser, MessageReport, MessagingStat,
    ConversationTag
)
from .serializers import (
    ConversationListSerializer, ConversationDetailSerializer, ConversationCreateSerializer,
    MessageSerializer, MessageCreateSerializer, MessageReactionSerializer,
    BlockedUserSerializer, MessageReportSerializer, ConversationTagSerializer,
    MessageTemplateSerializer, MessagingStatSerializer
)
from apps.accounts.permissions import IsOwnerOrReadOnly


class ConversationListAPIView(generics.ListAPIView):
    """对话列表API视图"""
    serializer_class = ConversationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['subject', 'participant1__username', 'participant2__username']
    filterset_fields = ['conversation_type', 'is_active']
    ordering_fields = ['last_message_at', 'created_at']
    ordering = ['-last_message_at']

    def get_queryset(self):
        """获取当前用户的对话列表"""
        user = self.request.user
        return Conversation.objects.filter(
            Q(participant1=user) | Q(participant2=user),
            is_active=True
        ).select_related('participant1', 'participant2', 'last_message', 'order')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ConversationDetailAPIView(generics.RetrieveUpdateAPIView):
    """对话详情API视图"""
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取用户有权限访问的对话"""
        user = self.request.user
        return Conversation.objects.filter(
            Q(participant1=user) | Q(participant2=user)
        ).select_related('participant1', 'participant2', 'order')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def retrieve(self, request, *args, **kwargs):
        """获取对话详情并标记为已读"""
        instance = self.get_object()
        instance.mark_as_read(request.user)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ConversationCreateAPIView(generics.CreateAPIView):
    """创建对话API视图"""
    serializer_class = ConversationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MessageListCreateAPIView(generics.ListCreateAPIView):
    """消息列表和创建API视图"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """根据请求方法选择序列化器"""
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        """获取指定对话的消息列表"""
        conversation_id = self.kwargs.get('conversation_id')
        user = self.request.user

        # 验证用户是否有权限访问此对话
        conversation = Conversation.objects.filter(
            id=conversation_id
        ).filter(
            Q(participant1=user) | Q(participant2=user)
        ).first()

        if not conversation:
            return Message.objects.none()

        return Message.objects.filter(
            conversation=conversation
        ).select_related('sender', 'recipient', 'reply_to').prefetch_related(
            'message_attachments', 'reactions'
        ).order_by('created_at')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        """创建消息"""
        serializer.save()


class MessageReactionAPIView(generics.CreateAPIView, generics.DestroyAPIView):
    """消息表情回应API视图"""
    serializer_class = MessageReactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'reaction_type'

    def get_queryset(self):
        """获取用户的表情回应"""
        message_id = self.kwargs.get('message_id')
        return MessageReaction.objects.filter(
            message_id=message_id,
            user=self.request.user
        )

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MessageReportCreateAPIView(generics.CreateAPIView):
    """消息举报API视图"""
    serializer_class = MessageReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class BlockedUserListCreateAPIView(generics.ListCreateAPIView):
    """拉黑用户列表和创建API视图"""
    serializer_class = BlockedUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取当前用户的拉黑列表"""
        return BlockedUser.objects.filter(
            blocker=self.request.user
        ).select_related('blocked').order_by('-created_at')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class BlockedUserDestroyAPIView(generics.DestroyAPIView):
    """取消拉黑用户API视图"""
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'blocked_id'

    def get_queryset(self):
        """获取当前用户的拉黑记录"""
        return BlockedUser.objects.filter(
            blocker=self.request.user
        )

    def get_object(self):
        """根据用户ID获取拉黑记录"""
        blocked_user_id = self.kwargs.get('blocked_id')
        return BlockedUser.objects.get(
            blocker=self.request.user,
            blocked_id=blocked_user_id
        )


class ConversationTagListCreateAPIView(generics.ListCreateAPIView):
    """对话标签列表和创建API视图"""
    serializer_class = ConversationTagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取指定对话的标签"""
        conversation_id = self.kwargs.get('conversation_id')
        return ConversationTag.objects.filter(
            conversation_id=conversation_id,
            user=self.request.user
        ).order_by('tag_name')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MessageTemplateListAPIView(generics.ListAPIView):
    """消息模板列表API视图"""
    serializer_class = MessageTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'subject', 'content']
    filterset_fields = ['template_type', 'is_active']

    def get_queryset(self):
        """获取活跃的消息模板"""
        return MessageTemplate.objects.filter(
            is_active=True
        ).order_by('-usage_count', 'name')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def messaging_stats(request):
    """获取用户消息统计"""
    user = request.user

    # 基础统计
    conversations = Conversation.objects.filter(
        Q(participant1=user) | Q(participant2=user)
    )

    active_conversations = conversations.filter(is_active=True)
    archived_conversations = conversations.filter(
        Q(is_archived_by_participant1=True, participant1=user) |
        Q(is_archived_by_participant2=True, participant2=user)
    )

    # 消息统计
    sent_messages = Message.objects.filter(sender=user).count()
    received_messages = Message.objects.filter(recipient=user).count()
    unread_messages = Message.objects.filter(
        recipient=user,
        is_read=False
    ).count()

    # 拉黑统计
    blocked_count = BlockedUser.objects.filter(blocker=user).count()
    blocked_by_count = BlockedUser.objects.filter(blocked=user).count()

    stats = {
        'conversations': {
            'total': conversations.count(),
            'active': active_conversations.count(),
            'archived': archived_conversations.count()
        },
        'messages': {
            'sent': sent_messages,
            'received': received_messages,
            'unread': unread_messages
        },
        'blocked_users': {
            'blocked_by_me': blocked_count,
            'blocked_me': blocked_by_count
        }
    }

    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unread_count(request):
    """获取未读消息总数"""
    user = request.user

    # 计算未读对话数
    unread_conversations = Conversation.objects.filter(
        Q(participant1=user, participant1_unread_count__gt=0) |
        Q(participant2=user, participant2_unread_count__gt=0),
        is_active=True
    ).count()

    # 计算未读消息数
    unread_messages = Message.objects.filter(
        recipient=user,
        is_read=False
    ).count()

    return Response({
        'unread_conversations': unread_conversations,
        'unread_messages': unread_messages
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_bulk_message(request):
    """批量发送消息"""
    recipients = request.data.get('recipients', [])
    message_content = request.data.get('content', '')
    subject = request.data.get('subject', '')

    if not recipients or not message_content.strip():
        return Response({
            'error': '接收者和消息内容不能为空'
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(recipients) > 50:  # 限制批量发送数量
        return Response({
            'error': '一次最多只能发送给50个用户'
        }, status=status.HTTP_400_BAD_REQUEST)

    sender = request.user
    success_count = 0
    failed_users = []

    with transaction.atomic():
        for recipient_id in recipients:
            try:
                from apps.accounts.models import User
                recipient = User.objects.get(id=recipient_id)

                # 检查是否被拉黑
                if BlockedUser.objects.filter(
                    Q(blocker=sender, blocked=recipient) |
                    Q(blocker=recipient, blocked=sender)
                ).exists():
                    failed_users.append({
                        'user_id': recipient_id,
                        'username': recipient.username,
                        'reason': '用户被拉黑'
                    })
                    continue

                # 检查是否已存在对话
                conversation, created = Conversation.objects.get_or_create(
                    participant1=min(sender.id, recipient.id),
                    participant2=max(sender.id, recipient.id),
                    defaults={
                        'conversation_type': 'direct',
                        'subject': subject,
                        'is_active': True
                    }
                )

                # 创建消息
                message = Message.objects.create(
                    conversation=conversation,
                    sender=sender,
                    recipient=recipient,
                    message_type='text',
                    content=message_content.strip()
                )

                # 更新对话
                conversation.last_message = message
                conversation.last_message_at = message.created_at
                conversation.increment_unread_count(sender)
                conversation.save()

                success_count += 1

            except User.DoesNotExist:
                failed_users.append({
                    'user_id': recipient_id,
                    'reason': '用户不存在'
                })
            except Exception as e:
                failed_users.append({
                    'user_id': recipient_id,
                    'reason': str(e)
                })

    return Response({
        'message': '批量发送完成',
        'success_count': success_count,
        'failed_count': len(failed_users),
        'failed_users': failed_users
    })
