from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Sum, Avg, Count
from django.core.exceptions import ValidationError
from datetime import timedelta

from .models import (
    Order, OrderStatusHistory, OrderExtra, OrderRequirement,
    Delivery, OrderMessage, OrderReview, OrderDispute,
    OrderStat, OrderCancellation
)

User = get_user_model()


class OrderExtraSerializer(serializers.ModelSerializer):
    """订单附加项序列化器"""
    gig_extra_title = serializers.CharField(source='gig_extra.title', read_only=True)

    class Meta:
        model = OrderExtra
        fields = ['id', 'gig_extra', 'gig_extra_title', 'quantity', 'price']


class OrderRequirementSerializer(serializers.ModelSerializer):
    """订单需求序列化器"""

    class Meta:
        model = OrderRequirement
        fields = ['id', 'requirement_text', 'response', 'is_provided', 'provided_at', 'attachments']
        read_only_fields = ['id', 'provided_at']


class DeliverySerializer(serializers.ModelSerializer):
    """交付序列化器"""
    previous_delivery_info = serializers.SerializerMethodField()

    class Meta:
        model = Delivery
        fields = [
            'id', 'title', 'description', 'message', 'files', 'file_count',
            'is_final_delivery', 'is_accepted', 'accepted_at', 'rejected_reason',
            'revision_number', 'previous_delivery_info', 'created_at'
        ]
        read_only_fields = ['id', 'accepted_at', 'created_at']

    def get_previous_delivery_info(self, obj):
        if obj.previous_delivery:
            return {
                'id': obj.previous_delivery.id,
                'title': obj.previous_delivery.title,
                'created_at': obj.previous_delivery.created_at
            }
        return None


class OrderMessageSerializer(serializers.ModelSerializer):
    """订单消息序列化器"""
    sender_info = serializers.SerializerMethodField()

    class Meta:
        model = OrderMessage
        fields = [
            'id', 'sender', 'sender_info', 'message', 'message_type',
            'attachments', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'read_at', 'created_at']

    def get_sender_info(self, obj):
        if obj.sender.profile:
            return {
                'id': obj.sender.id,
                'username': obj.sender.username,
                'avatar': obj.sender.profile.avatar.url if obj.sender.profile.avatar else None,
                'user_type': obj.sender.get_user_type_display()
            }
        return {
            'id': obj.sender.id,
            'username': obj.sender.username,
            'avatar': None,
            'user_type': obj.sender.get_user_type_display()
        }


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """订单状态历史序列化器"""
    changed_by_info = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = [
            'id', 'old_status', 'new_status', 'changed_by', 'changed_by_info',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_changed_by_info(self, obj):
        if obj.changed_by:
            return {
                'id': obj.changed_by.id,
                'username': obj.changed_by.username,
                'user_type': obj.changed_by.get_user_type_display()
            }
        return None


class OrderDisputeSerializer(serializers.ModelSerializer):
    """订单纠纷序列化器"""
    dispute_type_display = serializers.CharField(source='get_dispute_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    raised_by_info = serializers.SerializerMethodField()
    resolved_by_info = serializers.SerializerMethodField()

    class Meta:
        model = OrderDispute
        fields = [
            'id', 'dispute_type', 'dispute_type_display', 'description',
            'evidence', 'status', 'status_display', 'resolution',
            'resolution_amount', 'raised_by', 'raised_by_info',
            'resolved_by', 'resolved_by_info', 'resolved_at',
            'admin_notes', 'created_at'
        ]
        read_only_fields = ['id', 'resolved_at', 'created_at']

    def get_raised_by_info(self, obj):
        if obj.raised_by:
            return {
                'id': obj.raised_by.id,
                'username': obj.raised_by.username,
                'user_type': obj.raised_by.get_user_type_display()
            }
        return None

    def get_resolved_by_info(self, obj):
        if obj.resolved_by:
            return {
                'id': obj.resolved_by.id,
                'username': obj.resolved_by.username,
                'user_type': obj.resolved_by.get_user_type_display()
            }
        return None


class OrderCancellationSerializer(serializers.ModelSerializer):
    """订单取消序列化器"""
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    cancelled_by_info = serializers.SerializerMethodField()
    processed_by_info = serializers.SerializerMethodField()

    class Meta:
        model = OrderCancellation
        fields = [
            'id', 'reason', 'reason_display', 'detailed_reason',
            'refund_amount', 'refund_percentage', 'refund_reason',
            'cancelled_by', 'cancelled_by_info', 'is_processed',
            'processed_at', 'processed_by', 'processed_by_info',
            'created_at'
        ]
        read_only_fields = ['id', 'processed_at', 'created_at']

    def get_cancelled_by_info(self, obj):
        if obj.cancelled_by:
            return {
                'id': obj.cancelled_by.id,
                'username': obj.cancelled_by.username,
                'user_type': obj.cancelled_by.get_user_type_display()
            }
        return None

    def get_processed_by_info(self, obj):
        if obj.processed_by:
            return {
                'id': obj.processed_by.id,
                'username': obj.processed_by.username,
                'user_type': obj.processed_by.get_user_type_display()
            }
        return None


class OrderListSerializer(serializers.ModelSerializer):
    """订单列表序列化器"""
    gig_info = serializers.SerializerMethodField()
    gig_package_info = serializers.SerializerMethodField()
    client_info = serializers.SerializerMethodField()
    freelancer_info = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    days_until_deadline = serializers.IntegerField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'gig_info', 'gig_package_info',
            'client_info', 'freelancer_info', 'title', 'description',
            'status', 'status_display', 'priority', 'priority_display',
            'base_price', 'extras_price', 'total_price',
            'delivery_deadline', 'estimated_delivery', 'days_until_deadline',
            'is_overdue', 'created_at'
        ]

    def get_gig_info(self, obj):
        if obj.gig:
            return {
                'id': obj.gig.id,
                'title': obj.gig.title,
                'slug': obj.gig.slug,
                'thumbnail': obj.gig.thumbnail.url if obj.gig.thumbnail else None,
            }
        return None

    def get_gig_package_info(self, obj):
        if obj.gig_package:
            return {
                'id': obj.gig_package.id,
                'title': obj.gig_package.title,
                'price': obj.gig_package.price,
                'delivery_days': obj.gig_package.delivery_days,
            }
        return None

    def get_client_info(self, obj):
        if obj.client.profile:
            return {
                'id': obj.client.id,
                'username': obj.client.username,
                'avatar': obj.client.profile.avatar.url if obj.client.profile.avatar else None,
                'email': obj.client.email
            }
        return {
            'id': obj.client.id,
            'username': obj.client.username,
            'avatar': None,
            'email': obj.client.email
        }

    def get_freelancer_info(self, obj):
        if obj.freelancer.profile:
            return {
                'id': obj.freelancer.id,
                'username': obj.freelancer.username,
                'avatar': obj.freelancer.profile.avatar.url if obj.freelancer.profile.avatar else None,
                'email': obj.freelancer.email
            }
        return {
            'id': obj.freelancer.id,
            'username': obj.freelancer.username,
            'avatar': None,
            'email': obj.freelancer.email
        }

    def get_days_until_deadline(self, obj):
        return obj.days_until_deadline

    def get_is_overdue(self, obj):
        return obj.is_overdue


class OrderDetailSerializer(OrderListSerializer):
    """订单详情序列化器"""
    order_extras = OrderExtraSerializer(many=True, read_only=True)
    requirements = OrderRequirementSerializer(many=True, read_only=True)
    deliveries = DeliverySerializer(many=True, read_only=True)
    messages = OrderMessageSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    dispute = OrderDisputeSerializer(read_only=True)
    cancellation = OrderCancellationSerializer(read_only=True)
    review_request = serializers.SerializerMethodField()

    class Meta(OrderListSerializer.Meta):
        fields = OrderListSerializer.Meta.fields + [
            'client_email', 'client_phone', 'client_requirements',
            'preferred_communication_method', 'platform_fee',
            'freelancer_earnings', 'metadata',
            'order_extras', 'requirements', 'deliveries', 'messages',
            'status_history', 'dispute', 'cancellation', 'review_request'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """订单创建序列化器"""
    extras = OrderExtraSerializer(many=True, required=False)
    requirements = OrderRequirementSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = [
            'gig', 'gig_package', 'title', 'description', 'client_requirements',
            'priority', 'preferred_communication_method', 'client_email',
            'client_phone', 'extras', 'requirements'
        ]

    def validate(self, attrs):
        # 验证用户是否为客户端
        user = self.context['request'].user
        if user.user_type != 'client':
            raise ValidationError("只有客户端可以创建订单")

        # 验证服务套餐
        gig = attrs.get('gig')
        gig_package = attrs.get('gig_package')

        if gig and gig_package:
            if gig_package.gig.id != gig.id:
                raise ValidationError("选择的套餐不属于该服务")

        # 计算价格
        base_price = gig_package.price if gig_package else 0
        extras_price = sum(
            extra.get('price', 0) * extra.get('quantity', 1)
            for extra in attrs.get('extras', [])
        )

        total_price = base_price + extras_price
        platform_fee = total_price * 0.1  # 10% 平台手续费
        freelancer_earnings = total_price - platform_fee

        attrs['base_price'] = base_price
        attrs['extras_price'] = extras_price
        attrs['total_price'] = total_price
        attrs['platform_fee'] = platform_fee
        attrs['freelancer_earnings'] = freelancer_earnings

        # 设置交付时间
        delivery_days = gig_package.delivery_days if gig_package else 7
        estimated_delivery = timezone.now() + timedelta(days=delivery_days)

        attrs['delivery_deadline'] = estimated_delivery
        attrs['estimated_delivery'] = estimated_delivery

        return attrs

    def create(self, validated_data):
        extras_data = validated_data.pop('extras', [])
        requirements_data = validated_data.pop('requirements', [])

        # 创建订单
        order = Order.objects.create(
            client=self.context['request'].user,
            freelancer=validated_data['gig'].freelancer,
            **validated_data
        )

        # 创建订单附加项
        for extra_data in extras_data:
            OrderExtra.objects.create(
                order=order,
                gig_extra_id=extra_data['gig_extra']['id'],
                quantity=extra_data.get('quantity', 1),
                price=extra_data.get('price', 0)
            )

        # 创建订单需求
        for requirement_data in requirements_data:
            OrderRequirement.objects.create(
                order=order,
                **requirement_data
            )

        return order


class OrderStatusUpdateSerializer(serializers.Serializer):
    """订单状态更新序列化器"""
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    notes = serializers.CharField(max_length=1000, required=False, allow_blank=True)

    def validate(self, attrs):
        user = self.context['request'].user
        order_id = self.context.get('order_id')

        if not order_id:
            raise ValidationError("订单ID是必需的")

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            raise ValidationError("订单不存在")

        # 验证权限
        if not self.can_update_status(user, order, attrs['status']):
            raise ValidationError("您没有权限更新此订单状态")

        return attrs

    def can_update_status(self, user, order, new_status):
        """检查用户是否可以更新订单状态"""
        # 客户可以更新某些状态
        if user == order.client:
            client_allowed_status = ['cancelled']
            if new_status in client_allowed_status:
                return True

        # 自由职业者可以更新某些状态
        if user == order.freelancer:
            freelancer_allowed_status = [
                'requirements_provided', 'in_progress', 'delivered',
                'revision_requested', 'completed'
            ]
            if new_status in freelancer_allowed_status:
                return True

        # 管理员可以更新任何状态
        if user.is_staff:
            return True

        return False


class OrderMessageCreateSerializer(serializers.ModelSerializer):
    """订单消息创建序列化器"""

    class Meta:
        model = OrderMessage
        fields = ['order', 'message', 'message_type', 'attachments']

    def validate(self, attrs):
        user = self.context['request'].user
        order = attrs.get('order')

        if not order:
            raise ValidationError("订单ID是必需的")

        # 验证用户是否为订单的参与者
        if user not in [order.client, order.freelancer]:
            raise ValidationError("您不是此订单的参与者")

        return attrs

    def create(self, validated_data):
        message = OrderMessage.objects.create(
            sender=self.context['request'].user,
            **validated_data
        )

        # 标记消息为已读（如果是发送给对方）
        if message.sender != self.context['request'].user:
            pass  # 实际应该根据业务逻辑处理已读状态

        return message


class DeliveryCreateSerializer(serializers.ModelSerializer):
    """交付创建序列化器"""

    class Meta:
        model = Delivery
        fields = [
            'order', 'title', 'description', 'message',
            'files', 'is_final_delivery'
        ]

    def validate(self, attrs):
        user = self.context['request'].user
        order = attrs.get('order')

        if not order:
            raise ValidationError("订单ID是必需的")

        # 只有自由职业者可以创建交付
        if user != order.freelancer:
            raise ValidationError("只有自由职业者可以创建交付")

        # 验证订单状态
        if order.status not in ['requirements_provided', 'in_progress', 'revision_requested']:
            raise ValidationError("订单状态不允许创建交付")

        return attrs


class OrderReviewCreateSerializer(serializers.ModelSerializer):
    """评价邀请创建序列化器"""

    class Meta:
        model = OrderReview
        fields = ['order', 'review_deadline']

    def validate(self, attrs):
        order = attrs.get('order')

        if not order:
            raise ValidationError("订单ID是必需的")

        # 验证订单状态
        if order.status != 'completed':
            raise ValidationError("只有已完成的订单可以创建评价邀请")

        # 检查是否已存在评价邀请
        if OrderReview.objects.filter(order=order).exists():
            raise ValidationError("此订单已有评价邀请")

        # 设置评价截止时间
        if 'review_deadline' not in attrs:
            attrs['review_deadline'] = timezone.now() + timedelta(days=14)  # 14天后截止

        return attrs


class OrderDisputeCreateSerializer(serializers.ModelSerializer):
    """纠纷创建序列化器"""

    class Meta:
        model = OrderDispute
        fields = [
            'order', 'dispute_type', 'description', 'evidence'
        ]

    def validate(self, attrs):
        user = self.context['request'].user
        order = attrs.get('order')

        if not order:
            raise ValidationError("订单ID是必需的")

        # 验证订单状态
        if order.status in ['pending', 'cancelled', 'refunded']:
            raise ValidationError("此订单状态不允许创建纠纷")

        # 检查是否已存在纠纷
        if OrderDispute.objects.filter(order=order, status__in=['open', 'investigating']).exists():
            raise ValidationError("此订单已有进行中的纠纷")

        return attrs

    def create(self, validated_data):
        dispute = OrderDispute.objects.create(
            raised_by=self.context['request'].user,
            **validated_data
        )

        # 更新订单状态为纠纷中
        dispute.order.update_status('disputed')

        return dispute


class OrderStatsSerializer(serializers.ModelSerializer):
    """订单统计序列化器"""

    class Meta:
        model = OrderStat
        fields = [
            'date', 'total_orders', 'completed_orders', 'cancelled_orders',
            'refunded_orders', 'disputed_orders', 'total_revenue',
            'platform_fees', 'refunds_amount', 'average_order_value',
            'average_completion_time'
        ]


class OrderCancellationCreateSerializer(serializers.ModelSerializer):
    """订单取消序列化器"""

    class Meta:
        model = OrderCancellation
        fields = [
            'order', 'reason', 'detailed_reason', 'refund_percentage',
            'refund_reason'
        ]

    def validate(self, attrs):
        user = self.context['request'].user
        order = attrs.get('order')

        if not order:
            raise ValidationError("订单ID是必需的")

        # 验证订单状态
        if order.status in ['completed', 'cancelled', 'refunded']:
            raise ValidationError("此订单状态不允许取消")

        # 计算退款金额
        refund_percentage = attrs.get('refund_percentage', 0)
        if refund_percentage < 0 or refund_percentage > 100:
            raise ValidationError("退款比例必须在0-100之间")

        total_price = order.total_price
        refund_amount = total_price * (refund_percentage / 100)
        attrs['refund_amount'] = refund_amount

        return attrs


class OrderSearchSerializer(serializers.Serializer):
    """订单搜索序列化器"""
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES, required=False)
    client = serializers.IntegerField(required=False)
    freelancer = serializers.IntegerField(required=False)
    gig = serializers.IntegerField(required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    priority = serializers.ChoiceField(choices=Order.PRIORITY_CHOICES, required=False)
    is_overdue = serializers.BooleanField(required=False)
    sort_by = serializers.ChoiceField(
        choices=[
            ('created_at', '创建时间'),
            ('total_price', '价格'),
            ('delivery_deadline', '交付截止时间'),
            ('priority', '优先级'),
            ('status', '状态'),
        ],
        default='created_at'
    )


class FreelancerOrderStatsSerializer(serializers.Serializer):
    """自由职业者订单统计序列化器"""

    def validate(self, attrs):
        user = self.context['request'].user

        if user.user_type != 'freelancer':
            raise ValidationError("只有自由职业者可以查看统计信息")

        return attrs


class ClientOrderStatsSerializer(serializers.Serializer):
    """客户端订单统计序列化Serializer"""

    def validate(self, attrs):
        user = self.context['request'].user

        if user.user_type != 'client':
            raise ValidationError("只有客户端可以查看统计信息")

        return attrs