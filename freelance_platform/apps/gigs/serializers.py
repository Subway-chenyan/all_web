from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from django.utils.text import slugify
from .models import (
    Category, Gig, GigPackage, GigRequirement, GigFAQ,
    GigExtra, GigFavorite, GigView, GigStat, GigSearchHistory, GigReport
)

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """分类序列化器"""
    children = serializers.SerializerMethodField()
    gig_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'icon', 'parent', 'is_active',
            'sort_order', 'children', 'gig_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_children(self, obj):
        children = obj.get_children()
        return CategorySerializer(children, many=True).data

    def get_gig_count(self, obj):
        return obj.gigs.filter(status='active').count()


class GigPackageSerializer(serializers.ModelSerializer):
    """服务套餐序列化器"""
    package_type_display = serializers.CharField(source='get_package_type_display', read_only=True)

    class Meta:
        model = GigPackage
        fields = [
            'id', 'package_type', 'package_type_display', 'title', 'description',
            'price', 'delivery_days', 'revisions', 'features', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class GigRequirementSerializer(serializers.ModelSerializer):
    """服务需求序列化器"""
    input_type_display = serializers.CharField(source='get_input_type_display', read_only=True)

    class Meta:
        model = GigRequirement
        fields = [
            'id', 'requirement_text', 'is_required', 'input_type',
            'input_type_display', 'options', 'sort_order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class GigFAQSerializer(serializers.ModelSerializer):
    """服务常见问题序列化器"""

    class Meta:
        model = GigFAQ
        fields = ['id', 'question', 'answer', 'sort_order', 'created_at']
        read_only_fields = ['id', 'created_at']


class GigExtraSerializer(serializers.ModelSerializer):
    """服务附加项序列化器"""

    class Meta:
        model = GigExtra
        fields = ['id', 'title', 'description', 'price', 'delivery_days', 'created_at']
        read_only_fields = ['id', 'created_at']


class GigListSerializer(serializers.ModelSerializer):
    """服务列表序列化器"""
    freelancer_info = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    basic_package = serializers.SerializerMethodField()

    class Meta:
        model = Gig
        fields = [
            'id', 'title', 'slug', 'description', 'freelancer_info',
            'category_name', 'status', 'status_display', 'is_featured',
            'is_premium', 'thumbnail', 'view_count', 'order_count',
            'favorite_count', 'average_rating', 'review_count',
            'basic_package', 'created_at'
        ]

    def get_freelancer_info(self, obj):
        if obj.freelancer.profile:
            return {
                'id': obj.freelancer.id,
                'username': obj.freelancer.username,
                'avatar': obj.freelancer.profile.avatar.url if obj.freelancer.profile.avatar else None,
                'freelancer_since': obj.freelancer.date_joined,
            }
        return {
            'id': obj.freelancer.id,
            'username': obj.freelancer.username,
            'avatar': None,
            'freelancer_since': obj.freelancer.date_joined,
        }

    def get_basic_package(self, obj):
        basic_package = obj.packages.filter(package_type='basic').first()
        if basic_package:
            return {
                'title': basic_package.title,
                'price': basic_package.price,
                'delivery_days': basic_package.delivery_days,
            }
        return None


class GigDetailSerializer(GigListSerializer):
    """服务详情序列化器"""
    packages = GigPackageSerializer(many=True, read_only=True)
    requirements = GigRequirementSerializer(many=True, read_only=True)
    faqs = GigFAQSerializer(many=True, read_only=True)
    extras = GigExtraSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()

    class Meta(GigListSerializer.Meta):
        fields = GigListSerializer.Meta.fields + [
            'tags', 'tags_list', 'gallery_images', 'meta_description',
            'packages', 'requirements', 'faqs', 'extras', 'is_favorited'
        ]

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return GigFavorite.objects.filter(user=request.user, gig=obj).exists()
        return False

    def get_tags_list(self, obj):
        if obj.tags:
            return [tag.strip() for tag in obj.tags.split(',')]
        return []


class GigCreateUpdateSerializer(serializers.ModelSerializer):
    """服务创建/更新序列化器"""
    packages = GigPackageSerializer(many=True, required=False)
    requirements = GigRequirementSerializer(many=True, required=False)
    faqs = GigFAQSerializer(many=True, required=False)
    extras = GigExtraSerializer(many=True, required=False)

    class Meta:
        model = Gig
        fields = [
            'title', 'description', 'category', 'status', 'is_featured',
            'is_premium', 'tags', 'thumbnail', 'gallery_images',
            'meta_description', 'packages', 'requirements', 'faqs', 'extras'
        ]

    def validate(self, attrs):
        # 验证用户是否为自由职业者
        user = self.context['request'].user
        if user.user_type != 'freelancer':
            raise serializers.ValidationError("只有自由职业者才能创建服务")

        # 生成slug
        if 'title' in attrs:
            title = attrs['title']
            slug = slugify(title, allow_unicode=True)

            # 检查slug唯一性
            queryset = Gig.objects.filter(slug=slug)
            if self.instance:
                queryset = queryset.exclude(id=self.instance.id)

            if queryset.exists():
                # 如果slug已存在，添加用户ID
                slug = f"{slug}-{user.id}"

            attrs['slug'] = slug

        # 生成搜索文本
        searchable_text = f"{attrs.get('title', '')} {attrs.get('description', '')} {attrs.get('tags', '')}"
        attrs['searchable_text'] = searchable_text

        return attrs

    def create(self, validated_data):
        # 提取嵌套数据
        packages_data = validated_data.pop('packages', [])
        requirements_data = validated_data.pop('requirements', [])
        faqs_data = validated_data.pop('faqs', [])
        extras_data = validated_data.pop('extras', [])

        # 创建Gig
        gig = Gig.objects.create(
            freelancer=self.context['request'].user,
            **validated_data
        )

        # 创建关联对象
        for package_data in packages_data:
            GigPackage.objects.create(gig=gig, **package_data)

        for requirement_data in requirements_data:
            GigRequirement.objects.create(gig=gig, **requirement_data)

        for faq_data in faqs_data:
            GigFAQ.objects.create(gig=gig, **faq_data)

        for extra_data in extras_data:
            GigExtra.objects.create(gig=gig, **extra_data)

        return gig

    def update(self, instance, validated_data):
        # 提取嵌套数据
        packages_data = validated_data.pop('packages', None)
        requirements_data = validated_data.pop('requirements', None)
        faqs_data = validated_data.pop('faqs', None)
        extras_data = validated_data.pop('extras', None)

        # 更新Gig
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 更新关联对象
        if packages_data is not None:
            instance.packages.all().delete()
            for package_data in packages_data:
                GigPackage.objects.create(gig=instance, **package_data)

        if requirements_data is not None:
            instance.requirements.all().delete()
            for requirement_data in requirements_data:
                GigRequirement.objects.create(gig=instance, **requirement_data)

        if faqs_data is not None:
            instance.faqs.all().delete()
            for faq_data in faqs_data:
                GigFAQ.objects.create(gig=instance, **faq_data)

        if extras_data is not None:
            instance.extras.all().delete()
            for extra_data in extras_data:
                GigExtra.objects.create(gig=instance, **extra_data)

        return instance


class GigFavoriteSerializer(serializers.ModelSerializer):
    """服务收藏序列化器"""
    gig_info = serializers.SerializerMethodField()

    class Meta:
        model = GigFavorite
        fields = ['id', 'gig', 'gig_info', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_gig_info(self, obj):
        return GigListSerializer(obj.gig).data


class GigSearchHistorySerializer(serializers.ModelSerializer):
    """搜索历史序列化器"""

    class Meta:
        model = GigSearchHistory
        fields = ['id', 'query', 'results_count', 'filters_applied', 'created_at']
        read_only_fields = ['id', 'created_at']


class GigReportSerializer(serializers.ModelSerializer):
    """服务举报序列化器"""
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    gig_info = serializers.SerializerMethodField()

    class Meta:
        model = GigReport
        fields = [
            'id', 'gig', 'gig_info', 'reason', 'reason_display',
            'description', 'status', 'admin_notes', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'admin_notes', 'created_at']

    def get_gig_info(self, obj):
        return {
            'id': obj.gig.id,
            'title': obj.gig.title,
            'slug': obj.gig.slug,
            'freelancer': obj.gig.freelancer.username,
        }


class GigStatSerializer(serializers.ModelSerializer):
    """服务统计序列化器"""

    class Meta:
        model = GigStat
        fields = [
            'id', 'date', 'views', 'unique_views', 'clicks',
            'orders', 'revenue', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CategoryTreeSerializer(serializers.ModelSerializer):
    """分类树序列化器"""
    children = serializers.SerializerMethodField()
    gig_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'children', 'gig_count']

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategoryTreeSerializer(children, many=True).data

    def get_gig_count(self, obj):
        return obj.gigs.filter(status='active').count()


class GigSearchSerializer(serializers.Serializer):
    """服务搜索序列化器"""
    query = serializers.CharField(max_length=200, required=False, allow_blank=True)
    category = serializers.IntegerField(required=False)
    freelancer = serializers.IntegerField(required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    delivery_days = serializers.IntegerField(required=False)
    min_rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False)
    tags = serializers.CharField(max_length=200, required=False, allow_blank=True)
    sort_by = serializers.ChoiceField(
        choices=[
            ('relevance', '相关性'),
            ('price_low', '价格从低到高'),
            ('price_high', '价格从高到低'),
            ('rating', '评分'),
            ('orders', '订单数'),
            ('newest', '最新发布'),
            ('delivery', '交付时间'),
        ],
        default='relevance'
    )
    is_featured = serializers.BooleanField(required=False)
    is_premium = serializers.BooleanField(required=False)


class FreelancerGigSerializer(serializers.ModelSerializer):
    """自由职业者服务序列化器"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    basic_package = serializers.SerializerMethodField()
    monthly_orders = serializers.SerializerMethodField()
    monthly_revenue = serializers.SerializerMethodField()

    class Meta:
        model = Gig
        fields = [
            'id', 'title', 'slug', 'category_name', 'status', 'status_display',
            'is_featured', 'is_premium', 'thumbnail', 'view_count',
            'order_count', 'favorite_count', 'average_rating', 'review_count',
            'basic_package', 'monthly_orders', 'monthly_revenue', 'created_at'
        ]

    def get_basic_package(self, obj):
        basic_package = obj.packages.filter(package_type='basic').first()
        if basic_package:
            return {
                'title': basic_package.title,
                'price': basic_package.price,
                'delivery_days': basic_package.delivery_days,
            }
        return None

    def get_monthly_orders(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        return obj.orders.filter(
            created_at__gte=thirty_days_ago,
            status__in=['active', 'completed']
        ).count()

    def get_monthly_revenue(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        return obj.orders.filter(
            created_at__gte=thirty_days_ago,
            status__in=['active', 'completed']
        ).aggregate(
            total=models.Sum('total_price')
        )['total'] or 0