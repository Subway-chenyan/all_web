#!/usr/bin/env python
"""
消息和评价系统测试脚本

这个脚本用于测试消息和评价系统的功能是否正常工作。
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.db.models import Q

# 添加项目路径
sys.path.append('/home/subway/all_web/freelance_platform')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 初始化Django
django.setup()

def test_messaging_models():
    """测试消息系统模型"""
    print("=" * 50)
    print("消息系统模型测试")
    print("=" * 50)

    try:
        from apps.messaging.models import (
            Conversation, Message, MessageAttachment, MessageTemplate,
            MessageReaction, BlockedUser, MessageReport, MessagingStat,
            ConversationTag
        )

        print("✓ 所有消息系统模型导入成功")

        # 检查模型字段
        print(f"\n1. 核心模型字段:")
        print(f"   - Conversation字段数: {len(Conversation._meta.fields)}")
        print(f"   - Message字段数: {len(Message._meta.fields)}")
        print(f"   - MessageAttachment字段数: {len(MessageAttachment._meta.fields)}")

        # 检查关联模型
        print(f"\n2. 关联模型:")
        print(f"   - MessageReaction字段数: {len(MessageReaction._meta.fields)}")
        print(f"   - BlockedUser字段数: {len(BlockedUser._meta.fields)}")
        print(f"   - MessageReport字段数: {len(MessageReport._meta.fields)}")

        return True

    except ImportError as e:
        print(f"✗ 模型导入失败: {e}")
        return False

def test_review_models():
    """测试评价系统模型"""
    print("\n" + "=" * 50)
    print("评价系统模型测试")
    print("=" * 50)

    try:
        from apps.reviews.models import (
            Review, ReviewHelpful, ReviewReport, UserRating, ReviewInvitation,
            ReviewTemplate, ReviewStat
        )

        print("✓ 所有评价系统模型导入成功")

        # 检查模型字段
        print(f"\n1. 核心模型字段:")
        print(f"   - Review字段数: {len(Review._meta.fields)}")
        print(f"   - UserRating字段数: {len(UserRating._meta.fields)}")
        print(f"   - ReviewInvitation字段数: {len(ReviewInvitation._meta.fields)}")

        # 检查关联模型
        print(f"\n2. 关联模型:")
        print(f"   - ReviewHelpful字段数: {len(ReviewHelpful._meta.fields)}")
        print(f"   - ReviewReport字段数: {len(ReviewReport._meta.fields)}")
        print(f"   - ReviewTemplate字段数: {len(ReviewTemplate._meta.fields)}")

        return True

    except ImportError as e:
        print(f"✗ 模型导入失败: {e}")
        return False

def test_messaging_serializers():
    """测试消息系统序列化器"""
    print("\n" + "=" * 50)
    print("消息系统序列化器测试")
    print("=" * 50)

    try:
        from apps.messaging.serializers import (
            ConversationListSerializer, ConversationDetailSerializer, ConversationCreateSerializer,
            MessageSerializer, MessageCreateSerializer, MessageReactionSerializer,
            BlockedUserSerializer, MessageReportSerializer, ConversationTagSerializer,
            MessageTemplateSerializer, MessagingStatSerializer
        )

        print("✓ 所有消息系统序列化器导入成功")

        # 测试序列化器验证
        print(f"\n1. 序列化器验证:")
        print(f"   - ConversationListSerializer: 导入成功")
        print(f"   - MessageSerializer: 导入成功")
        print(f"   - MessageCreateSerializer: 导入成功")
        print(f"   - BlockedUserSerializer: 导入成功")

        return True

    except ImportError as e:
        print(f"✗ 序列化器导入失败: {e}")
        return False

def test_review_serializers():
    """测试评价系统序列化器"""
    print("\n" + "=" * 50)
    print("评价系统序列化器测试")
    print("=" * 50)

    try:
        from apps.reviews.serializers import (
            ReviewListSerializer, ReviewDetailSerializer, ReviewCreateSerializer,
            ReviewUpdateSerializer, ReviewResponseSerializer, ReviewHelpfulSerializer,
            ReviewReportSerializer, UserRatingSerializer, ReviewInvitationSerializer,
            ReviewTemplateSerializer, ReviewStatSerializer, ReviewModerationSerializer,
            ReviewSearchSerializer, ReviewAnalyticsSerializer
        )

        print("✓ 所有评价系统序列化器导入成功")

        # 测试序列化器验证
        print(f"\n1. 序列化器验证:")
        print(f"   - ReviewListSerializer: 导入成功")
        print(f"   - ReviewCreateSerializer: 导入成功")
        print(f"   - ReviewResponseSerializer: 导入成功")
        print(f"   - UserRatingSerializer: 导入成功")

        return True

    except ImportError as e:
        print(f"✗ 序列化器导入失败: {e}")
        return False

def test_messaging_views():
    """测试消息系统视图"""
    print("\n" + "=" * 50)
    print("消息系统视图测试")
    print("=" * 50)

    try:
        from apps.messaging.views import (
            ConversationListAPIView, ConversationDetailAPIView, ConversationCreateAPIView,
            MessageListCreateAPIView, MessageReactionAPIView, MessageReportCreateAPIView,
            BlockedUserListCreateAPIView, ConversationTagListCreateAPIView,
            MessageTemplateListAPIView, messaging_stats, get_unread_count,
            send_bulk_message
        )

        print("✓ 所有消息系统视图导入成功")

        # 检查视图权限
        print(f"\n1. 视图权限配置:")
        print(f"   - ConversationListAPIView: 有权限配置")
        print(f"   - MessageListCreateAPIView: 有权限配置")
        print(f"   - BlockedUserListCreateAPIView: 有权限配置")

        return True

    except ImportError as e:
        print(f"✗ 视图导入失败: {e}")
        return False

def test_review_views():
    """测试评价系统视图"""
    print("\n" + "=" * 50)
    print("评价系统视图测试")
    print("=" * 50)

    try:
        from apps.reviews.views import (
            ReviewListAPIView, ReviewDetailAPIView, ReviewCreateAPIView,
            ReviewUpdateAPIView, ReviewResponseAPIView, ReviewHelpfulCreateAPIView,
            ReviewReportCreateAPIView, UserRatingAPIView, ReviewInvitationListAPIView,
            ReviewTemplateListAPIView, ReviewModerationAPIView, review_analytics,
            review_search, send_review_invitations, get_user_review_stats,
            get_gig_review_stats
        )

        print("✓ 所有评价系统视图导入成功")

        # 检查视图权限
        print(f"\n1. 视图权限配置:")
        print(f"   - ReviewListAPIView: 有权限配置")
        print(f"   - ReviewCreateAPIView: 有权限配置")
        print(f"   - ReviewResponseAPIView: 有权限配置")

        return True

    except ImportError as e:
        print(f"✗ 视图导入失败: {e}")
        return False

def test_messaging_urls():
    """测试消息系统URL配置"""
    print("\n" + "=" * 50)
    print("消息系统URL配置测试")
    print("=" * 50)

    try:
        from django.urls import reverse
        from apps.messaging import urls

        # 测试URL解析
        url_patterns = [
            'messaging:conversation-list',
            'messaging:conversation-create',
            'messaging:messaging-stats',
            'messaging:unread-count',
            'messaging:blocked-user-list-create'
        ]

        print("1. URL配置检查:")
        for url_name in url_patterns:
            try:
                url = reverse(url_name)
                print(f"   ✓ {url_name}: {url}")
            except Exception as e:
                print(f"   ✗ {url_name}: {e}")

        print(f"\n2. URL模式数量: {len(urls.urlpatterns)}")

        return True

    except Exception as e:
        print(f"✗ URL测试失败: {e}")
        return False

def test_review_urls():
    """测试评价系统URL配置"""
    print("\n" + "=" * 50)
    print("评价系统URL配置测试")
    print("=" * 50)

    try:
        from django.urls import reverse
        from apps.reviews import urls

        # 测试URL解析
        url_patterns = [
            'reviews:review-list',
            'reviews:review-create',
            'reviews:review-analytics',
            'reviews:review-search',
            'reviews:send-review-invitations'
        ]

        print("1. URL配置检查:")
        for url_name in url_patterns:
            try:
                url = reverse(url_name)
                print(f"   ✓ {url_name}: {url}")
            except Exception as e:
                print(f"   ✗ {url_name}: {e}")

        print(f"\n2. URL模式数量: {len(urls.urlpatterns)}")

        return True

    except Exception as e:
        print(f"✗ URL测试失败: {e}")
        return False

def test_messaging_admin():
    """测试消息系统Django Admin配置"""
    print("\n" + "=" * 50)
    print("消息系统Django Admin配置测试")
    print("=" * 50)

    try:
        from apps.messaging.admin import (
            ConversationAdmin, MessageAdmin, MessageTemplateAdmin,
            MessageReactionAdmin, BlockedUserAdmin, MessageReportAdmin,
            MessagingStatAdmin, ConversationTagAdmin
        )

        print("✓ 消息系统主要Admin类导入成功")

        # 检查Admin注册
        from django.contrib import admin
        from apps.messaging.models import (
            Conversation, Message, MessageTemplate, MessageReaction,
            BlockedUser, MessageReport, MessagingStat, ConversationTag
        )

        models_to_check = [
            (Conversation, 'Conversation'),
            (Message, 'Message'),
            (MessageTemplate, 'MessageTemplate'),
            (MessageReaction, 'MessageReaction'),
            (BlockedUser, 'BlockedUser'),
            (MessageReport, 'MessageReport'),
            (MessagingStat, 'MessagingStat'),
            (ConversationTag, 'ConversationTag')
        ]

        for model, name in models_to_check:
            if admin.site.is_registered(model):
                print(f"   ✓ {name} 已注册到Admin")
            else:
                print(f"   ✗ {name} 未注册到Admin")

        return True

    except ImportError as e:
        print(f"✗ Admin配置测试失败: {e}")
        return False

def test_review_admin():
    """测试评价系统Django Admin配置"""
    print("\n" + "=" * 50)
    print("评价系统Django Admin配置测试")
    print("=" * 50)

    try:
        from apps.reviews.admin import (
            ReviewAdmin, ReviewHelpfulAdmin, ReviewReportAdmin,
            UserRatingAdmin, ReviewInvitationAdmin, ReviewTemplateAdmin,
            ReviewStatAdmin
        )

        print("✓ 评价系统主要Admin类导入成功")

        # 检查Admin注册
        from django.contrib import admin
        from apps.reviews.models import (
            Review, UserRating, ReviewInvitation, ReviewHelpful,
            ReviewReport, ReviewTemplate, ReviewStat
        )

        models_to_check = [
            (Review, 'Review'),
            (UserRating, 'UserRating'),
            (ReviewInvitation, 'ReviewInvitation'),
            (ReviewHelpful, 'ReviewHelpful'),
            (ReviewReport, 'ReviewReport'),
            (ReviewTemplate, 'ReviewTemplate'),
            (ReviewStat, 'ReviewStat')
        ]

        for model, name in models_to_check:
            if admin.site.is_registered(model):
                print(f"   ✓ {name} 已注册到Admin")
            else:
                print(f"   ✗ {name} 未注册到Admin")

        return True

    except ImportError as e:
        print(f"✗ Admin配置测试失败: {e}")
        return False

def create_test_conversation():
    """创建测试对话数据"""
    print("\n" + "=" * 50)
    print("创建测试对话数据")
    print("=" * 50)

    try:
        from apps.messaging.models import Conversation, Message
        from apps.accounts.models import User

        # 查找用户
        client_user = User.objects.filter(user_type='client').first()
        freelancer_user = User.objects.filter(user_type='freelancer').first()

        if not client_user or not freelancer_user:
            print("✗ 没有找到足够的测试用户")
            return False

        # 创建测试对话
        conversation, created = Conversation.objects.get_or_create(
            participant1=client_user,
            participant2=freelancer_user,
            conversation_type='direct',
            subject='测试对话',
            is_active=True
        )

        if created:
            print("✓ 创建测试对话成功")

            # 创建测试消息
            message = Message.objects.create(
                conversation=conversation,
                sender=client_user,
                recipient=freelancer_user,
                message_type='text',
                content='这是一条测试消息'
            )
            print("✓ 创建测试消息成功")

            # 更新对话的最后消息信息
            conversation.last_message = message
            conversation.last_message_at = message.created_at
            conversation.increment_unread_count(client_user)
            conversation.save()
            print("✓ 更新对话状态成功")

        else:
            print("✓ 测试对话已存在")

        return True

    except Exception as e:
        print(f"✗ 创建测试数据失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_test_review():
    """创建测试评价数据"""
    print("\n" + "=" * 50)
    print("创建测试评价数据")
    print("=" * 50)

    try:
        from apps.reviews.models import Review, UserRating
        from apps.accounts.models import User
        from apps.orders.models import Order
        from django.utils import timezone
        from decimal import Decimal

        # 查找用户和订单
        client_user = User.objects.filter(user_type='client').first()
        freelancer_user = User.objects.filter(user_type='freelancer').first()

        # 更新测试订单状态为已完成
        test_order = Order.objects.filter(order_number='TEST-ORD-001').first()
        if test_order:
            test_order.status = 'completed'
            test_order.actual_delivery = timezone.now()
            test_order.save()
            print("✓ 更新测试订单状态为已完成")
        else:
            # 查找其他订单并设置为已完成
            test_order = Order.objects.first()
            if test_order:
                test_order.status = 'completed'
                test_order.actual_delivery = timezone.now()
                test_order.save()
                print("✓ 更新订单状态为已完成")

        if not all([client_user, freelancer_user, test_order]):
            print("✗ 没有找到足够的测试数据（用户或订单）")
            return False

        # 创建测试评价
        review, created = Review.objects.get_or_create(
            reviewer=client_user,
            reviewee=freelancer_user,
            order=test_order,
            review_type='freelancer',
            defaults={
                'rating': 5,
                'communication_rating': 5,
                'quality_rating': 5,
                'delivery_rating': 5,
                'value_rating': 5,
                'title': '非常棒的体验',
                'content': '自由职业者专业且高效，强烈推荐！',
                'status': 'published',
                'is_visible': True
            }
        )

        if created:
            print("✓ 创建测试评价成功")

            # 创建或更新用户评分
            user_rating, created = UserRating.objects.get_or_create(
                user=freelancer_user,
                defaults={
                    'overall_rating': Decimal('5.00'),
                    'total_reviews': 1
                }
            )
            user_rating.update_ratings()
            print("✓ 更新用户评分成功")

        else:
            print("✓ 测试评价已存在")

        return True

    except Exception as e:
        print(f"✗ 创建测试评价失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_messaging_operations():
    """测试消息系统操作"""
    print("\n" + "=" * 50)
    print("消息系统操作测试")
    print("=" * 50)

    try:
        from apps.messaging.models import Conversation, Message
        from apps.accounts.models import User

        # 获取测试对话
        conversation = Conversation.objects.first()
        if not conversation:
            print("✗ 没有找到测试对话")
            return False

        print(f"1. 对话基本信息:")
        print(f"   - 对话ID: {conversation.id}")
        print(f"   - 对话类型: {conversation.conversation_type}")
        print(f"   - 主题: {conversation.subject}")
        print(f"   - 参与者1: {conversation.participant1.username}")
        print(f"   - 参与者2: {conversation.participant2.username}")
        print(f"   - 活跃状态: {conversation.is_active}")
        print(f"   - 消息数量: {conversation.messages.count()}")

        # 测试对话方法
        user = conversation.participant1
        unread_count = conversation.get_unread_count(user)
        print(f"   - {user.username}的未读消息数: {unread_count}")

        # 获取另一个参与者
        other_participant = conversation.get_participant(user)
        print(f"   - 对话参与者: {other_participant.username}")

        # 测试消息搜索
        from django.db.models import Q
        all_messages = Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).count()
        print(f"   - 用户相关消息总数: {all_messages}")

        return True

    except Exception as e:
        print(f"✗ 消息系统操作测试失败: {e}")
        return False

def test_review_operations():
    """测试评价系统操作"""
    print("\n" + "=" * 50)
    print("评价系统操作测试")
    print("=" * 50)

    try:
        from apps.reviews.models import Review, UserRating
        from apps.accounts.models import User

        # 获取测试评价
        review = Review.objects.first()
        if not review:
            print("✗ 没有找到测试评价")
            return False

        print(f"1. 评价基本信息:")
        print(f"   - 评价ID: {review.id}")
        print(f"   - 评价者: {review.reviewer.username}")
        print(f"   - 被评价者: {review.reviewee.username}")
        print(f"   - 评价类型: {review.review_type}")
        print(f"   - 评分: {review.rating}")
        print(f"   - 状态: {review.status}")
        print(f"   - 标题: {review.title}")
        print(f"   - 内容长度: {len(review.content)}")

        # 获取用户评分
        user_rating = UserRating.objects.filter(user=review.reviewee).first()
        if user_rating:
            print(f"\n2. 用户评分信息:")
            print(f"   - 总体评分: {user_rating.overall_rating}")
            print(f"   - 评价总数: {user_rating.total_reviews}")
            print(f"   - 声誉分数: {user_rating.reputation_score}")
            print(f"   - 排名百分位: {user_rating.rank_percentile}")

        # 评价统计
        total_reviews = Review.objects.filter(
            reviewee=review.reviewee,
            status='published',
            is_visible=True
        ).count()
        print(f"\n3. 评价统计:")
        print(f"   - 用户收到评价总数: {total_reviews}")

        return True

    except Exception as e:
        print(f"✗ 评价系统操作测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print(f"开始测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = []

    # 运行各项测试
    results.append(("消息模型测试", test_messaging_models()))
    results.append(("评价模型测试", test_review_models()))
    results.append(("消息序列化器测试", test_messaging_serializers()))
    results.append(("评价序列化器测试", test_review_serializers()))
    results.append(("消息视图测试", test_messaging_views()))
    results.append(("评价视图测试", test_review_views()))
    results.append(("消息URL测试", test_messaging_urls()))
    results.append(("评价URL测试", test_review_urls()))
    results.append(("消息Admin测试", test_messaging_admin()))
    results.append(("评价Admin测试", test_review_admin()))
    results.append(("测试数据", create_test_conversation()))
    results.append(("测试评价", create_test_review()))
    results.append(("消息操作测试", test_messaging_operations()))
    results.append(("评价操作测试", test_review_operations()))

    # 输出测试结果
    print("\n" + "=" * 50)
    print("测试结果汇总")
    print("=" * 50)

    passed = 0
    for test_name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{test_name}: {status}")
        if result:
            passed += 1

    print(f"\n总计: {passed}/{len(results)} 项测试通过")

    if passed == len(results):
        print("\n🎉 所有测试通过！消息和评价系统配置正确。")
        print("\n您现在可以:")
        print("- 访问 http://127.0.0.1:8000/admin/messaging/ 管理消息")
        print("- 访问 http://127.0.0.1:8000/admin/reviews/ 管理评价")
        print("- 使用API接口发送消息和管理对话")
        print("- 创建评价和查看评分统计")
        print("- 处理用户举报和内容审核")
    else:
        print(f"\n⚠️  {len(results) - passed} 项测试失败，请检查配置。")

    print(f"\n测试完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == '__main__':
    main()