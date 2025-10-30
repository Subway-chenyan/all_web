"""
消息系统URL配置

这个模块定义了消息系统的所有URL路由，包括：
- 对话管理
- 消息发送和接收
- 用户拉黑和举报
- 消息模板和标签
"""

from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    # 对话管理
    path('', views.ConversationListAPIView.as_view(), name='conversation-list'),
    path('create/', views.ConversationCreateAPIView.as_view(), name='conversation-create'),
    path('<int:pk>/', views.ConversationDetailAPIView.as_view(), name='conversation-detail'),

    # 消息管理
    path('<int:conversation_id>/messages/', views.MessageListCreateAPIView.as_view(), name='message-list-create'),
    path('messages/<int:message_id>/reactions/', views.MessageReactionAPIView.as_view(), name='message-reactions'),
    path('messages/<int:message_id>/report/', views.MessageReportCreateAPIView.as_view(), name='message-report'),

    # 拉黑用户管理
    path('blocked-users/', views.BlockedUserListCreateAPIView.as_view(), name='blocked-user-list-create'),
    path('blocked-users/<int:blocked_id>/', views.BlockedUserDestroyAPIView.as_view(), name='blocked-user-destroy'),

    # 对话标签
    path('<int:conversation_id>/tags/', views.ConversationTagListCreateAPIView.as_view(), name='conversation-tag-list-create'),

    # 消息模板
    path('templates/', views.MessageTemplateListAPIView.as_view(), name='message-template-list'),

    # 统计和工具
    path('stats/', views.messaging_stats, name='messaging-stats'),
    path('unread-count/', views.get_unread_count, name='unread-count'),
    path('bulk-send/', views.send_bulk_message, name='bulk-send'),
]
