from django.db.models import Q, Avg, Count, Sum, F
from django.utils import timezone
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions, generics, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import Http404

from .models import (
    Category, Gig, GigPackage, GigRequirement, GigFAQ,
    GigExtra, GigFavorite, GigView, GigStat, GigSearchHistory, GigReport
)
from .serializers import (
    CategorySerializer, GigListSerializer, GigDetailSerializer,
    GigCreateUpdateSerializer, GigPackageSerializer, GigRequirementSerializer,
    GigFAQSerializer, GigExtraSerializer, GigFavoriteSerializer,
    GigSearchHistorySerializer, GigReportSerializer, GigStatSerializer,
    CategoryTreeSerializer, GigSearchSerializer, FreelancerGigSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    """标准分页器"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'results': data
        })


class CategoryListAPIView(generics.ListAPIView):
    """分类列表API"""
    queryset = Category.objects.filter(is_active=True, parent=None)
    serializer_class = CategoryTreeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.filter(
            is_active=True,
            parent=None
        ).prefetch_related('children')


class CategoryDetailAPIView(generics.RetrieveAPIView):
    """分类详情API"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class GigListAPIView(generics.ListAPIView):
    """服务列表API"""
    serializer_class = GigListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'tags', 'searchable_text']
    filterset_fields = ['category', 'status', 'is_featured', 'is_premium']
    ordering_fields = ['created_at', 'updated_at', 'view_count', 'order_count', 'average_rating', 'price']
    ordering = ['-is_featured', '-created_at']

    def get_queryset(self):
        queryset = Gig.objects.filter(status='active').select_related(
            'freelancer', 'category'
        ).prefetch_related('packages')

        # 应用高级过滤
        category_id = self.request.query_params.get('category')
        freelancer_id = self.request.query_params.get('freelancer')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        min_rating = self.request.query_params.get('min_rating')
        tags = self.request.query_params.get('tags')
        sort_by = self.request.query_params.get('sort_by', 'relevance')

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if freelancer_id:
            queryset = queryset.filter(freelancer_id=freelancer_id)

        if min_price:
            queryset = queryset.filter(
                packages__price__gte=min_price,
                packages__package_type='basic'
            ).distinct()

        if max_price:
            queryset = queryset.filter(
                packages__price__lte=max_price,
                packages__package_type='basic'
            ).distinct()

        if min_rating:
            queryset = queryset.filter(average_rating__gte=min_rating)

        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(Q(tags__icontains=tag) | Q(searchable_text__icontains=tag))

        # 排序逻辑
        if sort_by == 'price_low':
            queryset = queryset.order_by('packages__price').filter(packages__package_type='basic')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-packages__price').filter(packages__package_type='basic')
        elif sort_by == 'rating':
            queryset = queryset.order_by('-average_rating', '-review_count')
        elif sort_by == 'orders':
            queryset = queryset.order_by('-order_count')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'delivery':
            queryset = queryset.order_by('packages__delivery_days').filter(packages__package_type='basic')

        return queryset.distinct()

    def list(self, request, *args, **kwargs):
        # 记录搜索历史
        query = request.query_params.get('search', '')
        if query:
            GigSearchHistory.objects.create(
                query=query,
                user=request.user if request.user.is_authenticated else None,
                ip_address=self.get_client_ip(request),
                results_count=self.get_queryset().count(),
                filters_applied=dict(request.query_params)
            )

        return super().list(request, *args, **kwargs)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class GigDetailAPIView(generics.RetrieveAPIView):
    """服务详情API"""
    queryset = Gig.objects.all().select_related(
        'freelancer', 'category'
    ).prefetch_related(
        'packages', 'requirements', 'faqs', 'extras'
    )
    serializer_class = GigDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # 记录浏览
        self.record_view(instance, request)

        # 更新浏览次数
        Gig.objects.filter(pk=instance.pk).update(view_count=models.F('view_count') + 1)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def record_view(self, gig, request):
        """记录浏览信息"""
        ip_address = self.get_client_ip(request)
        user = request.user if request.user.is_authenticated else None
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        GigView.objects.create(
            gig=gig,
            user=user,
            ip_address=ip_address,
            user_agent=user_agent
        )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class GigCreateAPIView(generics.CreateAPIView):
    """创建服务API"""
    serializer_class = GigCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # 验证用户是否为自由职业者
        if self.request.user.user_type != 'freelancer':
            raise permissions.PermissionDenied("只有自由职业者才能创建服务")

        serializer.save(freelancer=self.request.user)


class GigUpdateAPIView(generics.UpdateAPIView):
    """更新服务API"""
    serializer_class = GigCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return Gig.objects.filter(freelancer=self.request.user)

    def perform_update(self, serializer):
        if self.request.user != serializer.instance.freelancer:
            raise permissions.PermissionDenied("您只能编辑自己的服务")
        serializer.save()


class GigDeleteAPIView(generics.DestroyAPIView):
    """删除服务API"""
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return Gig.objects.filter(freelancer=self.request.user)

    def perform_destroy(self, instance):
        if self.request.user != instance.freelancer:
            raise permissions.PermissionDenied("您只能删除自己的服务")

        # 检查是否有进行中的订单
        if instance.orders.filter(status__in=['pending', 'active', 'revision']).exists():
            raise serializers.ValidationError("该服务有进行中的订单，无法删除")

        instance.delete()


class FreelancerGigListAPIView(generics.ListAPIView):
    """自由职业者的服务列表"""
    serializer_class = FreelancerGigSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        if self.request.user.user_type != 'freelancer':
            raise permissions.PermissionDenied("只有自由职业者可以查看自己的服务")

        return Gig.objects.filter(
            freelancer=self.request.user
        ).select_related('category').prefetch_related('packages')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_gig_favorite(request, slug):
    """收藏/取消收藏服务"""
    try:
        gig = get_object_or_404(Gig, slug=slug)
        favorite, created = GigFavorite.objects.get_or_create(
            user=request.user,
            gig=gig
        )

        if not created:
            favorite.delete()
            is_favorited = False
            # 更新收藏次数
            Gig.objects.filter(pk=gig.pk).update(
                favorite_count=models.F('favorite_count') - 1
            )
        else:
            is_favorited = True
            # 更新收藏次数
            Gig.objects.filter(pk=gig.pk).update(
                favorite_count=models.F('favorite_count') + 1
            )

        return Response({
            'is_favorited': is_favorited,
            'favorite_count': Gig.objects.get(pk=gig.pk).favorite_count
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_favorites(request):
    """获取用户收藏的服务"""
    try:
        favorites = GigFavorite.objects.filter(
            user=request.user
        ).select_related('gig').order_by('-created_at')

        serializer = GigFavoriteSerializer(favorites, many=True)

        return Response({
            'count': favorites.count(),
            'results': serializer.data
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def freelancer_stats(request):
    """获取自由职业者统计信息"""
    if request.user.user_type != 'freelancer':
        raise permissions.PermissionDenied("只有自由职业者可以查看统计信息")

    try:
        gigs = Gig.objects.filter(freelancer=request.user)

        # 基础统计
        total_gigs = gigs.count()
        active_gigs = gigs.filter(status='active').count()
        total_orders = request.user.orders_as_freelancer.count()

        # 评价统计
        avg_rating = gigs.aggregate(
            avg_rating=Avg('average_rating')
        )['avg_rating'] or 0

        # 收入统计
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_revenue = request.user.orders_as_freelancer.filter(
            status='completed',
            completed_at__gte=thirty_days_ago
        ).aggregate(total=Sum('total_price'))['total'] or 0

        # 浏览统计
        total_views = gigs.aggregate(total_views=Sum('view_count'))['total_views'] or 0

        return Response({
            'total_gigs': total_gigs,
            'active_gigs': active_gigs,
            'total_orders': total_orders,
            'average_rating': round(avg_rating, 2),
            'monthly_revenue': float(monthly_revenue),
            'total_views': total_views
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def report_gig(request, slug):
    """举报服务"""
    try:
        gig = get_object_or_404(Gig, slug=slug)

        # 检查是否已经举报过
        if GigReport.objects.filter(
            gig=gig,
            reporter=request.user,
            status='pending'
        ).exists():
            return Response(
                {'error': '您已经举报过此服务'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = GigReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(gig=gig, reporter=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_suggestions(request):
    """搜索建议"""
    try:
        query = request.GET.get('q', '')
        if len(query) < 2:
            return Response({'suggestions': []})

        # 基于标题、标签的分类建议
        gig_suggestions = Gig.objects.filter(
            Q(title__icontains=query) | Q(tags__icontains=query),
            status='active'
        ).values_list('title', flat=True)[:5]

        # 分类建议
        category_suggestions = Category.objects.filter(
            Q(name__icontains=query),
            is_active=True
        ).values_list('name', flat=True)[:3]

        # 标签建议
        tag_suggestions = []
        gigs_with_tags = Gig.objects.filter(
            tags__icontains=query,
            status='active'
        ).values_list('tags', flat=True)

        all_tags = []
        for tags in gigs_with_tags:
            if tags:
                all_tags.extend([tag.strip() for tag in tags.split(',')])

        # 去重并筛选包含查询的标签
        unique_tags = list(set(all_tags))
        tag_suggestions = [tag for tag in unique_tags if query.lower() in tag.lower()][:5]

        return Response({
            'gigs': list(gig_suggestions),
            'categories': list(category_suggestions),
            'tags': tag_suggestions
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def gig_analytics(request, slug):
    """获取服务分析数据"""
    try:
        gig = get_object_or_404(Gig, slug=slug)

        # 检查权限
        if request.user != gig.freelancer and not request.user.is_staff:
            raise permissions.PermissionDenied("您只能查看自己服务的分析数据")

        # 30天统计数据
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)

        # 浏览统计
        views = GigView.objects.filter(
            gig=gig,
            created_at__gte=thirty_days_ago
        ).count()

        unique_views = GigView.objects.filter(
            gig=gig,
            created_at__gte=thirty_days_ago
        ).values('ip_address').distinct().count()

        # 订单统计
        orders = gig.orders.filter(
            created_at__gte=thirty_days_ago
        )

        order_stats = orders.aggregate(
            total_orders=Count('id'),
            total_revenue=Sum('total_price')
        )

        # 收藏统计
        favorites = GigFavorite.objects.filter(
            gig=gig,
            created_at__gte=thirty_days_ago
        ).count()

        # 日统计数据
        daily_stats = GigStat.objects.filter(
            gig=gig,
            date__gte=thirty_days_ago.date()
        ).order_by('date')

        stats_serializer = GigStatSerializer(daily_stats, many=True)

        return Response({
            'period_days': 30,
            'views': views,
            'unique_views': unique_views,
            'orders': order_stats['total_orders'] or 0,
            'revenue': float(order_stats['total_revenue'] or 0),
            'favorites': favorites,
            'daily_stats': stats_serializer.data
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
