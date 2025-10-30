"""
评价系统API视图

这个模块包含了评价系统的所有API视图，支持：
- 评价管理
- 评分统计
- 评价报告和审核
- 评价模板和邀请
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q, Count, Sum, Avg, F
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import (
    Review, ReviewHelpful, ReviewReport, UserRating, ReviewInvitation,
    ReviewTemplate, ReviewStat
)
from .serializers import (
    ReviewListSerializer, ReviewDetailSerializer, ReviewCreateSerializer,
    ReviewUpdateSerializer, ReviewResponseSerializer, ReviewHelpfulSerializer,
    ReviewReportSerializer, UserRatingSerializer, ReviewInvitationSerializer,
    ReviewTemplateSerializer, ReviewStatSerializer, ReviewModerationSerializer,
    ReviewSearchSerializer, ReviewAnalyticsSerializer
)


class ReviewListAPIView(generics.ListAPIView):
    """评价列表API视图"""
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'reviewee__username', 'gig__title']
    filterset_fields = ['review_type', 'rating', 'status', 'is_visible']
    ordering_fields = ['created_at', 'rating', 'helpful_count']
    ordering = ['-created_at']

    def get_queryset(self):
        """获取已发布的评价列表"""
        queryset = Review.objects.filter(
            status='published',
            is_visible=True
        ).select_related('reviewer', 'reviewee', 'order', 'gig')

        # 按用户筛选
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(reviewee_id=user_id)

        # 按服务筛选
        gig_id = self.request.query_params.get('gig_id')
        if gig_id:
            queryset = queryset.filter(gig_id=gig_id)

        return queryset

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ReviewDetailAPIView(generics.RetrieveAPIView):
    """评价详情API视图"""
    serializer_class = ReviewDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取已发布的评价详情"""
        return Review.objects.filter(
            status='published',
            is_visible=True
        ).select_related('reviewer', 'reviewee', 'order', 'gig')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ReviewCreateAPIView(generics.CreateAPIView):
    """创建评价API视图"""
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ReviewUpdateAPIView(generics.UpdateAPIView):
    """更新评价API视图"""
    serializer_class = ReviewUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取用户可以修改的评价"""
        return Review.objects.filter(
            reviewer=self.request.user
        ).select_related('reviewee', 'order', 'gig')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ReviewResponseAPIView(generics.UpdateAPIView):
    """评价回复API视图"""
    serializer_class = ReviewResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取用户可以回复的评价"""
        return Review.objects.filter(
            reviewee=self.request.user,
            status='published',
            is_visible=True
        ).select_related('reviewer', 'order', 'gig')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ReviewHelpfulCreateAPIView(generics.CreateAPIView):
    """评价有用投票API视图"""
    serializer_class = ReviewHelpfulSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ReviewHelpfulDestroyAPIView(generics.DestroyAPIView):
    """取消评价有用投票API视图"""
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'review_id'

    def get_queryset(self):
        """获取用户的投票记录"""
        return ReviewHelpful.objects.filter(
            user=self.request.user
        )

    def get_object(self):
        """根据评价ID获取投票记录"""
        review_id = self.kwargs.get('review_id')
        return ReviewHelpful.objects.get(
            user=self.request.user,
            review_id=review_id
        )


class ReviewReportCreateAPIView(generics.CreateAPIView):
    """评价举报API视图"""
    serializer_class = ReviewReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserRatingAPIView(generics.RetrieveAPIView):
    """用户评分API视图"""
    serializer_class = UserRatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'user_id'

    def get_queryset(self):
        """获取用户评分信息"""
        return UserRating.objects.all().select_related('user')


class ReviewInvitationListAPIView(generics.ListAPIView):
    """评价邀请列表API视图"""
    serializer_class = ReviewInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['client_reviewed', 'freelancer_reviewed']

    def get_queryset(self):
        """获取用户的评价邀请"""
        user = self.request.user
        return ReviewInvitation.objects.filter(
            Q(order__client=user) | Q(order__freelancer=user)
        ).select_related('order').order_by('-created_at')


class ReviewTemplateListAPIView(generics.ListAPIView):
    """评价模板列表API视图"""
    serializer_class = ReviewTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'title', 'content']
    filterset_fields = ['template_type', 'is_active']

    def get_queryset(self):
        """获取活跃的评价模板"""
        return ReviewTemplate.objects.filter(
            is_active=True
        ).order_by('-usage_count', 'name')


class ReviewModerationAPIView(generics.UpdateAPIView):
    """评价审核API视图"""
    serializer_class = ReviewModerationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """获取需要审核的评价"""
        user = self.request.user
        if user.user_type != 'admin':
            return Review.objects.none()
        return Review.objects.filter(
            is_flagged=True
        ).select_related('reviewer', 'reviewee', 'order', 'gig')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserReviewListAPIView(generics.ListAPIView):
    """用户评价列表API视图"""
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['review_type', 'rating']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_queryset(self):
        """获取指定用户的评价"""
        user_id = self.kwargs.get('user_id')
        return Review.objects.filter(
            reviewee_id=user_id,
            status='published',
            is_visible=True
        ).select_related('reviewer', 'order', 'gig')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class GigReviewListAPIView(generics.ListAPIView):
    """服务评价列表API视图"""
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['review_type', 'rating']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_queryset(self):
        """获取指定服务的评价"""
        gig_id = self.kwargs.get('gig_id')
        return Review.objects.filter(
            gig_id=gig_id,
            status='published',
            is_visible=True
        ).select_related('reviewer', 'reviewee', 'order')

    def get_serializer_context(self):
        """添加请求上下文"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def review_analytics(request):
    """获取评价分析数据"""
    user_id = request.query_params.get('user_id')
    gig_id = request.query_params.get('gig_id')

    # 基础查询
    reviews = Review.objects.filter(
        status='published',
        is_visible=True
    )

    if user_id:
        reviews = reviews.filter(reviewee_id=user_id)
    elif gig_id:
        reviews = reviews.filter(gig_id=gig_id)

    # 评分统计
    rating_stats = reviews.aggregate(
        total_reviews=Count('id'),
        average_rating=Avg('rating'),
        five_star=Count('id', filter=Q(rating=5)),
        four_star=Count('id', filter=Q(rating=4)),
        three_star=Count('id', filter=Q(rating=3)),
        two_star=Count('id', filter=Q(rating=2)),
        one_star=Count('id', filter=Q(rating=1))
    )

    # 按类型统计
    type_stats = reviews.values('review_type').annotate(
        count=Count('id'),
        avg_rating=Avg('rating')
    ).order_by('review_type')

    # 时间趋势
    monthly_stats = reviews.extra(
        select={'month': 'strftime("%%Y-%%m", created_at)'}
    ).values('month').annotate(
        count=Count('id'),
        avg_rating=Avg('rating')
    ).order_by('month')

    analytics = {
        'summary': {
            'total_reviews': rating_stats['total_reviews'] or 0,
            'average_rating': float(rating_stats['average_rating'] or 0),
            'rating_distribution': {
                '5': rating_stats['five_star'] or 0,
                '4': rating_stats['four_star'] or 0,
                '3': rating_stats['three_star'] or 0,
                '2': rating_stats['two_star'] or 0,
                '1': rating_stats['one_star'] or 0
            }
        },
        'by_type': list(type_stats),
        'monthly_trend': list(monthly_stats)
    }

    return Response(analytics)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def review_search(request):
    """搜索评价"""
    query = request.query_params.get('q', '').strip()
    user_id = request.query_params.get('user_id')
    gig_id = request.query_params.get('gig_id')
    rating = request.query_params.get('rating')
    review_type = request.query_params.get('review_type')

    if not query:
        return Response({'error': '搜索关键词不能为空'}, status=status.HTTP_400_BAD_REQUEST)

    # 构建查询条件
    reviews = Review.objects.filter(
        status='published',
        is_visible=True
    ).filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(reviewer__username__icontains=query)
    )

    # 添加筛选条件
    if user_id:
        reviews = reviews.filter(reviewee_id=user_id)
    if gig_id:
        reviews = reviews.filter(gig_id=gig_id)
    if rating:
        reviews = reviews.filter(rating=int(rating))
    if review_type:
        reviews = reviews.filter(review_type=review_type)

    # 执行搜索
    reviews = reviews.select_related('reviewer', 'reviewee', 'order', 'gig').order_by('-created_at')

    # 序列化结果
    serializer = ReviewListSerializer(
        reviews,
        many=True,
        context={'request': request}
    )

    return Response({
        'query': query,
        'count': reviews.count(),
        'results': serializer.data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_review_invitations(request):
    """发送评价邀请"""
    order_ids = request.data.get('order_ids', [])

    if not order_ids:
        return Response({
            'error': '订单ID列表不能为空'
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(order_ids) > 100:  # 限制批量发送数量
        return Response({
            'error': '一次最多只能发送100个邀请'
        }, status=status.HTTP_400_BAD_REQUEST)

    success_count = 0
    failed_orders = []

    with transaction.atomic():
        for order_id in order_ids:
            try:
                from apps.orders.models import Order
                order = Order.objects.get(id=order_id)

                # 检查订单状态
                if order.status != 'completed':
                    failed_orders.append({
                        'order_id': order_id,
                        'reason': '订单未完成'
                    })
                    continue

                # 检查是否已存在邀请
                invitation, created = ReviewInvitation.objects.get_or_create(
                    order=order,
                    defaults={
                        'auto_send_invitation': True,
                        'days_until_reminder': 3
                    }
                )

                if created:
                    # 发送客户端邀请
                    if not invitation.client_invited:
                        invitation.client_invited = True
                        invitation.client_invitation_sent_at = timezone.now()
                        success_count += 1

                    # 发送自由职业者邀请
                    if not invitation.freelancer_invited:
                        invitation.freelancer_invited = True
                        invitation.freelancer_invitation_sent_at = timezone.now()
                        success_count += 1

                    invitation.save()
                else:
                    failed_orders.append({
                        'order_id': order_id,
                        'reason': '邀请已存在'
                    })

            except Order.DoesNotExist:
                failed_orders.append({
                    'order_id': order_id,
                    'reason': '订单不存在'
                })
            except Exception as e:
                failed_orders.append({
                    'order_id': order_id,
                    'reason': str(e)
                })

    return Response({
        'message': '邀请发送完成',
        'success_count': success_count,
        'failed_count': len(failed_orders),
        'failed_orders': failed_orders
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_review_stats(request, user_id):
    """获取用户评价统计"""
    try:
        from apps.accounts.models import User
        user = User.objects.get(id=user_id)

        # 获取或创建用户评分记录
        user_rating, created = UserRating.objects.get_or_create(
            user=user,
            defaults={
                'overall_rating': 0,
                'total_reviews': 0
            }
        )

        # 更新评分统计
        if created or not user_rating.total_reviews:
            user_rating.update_ratings()

        # 获取详细统计
        reviews = Review.objects.filter(
            reviewee=user,
            status='published',
            is_visible=True
        )

        stats = {
            'user_rating': UserRatingSerializer(user_rating).data,
            'recent_reviews': ReviewListSerializer(
                reviews.order_by('-created_at')[:5],
                many=True,
                context={'request': request}
            ).data,
            'rating_breakdown': {
                'communication': reviews.aggregate(
                    avg=Avg('communication_rating'),
                    count=Count('communication_rating')
                ),
                'quality': reviews.aggregate(
                    avg=Avg('quality_rating'),
                    count=Count('quality_rating')
                ),
                'delivery': reviews.aggregate(
                    avg=Avg('delivery_rating'),
                    count=Count('delivery_rating')
                ),
                'value': reviews.aggregate(
                    avg=Avg('value_rating'),
                    count=Count('value_rating')
                )
            }
        }

        return Response(stats)

    except User.DoesNotExist:
        return Response(
            {'error': '用户不存在'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_gig_review_stats(request, gig_id):
    """获取服务评价统计"""
    try:
        from apps.gigs.models import Gig
        gig = Gig.objects.get(id=gig_id)

        # 获取服务评价
        reviews = Review.objects.filter(
            gig=gig,
            status='published',
            is_visible=True
        )

        # 计算统计信息
        stats = reviews.aggregate(
            total_reviews=Count('id'),
            average_rating=Avg('rating'),
            five_star=Count('id', filter=Q(rating=5)),
            four_star=Count('id', filter=Q(rating=4)),
            three_star=Count('id', filter=Q(rating=3)),
            two_star=Count('id', filter=Q(rating=2)),
            one_star=Count('id', filter=Q(rating=1))
        )

        # 按评价类型统计
        type_stats = reviews.values('review_type').annotate(
            count=Count('id'),
            avg_rating=Avg('rating')
        )

        # 最近评价
        recent_reviews = ReviewListSerializer(
            reviews.order_by('-created_at')[:10],
            many=True,
            context={'request': request}
        ).data

        response_data = {
            'gig_info': {
                'id': gig.id,
                'title': gig.title,
                'category': gig.category.name if gig.category else None
            },
            'stats': {
                'total_reviews': stats['total_reviews'] or 0,
                'average_rating': float(stats['average_rating'] or 0),
                'rating_distribution': {
                    '5': stats['five_star'] or 0,
                    '4': stats['four_star'] or 0,
                    '3': stats['three_star'] or 0,
                    '2': stats['two_star'] or 0,
                    '1': stats['one_star'] or 0
                }
            },
            'by_type': list(type_stats),
            'recent_reviews': recent_reviews
        }

        return Response(response_data)

    except Gig.DoesNotExist:
        return Response(
            {'error': '服务不存在'},
            status=status.HTTP_404_NOT_FOUND
        )
