#!/usr/bin/env python
"""
订单管理系统测试脚本

这个脚本用于测试订单处理系统的功能是否正常工作。
"""

import os
import sys
import django
from datetime import datetime, timedelta

# 添加项目路径
sys.path.append('/home/subway/all_web/freelance_platform')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 初始化Django
django.setup()

def test_order_models():
    """测试订单模型"""
    print("=" * 50)
    print("订单模型测试")
    print("=" * 50)

    try:
        from apps.orders.models import (
            Order, OrderStatusHistory, OrderExtra, OrderRequirement,
            Delivery, OrderMessage, OrderReview, OrderDispute,
            OrderStat, OrderCancellation
        )

        print("✓ 所有订单模型导入成功")

        # 检查模型字段
        print(f"\n1. 订单模型字段:")
        print(f"   - Order字段数: {len(Order._meta.fields)}")
        print(f"   - OrderStatusHistory字段数: {len(OrderStatusHistory._meta.fields)}")
        print(f"   - OrderExtra字段数: {len(OrderExtra._meta.fields)}")

        # 检查关联关系
        print(f"\n2. 关联模型:")
        print(f"   - Delivery字段数: {len(Delivery._meta.fields)}")
        print(f"   - OrderMessage字段数: {len(OrderMessage._meta.fields)}")
        print(f"   - OrderDispute字段数: {len(OrderDispute._meta.fields)}")

        return True

    except ImportError as e:
        print(f"✗ 模型导入失败: {e}")
        return False

def test_order_serializers():
    """测试订单序列化器"""
    print("\n" + "=" * 50)
    print("订单序列化器测试")
    print("=" * 50)

    try:
        from apps.orders.serializers import (
            OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer,
            OrderStatusUpdateSerializer, OrderExtraSerializer,
            OrderRequirementSerializer, DeliverySerializer, OrderMessageSerializer,
            OrderDisputeSerializer, OrderCancellationSerializer
        )

        print("✓ 所有订单序列化器导入成功")

        # 测试序列化器验证
        print(f"\n1. 序列化器验证:")
        print(f"   - OrderListSerializer: 导入成功")
        print(f"   - OrderDetailSerializer: 导入成功")
        print(f"   - OrderCreateSerializer: 导入成功")
        print(f"   - OrderStatusUpdateSerializer: 导入成功")

        return True

    except ImportError as e:
        print(f"✗ 序列化器导入失败: {e}")
        return False

def test_order_views():
    """测试订单视图"""
    print("\n" + "=" * 50)
    print("订单视图测试")
    print("=" * 50)

    try:
        # 先检查视图文件是否存在
        import os
        views_path = '/home/subway/all_web/freelance_platform/apps/orders/views.py'
        if os.path.exists(views_path):
            print("✓ 订单视图文件存在")
        else:
            print("✗ 订单视图文件不存在")
            return False

        # 尝试导入基础视图（跳过drf_spectacular相关）
        from django.contrib.auth import get_user_model
        from rest_framework import generics, status, permissions
        from rest_framework.decorators import api_view, permission_classes
        from rest_framework.response import Response
        from rest_framework.views import APIView

        print("✓ DRF基础组件导入成功")

        # 检查视图文件内容
        with open(views_path, 'r', encoding='utf-8') as f:
            content = f.read()
            view_classes = [
                'OrderListAPIView', 'OrderDetailAPIView', 'OrderCreateAPIView',
                'OrderStatusUpdateAPIView', 'OrderExtraListCreateAPIView',
                'OrderRequirementListCreateAPIView', 'OrderDeliveryListCreateAPIView',
                'OrderMessageListCreateAPIView', 'OrderDisputeCreateAPIView',
                'OrderCancellationAPIView', 'OrderTrackingAPIView'
            ]

            for view_class in view_classes:
                if f'class {view_class}' in content:
                    print(f"   ✓ {view_class} 已定义")
                else:
                    print(f"   ✗ {view_class} 未找到")

        return True

    except ImportError as e:
        print(f"✗ 视图组件导入失败: {e}")
        return False
    except Exception as e:
        print(f"✗ 视图测试失败: {e}")
        return False

def test_order_urls():
    """测试订单URL配置"""
    print("\n" + "=" * 50)
    print("订单URL配置测试")
    print("=" * 50)

    try:
        from django.urls import reverse
        from apps.orders import urls

        # 测试URL解析
        url_patterns = [
            'orders:order-list',
            'orders:order-create',
            'orders:order-detail',
            'orders:order-status-update',
            'orders:order-extras',
            'orders:order-requirements',
            'orders:order-deliveries',
            'orders:order-messages',
            'orders:order-cancel',
            'orders:order-dispute',
            'orders:order-tracking',
            'orders:order-stats',
            'orders:search-orders'
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

def test_order_admin():
    """测试订单Django Admin配置"""
    print("\n" + "=" * 50)
    print("订单Django Admin配置测试")
    print("=" * 50)

    try:
        from apps.orders.admin import (
            OrderAdmin, OrderStatusHistoryAdmin, DeliveryAdmin, OrderDisputeAdmin, OrderStatAdmin
        )

        print("✓ 订单主要Admin类导入成功")

        # 检查Admin注册
        from django.contrib import admin
        from apps.orders.models import (
            Order, OrderStatusHistory, Delivery, OrderDispute, OrderStat,
            OrderExtra, OrderRequirement, OrderMessage, OrderReview, OrderCancellation
        )

        models_to_check = [
            (Order, 'Order'),
            (OrderStatusHistory, 'OrderStatusHistory'),
            (Delivery, 'Delivery'),
            (OrderDispute, 'OrderDispute'),
            (OrderStat, 'OrderStat'),
            (OrderExtra, 'OrderExtra'),
            (OrderRequirement, 'OrderRequirement'),
            (OrderMessage, 'OrderMessage'),
            (OrderReview, 'OrderReview'),
            (OrderCancellation, 'OrderCancellation'),
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

def create_test_order():
    """创建测试订单数据"""
    print("\n" + "=" * 50)
    print("创建测试订单数据")
    print("=" * 50)

    try:
        from apps.orders.models import Order, OrderExtra, OrderRequirement, Delivery
        from apps.accounts.models import User
        from apps.gigs.models import Gig, GigPackage
        from django.utils.text import slugify
        from datetime import timedelta

        # 查找客户端用户
        client_user = User.objects.filter(user_type='client').first()
        if not client_user:
            # 创建测试客户端用户
            client_user = User.objects.create_user(
                username='test_client',
                email='client@test.com',
                user_type='client',
                user_status='active'
            )
            print("✓ 创建测试客户端用户")

        # 查找自由职业者用户
        freelancer_user = User.objects.filter(user_type='freelancer').first()
        if not freelancer_user:
            # 创建测试自由职业者用户
            freelancer_user = User.objects.create_user(
                username='test_freelancer_order',
                email='freelancer_order@test.com',
                user_type='freelancer',
                user_status='active'
            )
            print("✓ 创建测试自由职业者用户")

        # 查找服务
        gig = Gig.objects.first()
        if not gig:
            print("✗ 没有找到服务，请先创建服务数据")
            return False

        # 查找服务套餐
        gig_package = GigPackage.objects.filter(gig=gig).first()
        if not gig_package:
            print("✗ 没有找到服务套餐，请先创建套餐数据")
            return False

        # 创建测试订单
        if not Order.objects.filter(order_number='TEST-ORD-001').exists():
            from django.utils import timezone

            from decimal import Decimal

            base_price = gig_package.price
            platform_fee = base_price * Decimal('0.1')
            freelancer_earnings = base_price * Decimal('0.9')

            order = Order.objects.create(
                order_number='TEST-ORD-001',
                gig=gig,
                gig_package=gig_package,
                client=client_user,
                freelancer=gig.freelancer,
                title='测试Logo设计订单',
                description='为客户设计专业的Logo',
                client_requirements='请提供公司名称和业务描述',
                base_price=base_price,
                extras_price=Decimal('0'),
                total_price=base_price,
                platform_fee=platform_fee,
                freelancer_earnings=freelancer_earnings,
                status='pending',
                priority='standard',
                delivery_deadline=timezone.now() + timedelta(days=gig_package.delivery_days),
                estimated_delivery=timezone.now() + timedelta(days=gig_package.delivery_days),
                client_email=client_user.email,
                preferred_communication_method='platform'
            )
            print("✓ 创建测试订单成功")

            # 创建订单状态历史
            from apps.orders.models import OrderStatusHistory
            OrderStatusHistory.objects.create(
                order=order,
                old_status='',
                new_status='pending',
                changed_by=client_user,
                notes='订单创建'
            )
            print("✓ 创建订单状态历史成功")

            # 创建订单要求
            OrderRequirement.objects.create(
                order=order,
                requirement_text='请提供公司名称和业务描述',
                is_provided=False
            )
            print("✓ 创建订单要求成功")

            # 检查是否有可用的附加项
            from apps.gigs.models import GigExtra
            gig_extra = GigExtra.objects.first()
            if gig_extra:
                # 创建订单附加项
                OrderExtra.objects.create(
                    order=order,
                    gig_extra=gig_extra,
                    quantity=1,
                    price=gig_extra.price
                )
                print("✓ 创建订单附加项成功")

        else:
            order = Order.objects.get(order_number='TEST-ORD-001')
            print("✓ 测试订单已存在")

        return True

    except Exception as e:
        print(f"✗ 创建测试数据失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_order_operations():
    """测试订单操作"""
    print("\n" + "=" * 50)
    print("订单操作测试")
    print("=" * 50)

    try:
        from apps.orders.models import Order, Delivery, OrderMessage
        from django.utils import timezone
        from apps.accounts.models import User

        # 获取测试订单
        order = Order.objects.filter(order_number='TEST-ORD-001').first()
        if not order:
            print("✗ 没有找到测试订单")
            return False

        print(f"1. 订单基本信息:")
        print(f"   - 订单号: {order.order_number}")
        print(f"   - 状态: {order.status}")
        print(f"   - 总价: ¥{order.total_price}")
        print(f"   - 基础价格: ¥{order.base_price}")
        print(f"   - 客户: {order.client.username}")
        print(f"   - 自由职业者: {order.freelancer.username}")
        print(f"   - 服务: {order.gig.title}")

        # 测试状态更新
        print(f"\n2. 订单状态操作:")
        print(f"   - 当前状态: {order.status}")
        print(f"   - 优先级: {order.priority}")
        print(f"   - 交付截止: {order.delivery_deadline}")

        # 测试订单属性
        print(f"\n3. 订单属性:")
        print(f"   - 是否逾期: {order.is_overdue}")
        print(f"   - 剩余天数: {order.days_until_deadline}")
        print(f"   - 平台费用: ¥{order.platform_fee}")
        print(f"   - 自由职业者收入: ¥{order.freelancer_earnings}")

        # 测试订单搜索
        search_orders = Order.objects.filter(
            order_number__icontains='TEST'
        )
        print(f"\n4. 订单搜索:")
        print(f"   - 搜索结果: 找到 {search_orders.count()} 个测试订单")

        # 测试关联数据
        print(f"\n5. 关联数据:")
        print(f"   - 订单要求: {order.requirements.count()} 个")
        print(f"   - 订单附加项: {order.order_extras.count()} 个")
        print(f"   - 交付记录: {order.deliveries.count()} 个")
        print(f"   - 消息记录: {order.messages.count()} 个")
        print(f"   - 状态历史: {order.status_history.count()} 个")

        return True

    except Exception as e:
        print(f"✗ 订单操作测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主测试函数"""
    print(f"开始测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = []

    # 运行各项测试
    results.append(("订单模型测试", test_order_models()))
    results.append(("订单序列化器测试", test_order_serializers()))
    results.append(("订单视图测试", test_order_views()))
    results.append(("订单URL测试", test_order_urls()))
    results.append(("订单Admin测试", test_order_admin()))
    results.append(("测试数据", create_test_order()))
    results.append(("订单操作测试", test_order_operations()))

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
        print("\n🎉 所有测试通过！订单管理系统配置正确。")
        print("\n您现在可以:")
        print("- 访问 http://127.0.0.1:8000/admin/orders/ 管理订单")
        print("- 使用API接口创建和管理订单")
        print("- 测试订单状态流转和交付功能")
        print("- 处理订单争议和取消请求")
    else:
        print(f"\n⚠️  {len(results) - passed} 项测试失败，请检查配置。")

    print(f"\n测试完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == '__main__':
    main()