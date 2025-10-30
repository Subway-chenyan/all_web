"""
订单管理视图

这个模块包含了订单处理系统的所有API视图，支持：
- 订单CRUD操作
- 订单状态管理
- 订单附加项管理
- 订单要求和交付管理
- 订单消息和争议处理
- 订单统计和分析
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
# from drf_spectacular.utils import extend_schema, OpenApiParameter
# from drf_spectacular.types import OpenApiTypes

from .models import (
    Order, OrderStatusHistory, OrderExtra, OrderRequirement,
    Delivery, OrderMessage, OrderReview, OrderDispute,
    OrderStat, OrderCancellation
)
from .serializers import (
    OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer,
    OrderStatusUpdateSerializer, OrderExtraSerializer,
    OrderRequirementSerializer, DeliverySerializer, OrderMessageSerializer,
    OrderDisputeSerializer, OrderCancellationSerializer
)
from apps.gigs.models import Gig
from apps.accounts.permissions import IsClient, IsFreelancer, IsOwnerOrReadOnly


class OrderListAPIView(generics.ListAPIView):
    """订单列表API视图"""
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number', 'gig__title', 'client__username', 'freelancer__username']
    filterset_fields = ['status', 'priority', 'gig__category']
    ordering_fields = ['created_at', 'updated_at', 'delivery_deadline', 'total_price']
    ordering = ['-created_at']

    def get_queryset(self):
        """根据用户类型过滤订单"""
        user = self.request.user
        queryset = Order.objects.select_related('client', 'freelancer', 'gig').prefetch_related('order_extras')

        if user.user_type == 'client':
            return queryset.filter(client=user)
        elif user.user_type == 'freelancer':
            return queryset.filter(freelancer=user)
        else:
            return queryset


class OrderDetailAPIView(generics.RetrieveUpdateAPIView):
    """订单详情API视图"""
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取用户有权限访问的订单"""
        user = self.request.user
        if user.user_type == 'admin':
            return Order.objects.all()
        return Order.objects.filter(Q(client=user) | Q(freelancer=user))

    def get_serializer_class(self):
        """根据请求方法选择序列化器"""
        if self.request.method in ['PUT', 'PATCH']:
            return OrderUpdateSerializer
        return OrderDetailSerializer

    @extend_schema(
        summary="获取订单详情",
        description="根据订单ID获取订单详细信息"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="更新订单",
        description="更新订单信息（仅限部分字段）"
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(
        summary="部分更新订单",
        description="部分更新订单信息"
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class OrderCreateAPIView(generics.CreateAPIView):
    """订单创建API视图"""
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    @extend_schema(
        summary="创建订单",
        description="基于服务创建新订单"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        """设置订单创建者"""
        serializer.save(client=self.request.user)


class OrderStatusUpdateAPIView(APIView):
    """订单状态更新API视图"""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="更新订单状态",
        description="更新订单状态，记录状态变更历史"
    )
    def post(self, request, slug):
        try:
            order = Order.objects.get(slug=slug)

            # 权限检查
            user = request.user
            if not (order.client == user or order.freelancer == user or user.user_type == 'admin'):
                return Response(
                    {'error': '您没有权限更新此订单状态'},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = OrderStatusUpdateSerializer(
                data=request.data,
                context={'request': request, 'order': order}
            )

            if serializer.is_valid():
                with transaction.atomic():
                    # 更新订单状态
                    old_status = order.status
                    new_status = serializer.validated_data['status']
                    order.status = new_status
                    order.save()

                    # 创建状态历史记录
                    OrderStatusHistory.objects.create(
                        order=order,
                        old_status=old_status,
                        new_status=new_status,
                        changed_by=user,
                        notes=serializer.validated_data.get('notes', '')
                    )

                    return Response({
                        'message': '订单状态更新成功',
                        'old_status': old_status,
                        'new_status': new_status
                    })

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Order.DoesNotExist:
            return Response({'error': '订单不存在'}, status=status.HTTP_404_NOT_FOUND)


class OrderExtraListCreateAPIView(generics.ListCreateAPIView):
    """订单附加项列表和创建API视图"""
    serializer_class = OrderExtraSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取指定订单的附加项"""
        order_slug = self.kwargs.get('slug')
        return OrderExtra.objects.filter(order__slug=order_slug)

    @extend_schema(
        summary="获取订单附加项列表",
        description="获取指定订单的所有附加项"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="添加订单附加项",
        description="为订单添加新的附加项"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class OrderRequirementListCreateAPIView(generics.ListCreateAPIView):
    """订单要求列表和创建API视图"""
    serializer_class = OrderRequirementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取指定订单的要求"""
        order_slug = self.kwargs.get('slug')
        return OrderRequirement.objects.filter(order__slug=order_slug)

    @extend_schema(
        summary="获取订单要求列表",
        description="获取指定订单的所有要求"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="添加订单要求",
        description="为订单添加新的要求"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class OrderDeliveryListCreateAPIView(generics.ListCreateAPIView):
    """订单交付列表和创建API视图"""
    serializer_class = OrderDeliverySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取指定订单的交付记录"""
        order_slug = self.kwargs.get('slug')
        return OrderDelivery.objects.filter(order__slug=order_slug)

    @extend_schema(
        summary="获取订单交付列表",
        description="获取指定订单的所有交付记录"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="提交订单交付",
        description="为订单提交新的交付"
    )
    def post(self, request, *args, **kwargs):
        # 权限检查：只有自由职业者可以提交交付
        if request.user.user_type != 'freelancer':
            return Response(
                {'error': '只有自由职业者可以提交交付'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().post(request, *args, **kwargs)


class OrderMessageListCreateAPIView(generics.ListCreateAPIView):
    """订单消息列表和创建API视图"""
    serializer_class = OrderMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取指定订单的消息"""
        order_slug = self.kwargs.get('slug')
        return OrderMessage.objects.filter(order__slug=order_slug).order_by('created_at')

    @extend_schema(
        summary="获取订单消息列表",
        description="获取指定订单的所有消息"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="发送订单消息",
        description="向订单发送新消息"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class OrderDisputeCreateAPIView(generics.CreateAPIView):
    """订单争议创建API视图"""
    serializer_class = OrderDisputeSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="创建订单争议",
        description="为订单创建争议"
    )
    def post(self, request, *args, **kwargs):
        try:
            order_slug = self.kwargs.get('slug')
            order = Order.objects.get(slug=order_slug)

            # 检查是否已有进行中的争议
            if OrderDispute.objects.filter(order=order, status__in=['pending', 'investigating']).exists():
                return Response(
                    {'error': '该订单已有进行中的争议'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 权限检查
            user = request.user
            if not (order.client == user or order.freelancer == user):
                return Response(
                    {'error': '您没有权限为此订单创建争议'},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(order=order, raised_by=user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Order.DoesNotExist:
            return Response({'error': '订单不存在'}, status=status.HTTP_404_NOT_FOUND)


class OrderCancellationAPIView(APIView):
    """订单取消API视图"""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="取消订单",
        description="申请取消订单并提供原因"
    )
    def post(self, request, slug):
        try:
            order = Order.objects.get(slug=slug)

            # 权限检查
            user = request.user
            if not (order.client == user or order.freelancer == user):
                return Response(
                    {'error': '您没有权限取消此订单'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # 检查订单状态是否允许取消
            if order.status in ['completed', 'cancelled', 'refunded']:
                return Response(
                    {'error': f'订单状态为 {order.status}，无法取消'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = OrderCancellationSerializer(data=request.data)
            if serializer.is_valid():
                with transaction.atomic():
                    # 更新订单状态
                    order.status = 'cancelled'
                    order.cancelled_at = timezone.now()
                    order.cancelled_by = user
                    order.cancellation_reason = serializer.validated_data['reason']
                    order.save()

                    # 创建状态历史记录
                    OrderStatusHistory.objects.create(
                        order=order,
                        old_status='active',  # 假设之前是活跃状态
                        new_status='cancelled',
                        changed_by=user,
                        notes=f"取消原因: {serializer.validated_data['reason']}"
                    )

                    return Response({
                        'message': '订单取消申请已提交',
                        'order_status': order.status
                    })

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Order.DoesNotExist:
            return Response({'error': '订单不存在'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="获取用户订单统计",
    description="获取用户的订单统计信息"
)
def order_stats(request):
    """获取用户订单统计"""
    user = request.user

    if user.user_type == 'client':
        orders = Order.objects.filter(client=user)
    elif user.user_type == 'freelancer':
        orders = Order.objects.filter(freelancer=user)
    else:
        orders = Order.objects.none()

    # 基础统计
    stats = {
        'total_orders': orders.count(),
        'active_orders': orders.filter(status='active').count(),
        'completed_orders': orders.filter(status='completed').count(),
        'cancelled_orders': orders.filter(status='cancelled').count(),
        'total_revenue': orders.filter(status='completed').aggregate(
            total=Sum('total_amount'))['total'] or 0,
        'pending_orders': orders.filter(status='pending').count(),
        'disputed_orders': orders.filter(status='disputed').count(),
    }

    # 按状态分组统计
    status_stats = orders.values('status').annotate(
        count=Count('id')
    ).order_by('status')

    stats['by_status'] = list(status_stats)

    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsFreelancer])
@extend_schema(
    summary="获取自由职业者收入统计",
    description="获取自由职业者的收入统计信息"
)
def freelancer_earnings(request):
    """获取自由职业者收入统计"""
    freelancer = request.user
    orders = Order.objects.filter(freelancer=freelancer, status='completed')

    # 收入统计
    earnings = orders.aggregate(
        total_earnings=Sum('total_amount'),
        avg_order_value=Avg('total_amount'),
        completed_orders=Count('id')
    )

    # 月度收入趋势
    monthly_earnings = orders.extra(
        select={'month': 'strftime("%%Y-%%m", created_at)'}
    ).values('month').annotate(
        monthly_total=Sum('total_amount'),
        monthly_count=Count('id')
    ).order_by('month')

    return Response({
        'total_earnings': earnings['total_earnings'] or 0,
        'avg_order_value': earnings['avg_order_value'] or 0,
        'completed_orders': earnings['completed_orders'] or 0,
        'monthly_trend': list(monthly_earnings)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="搜索订单",
    description="根据关键词搜索订单"
)
def search_orders(request):
    """搜索订单"""
    query = request.GET.get('q', '').strip()
    user = request.user

    if not query:
        return Response({'error': '搜索关键词不能为空'}, status=status.HTTP_400_BAD_REQUEST)

    # 构建查询条件
    if user.user_type == 'client':
        base_queryset = Order.objects.filter(client=user)
    elif user.user_type == 'freelancer':
        base_queryset = Order.objects.filter(freelancer=user)
    else:
        base_queryset = Order.objects.all()

    # 执行搜索
    orders = base_queryset.filter(
        Q(order_number__icontains=query) |
        Q(gig__title__icontains=query) |
        Q(gig__description__icontains=query) |
        Q(client__username__icontains=query) |
        Q(freelancer__username__icontains=query) |
        Q(notes__icontains=query)
    ).select_related('client', 'freelancer', 'gig')

    # 序列化结果
    serializer = OrderListSerializer(orders, many=True)

    return Response({
        'query': query,
        'count': orders.count(),
        'results': serializer.data
    })


class OrderTrackingAPIView(APIView):
    """订单追踪API视图"""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="获取订单追踪信息",
        description="获取订单的实时追踪信息"
    )
    def get(self, request, slug):
        try:
            order = Order.objects.get(slug=slug)

            # 权限检查
            user = request.user
            if not (order.client == user or order.freelancer == user):
                return Response(
                    {'error': '您没有权限查看此订单追踪'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # 获取追踪信息
            tracking_info = OrderTracking.objects.filter(order=order).order_by('-updated_at')

            # 获取最近的追踪记录
            latest_tracking = tracking_info.first()

            response_data = {
                'order_number': order.order_number,
                'status': order.status,
                'current_location': latest_tracking.current_location if latest_tracking else None,
                'estimated_delivery': order.deadline,
                'tracking_history': OrderTrackingSerializer(tracking_info, many=True).data
            }

            return Response(response_data)

        except Order.DoesNotExist:
            return Response({'error': '订单不存在'}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="更新订单追踪信息",
        description="更新订单的追踪信息（仅限自由职业者）"
    )
    def post(self, request, slug):
        try:
            order = Order.objects.get(slug=slug)

            # 权限检查：只有自由职业者可以更新追踪信息
            if request.user.user_type != 'freelancer' or order.freelancer != request.user:
                return Response(
                    {'error': '只有订单的自由职业者可以更新追踪信息'},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = OrderTrackingSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(order=order, updated_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Order.DoesNotExist:
            return Response({'error': '订单不存在'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="确认订单交付",
    description="客户端确认订单交付完成"
)
def confirm_delivery(request, slug):
    """确认订单交付"""
    try:
        order = Order.objects.get(slug=slug)

        # 权限检查：只有客户端可以确认交付
        if request.user.user_type != 'client' or order.client != request.user:
            return Response(
                {'error': '只有订单的客户端可以确认交付'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 检查订单状态
        if order.status != 'delivered':
            return Response(
                {'error': f'订单状态为 {order.status}，无法确认交付'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # 更新订单状态
            order.status = 'completed'
            order.completed_at = timezone.now()
            order.save()

            # 创建状态历史记录
            OrderStatusHistory.objects.create(
                order=order,
                old_status='delivered',
                new_status='completed',
                changed_by=request.user,
                notes='客户端确认交付完成'
            )

            return Response({
                'message': '交付确认成功，订单已完成',
                'order_status': order.status,
                'completed_at': order.completed_at
            })

    except Order.DoesNotExist:
        return Response({'error': '订单不存在'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="请求订单修改",
    description="客户端请求修改订单交付"
)
def request_revision(request, slug):
    """请求订单修改"""
    try:
        order = Order.objects.get(slug=slug)

        # 权限检查：只有客户端可以请求修改
        if request.user.user_type != 'client' or order.client != request.user:
            return Response(
                {'error': '只有订单的客户端可以请求修改'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 检查订单状态
        if order.status != 'delivered':
            return Response(
                {'error': f'订单状态为 {order.status}，无法请求修改'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 检查修改次数
        if hasattr(order, 'revision_count') and order.revision_count >= order.max_revisions:
            return Response(
                {'error': '已达到最大修改次数限制'},
                status=status.HTTP_400_BAD_REQUEST
            )

        revision_request = request.data.get('revision_request', '').strip()
        if not revision_request:
            return Response(
                {'error': '请提供修改请求的具体说明'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # 更新订单状态
            order.status = 'revision'
            order.revision_request = revision_request
            if hasattr(order, 'revision_count'):
                order.revision_count += 1
            else:
                order.revision_count = 1
            order.save()

            # 创建状态历史记录
            OrderStatusHistory.objects.create(
                order=order,
                old_status='delivered',
                new_status='revision',
                changed_by=request.user,
                notes=f'修改请求: {revision_request}'
            )

            return Response({
                'message': '修改请求已发送',
                'order_status': order.status,
                'revision_request': revision_request
            })

    except Order.DoesNotExist:
        return Response({'error': '订单不存在'}, status=status.HTTP_404_NOT_FOUND)
