"""
评价系统序列化器

这个模块包含了评价系统的所有序列化器，用于API数据转换和验证。
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from django.utils import timezone
from .models import (
    Review, ReviewHelpful, ReviewReport, UserRating, ReviewInvitation,
    ReviewTemplate, ReviewStat
)
from apps.accounts.models import User
from apps.orders.models import Order
from apps.gigs.models import Gig

UserModel = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    """用户最小信息序列化器"""
    class Meta:
        model = UserModel
        fields = ['id', 'username', 'first_name', 'last_name', 'user_type']


class ReviewListSerializer(serializers.ModelSerializer):
    """评价列表序列化器"""
    reviewer_info = UserMinimalSerializer(source='reviewer', read_only=True)
    reviewee_info = UserMinimalSerializer(source='reviewee', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    gig_title = serializers.CharField(source='gig.title', read_only=True)
    time_ago = serializers.SerializerMethodField()
    helpful_count = serializers.SerializerMethodField()
    is_helpful_voted = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'reviewer', 'reviewee', 'reviewer_info', 'reviewee_info',
            'order', 'order_number', 'gig', 'gig_title', 'review_type',
            'rating', 'title', 'content', 'status', 'is_visible',
            'time_ago', 'helpful_count', 'is_helpful_voted',
            'created_at', 'updated_at'
        ]

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

    def get_helpful_count(self, obj):
        """获取有用票数"""
        return obj.helpful_votes.filter(is_helpful=True).count()

    def get_is_helpful_voted(self, obj):
        """检查当前用户是否投过票"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.helpful_votes.filter(user=request.user).exists()
        return False


class ReviewDetailSerializer(serializers.ModelSerializer):
    """评价详情序列化器"""
    reviewer_info = UserMinimalSerializer(source='reviewer', read_only=True)
    reviewee_info = UserMinimalSerializer(source='reviewee', read_only=True)
    order_info = serializers.SerializerMethodField()
    gig_info = serializers.SerializerMethodField()
    helpful_votes = serializers.SerializerMethodField()
    user_helpful_vote = serializers.SerializerMethodField()
    response_time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'reviewer', 'reviewee', 'reviewer_info', 'reviewee_info',
            'order', 'order_info', 'gig', 'gig_info', 'review_type',
            'status', 'is_visible', 'rating', 'communication_rating',
            'quality_rating', 'delivery_rating', 'value_rating',
            'title', 'content', 'response', 'responded_at',
            'response_time_ago', 'response_helpful_count',
            'helpful_votes', 'user_helpful_vote',
            'is_flagged', 'flag_reason', 'moderated_by',
            'moderated_at', 'moderation_notes',
            'created_at', 'updated_at'
        ]

    def get_order_info(self, obj):
        """获取订单信息"""
        if obj.order:
            return {
                'id': obj.order.id,
                'order_number': obj.order.order_number,
                'total_price': obj.order.total_price,
                'completed_at': obj.order.actual_delivery
            }
        return None

    def get_gig_info(self, obj):
        """获取服务信息"""
        if obj.gig:
            return {
                'id': obj.gig.id,
                'title': obj.gig.title,
                'category': obj.gig.category.name if obj.gig.category else None,
                'basic_price': obj.gig.basic_price
            }
        return None

    def get_helpful_votes(self, obj):
        """获取有用票数统计"""
        helpful_count = obj.helpful_votes.filter(is_helpful=True).count()
        total_count = obj.helpful_votes.count()
        return {
            'helpful': helpful_count,
            'not_helpful': total_count - helpful_count,
            'total': total_count
        }

    def get_user_helpful_vote(self, obj):
        """获取当前用户的投票"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.helpful_votes.filter(user=request.user).first()
            if vote:
                return {
                    'is_helpful': vote.is_helpful,
                    'created_at': vote.created_at
                }
        return None

    def get_response_time_ago(self, obj):
        """获取回复的相对时间"""
        if obj.responded_at:
            now = timezone.now()
            diff = now - obj.responded_at

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
        return None


class ReviewCreateSerializer(serializers.ModelSerializer):
    """评价创建序列化器"""
    order_id = serializers.IntegerField(write_only=True)
    gig_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Review
        fields = [
            'order_id', 'gig_id', 'review_type', 'rating',
            'communication_rating', 'quality_rating',
            'delivery_rating', 'value_rating',
            'title', 'content'
        ]

    def validate_order_id(self, value):
        """验证订单ID"""
        try:
            order = Order.objects.get(id=value)
            return order
        except Order.DoesNotExist:
            raise serializers.ValidationError("订单不存在")

    def validate_gig_id(self, value):
        """验证服务ID"""
        if value:
            try:
                gig = Gig.objects.get(id=value)
                return gig
            except Gig.DoesNotExist:
                raise serializers.ValidationError("服务不存在")
        return None

    def validate_rating(self, value):
        """验证评分"""
        if not 1 <= value <= 5:
            raise serializers.ValidationError("评分必须在1-5之间")
        return value

    def validate(self, attrs):
        """验证评价数据"""
        request = self.context.get('request')
        order = attrs['order']
        review_type = attrs['review_type']

        # 检查订单状态
        if order.status != 'completed':
            raise serializers.ValidationError("只有已完成的订单才能评价")

        # 检查用户是否是订单参与者
        if request.user not in [order.client, order.freelancer]:
            raise serializers.ValidationError("只有订单参与者可以评价")

        # 确定被评价者
        if review_type == 'freelancer':
            if request.user != order.client:
                raise serializers.ValidationError("只有客户端可以评价自由职业者")
            attrs['reviewee'] = order.freelancer
        elif review_type == 'client':
            if request.user != order.freelancer:
                raise serializers.ValidationError("只有自由职业者可以评价客户端")
            attrs['reviewee'] = order.client
        else:
            raise serializers.ValidationError("无效的评价类型")

        # 检查是否已经评价过
        if Review.objects.filter(
            reviewer=request.user,
            order=order,
            review_type=review_type
        ).exists():
            raise serializers.ValidationError("您已经评价过此订单")

        # 验证服务
        if review_type in ['freelancer', 'gig'] and not attrs.get('gig_id'):
            attrs['gig'] = order.gig
        elif attrs.get('gig_id'):
            attrs['gig'] = attrs.pop('gig_id')

        attrs['reviewer'] = request.user

        return attrs

    def create(self, validated_data):
        """创建评价"""
        review = super().create(validated_data)

        # 更新用户和服务的评分
        review.update_average_ratings()

        # 创建或更新评价邀请状态
        invitation, created = ReviewInvitation.objects.get_or_create(
            order=review.order,
            defaults={
                'auto_send_invitation': True,
                'days_until_reminder': 3
            }
        )

        if review.review_type == 'freelancer':
            invitation.freelancer_reviewed = True
        elif review.review_type == 'client':
            invitation.client_reviewed = True
        invitation.save()

        return review


class ReviewUpdateSerializer(serializers.ModelSerializer):
    """评价更新序列化器"""

    class Meta:
        model = Review
        fields = [
            'rating', 'communication_rating', 'quality_rating',
            'delivery_rating', 'value_rating', 'title', 'content'
        ]

    def validate(self, attrs):
        """验证更新权限"""
        request = self.context.get('request')
        instance = self.instance

        # 只有评价者可以修改自己的评价
        if request.user != instance.reviewer:
            raise serializers.ValidationError("您只能修改自己的评价")

        # 已发布的评价修改后需要重新审核
        if instance.status == 'published':
            instance.status = 'pending'
            instance.is_visible = False

        return attrs


class ReviewResponseSerializer(serializers.ModelSerializer):
    """评价回复序列化器"""

    class Meta:
        model = Review
        fields = ['response']

    def validate_response(self, value):
        """验证回复内容"""
        if not value.strip():
            raise serializers.ValidationError("回复内容不能为空")
        return value.strip()

    def validate(self, attrs):
        """验证回复权限"""
        request = self.context.get('request')
        instance = self.instance

        # 只有被评价者可以回复
        if request.user != instance.reviewee:
            raise serializers.ValidationError("只有被评价者可以回复")

        # 检查是否已经回复过
        if instance.response:
            raise serializers.ValidationError("您已经回复过此评价")

        attrs['responded_at'] = timezone.now()
        return attrs


class ReviewHelpfulSerializer(serializers.ModelSerializer):
    """评价有用投票序列化器"""

    class Meta:
        model = ReviewHelpful
        fields = ['review', 'is_helpful']
        read_only_fields = ['user']

    def validate_review(self, value):
        """验证评价"""
        request = self.context.get('request')

        # 不能给自己的评价投票
        if value.reviewer == request.user:
            raise serializers.ValidationError("不能给自己的评价投票")

        # 检查是否已经投票
        if ReviewHelpful.objects.filter(review=value, user=request.user).exists():
            raise serializers.ValidationError("您已经对此评价投过票")

        return value

    def create(self, validated_data):
        """创建投票"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class ReviewReportSerializer(serializers.ModelSerializer):
    """评价报告序列化器"""
    reviewer_info = UserMinimalSerializer(source='review.reviewer', read_only=True)

    class Meta:
        model = ReviewReport
        fields = [
            'id', 'review', 'reviewer_info', 'reporter', 'reason',
            'description', 'status', 'admin_notes', 'resolved_by',
            'resolved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'resolved_by', 'resolved_at', 'created_at', 'updated_at']

    def validate_review(self, value):
        """验证评价"""
        request = self.context.get('request')

        # 不能报告自己的评价
        if value.reviewer == request.user:
            raise serializers.ValidationError("不能报告自己的评价")

        # 检查是否已经报告过
        if ReviewReport.objects.filter(review=value, reporter=request.user).exists():
            raise serializers.ValidationError("您已经报告过此评价")

        return value

    def create(self, validated_data):
        """创建报告"""
        request = self.context.get('request')
        validated_data['reporter'] = request.user

        # 自动标记评价为被举报
        review = validated_data['review']
        review.is_flagged = True
        review.flag_reason = validated_data['reason']
        review.save()

        return super().create(validated_data)


class UserRatingSerializer(serializers.ModelSerializer):
    """用户评分序列化器"""
    user_info = UserMinimalSerializer(source='user', read_only=True)
    rating_distribution = serializers.SerializerMethodField()

    class Meta:
        model = UserRating
        fields = [
            'id', 'user', 'user_info', 'overall_rating', 'total_reviews',
            'communication_rating', 'quality_rating', 'delivery_rating',
            'value_rating', 'five_star_count', 'four_star_count',
            'three_star_count', 'two_star_count', 'one_star_count',
            'reputation_score', 'rank_percentile', 'rating_distribution',
            'last_review_date', 'created_at', 'updated_at'
        ]

    def get_rating_distribution(self, obj):
        """获取评分分布"""
        return {
            '5': obj.five_star_count,
            '4': obj.four_star_count,
            '3': obj.three_star_count,
            '2': obj.two_star_count,
            '1': obj.one_star_count
        }


class ReviewInvitationSerializer(serializers.ModelSerializer):
    """评价邀请序列化器"""
    order_info = serializers.SerializerMethodField()

    class Meta:
        model = ReviewInvitation
        fields = [
            'id', 'order', 'order_info', 'client_invited', 'freelancer_invited',
            'client_reviewed', 'freelancer_reviewed',
            'client_invitation_sent_at', 'freelancer_invitation_sent_at',
            'reminder_sent_at', 'auto_send_invitation',
            'days_until_reminder', 'created_at', 'updated_at'
        ]

    def get_order_info(self, obj):
        """获取订单信息"""
        if obj.order:
            return {
                'id': obj.order.id,
                'order_number': obj.order.order_number,
                'gig_title': obj.order.gig.title if obj.order.gig else None,
                'total_price': obj.order.total_price,
                'completed_at': obj.order.actual_delivery
            }
        return None


class ReviewTemplateSerializer(serializers.ModelSerializer):
    """评价模板序列化器"""

    class Meta:
        model = ReviewTemplate
        fields = [
            'id', 'name', 'template_type', 'title', 'content',
            'variables', 'usage_count', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']


class ReviewStatSerializer(serializers.ModelSerializer):
    """评价统计序列化器"""

    class Meta:
        model = ReviewStat
        fields = [
            'id', 'date', 'total_reviews', 'published_reviews',
            'flagged_reviews', 'removed_reviews', 'average_rating',
            'five_star_reviews', 'four_star_reviews',
            'three_star_reviews', 'two_star_reviews', 'one_star_reviews',
            'responded_reviews', 'average_response_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReviewModerationSerializer(serializers.ModelSerializer):
    """评价审核序列化器"""
    moderator_info = UserMinimalSerializer(source='moderated_by', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'status', 'is_visible', 'is_flagged', 'flag_reason',
            'moderated_by', 'moderator_info', 'moderated_at',
            'moderation_notes', 'updated_at'
        ]
        read_only_fields = ['id', 'moderated_by', 'moderated_at']

    def validate(self, attrs):
        """验证审核权限"""
        request = self.context.get('request')

        # 只有管理员可以审核
        if request.user.user_type != 'admin':
            raise serializers.ValidationError("只有管理员可以审核评价")

        attrs['moderated_by'] = request.user
        attrs['moderated_at'] = timezone.now()

        return attrs


class ReviewSearchSerializer(serializers.Serializer):
    """评价搜索序列化器"""
    query = serializers.CharField(required=False)
    rating = serializers.IntegerField(required=False, min_value=1, max_value=5)
    review_type = serializers.ChoiceField(
        choices=Review.REVIEW_TYPES,
        required=False
    )
    has_response = serializers.BooleanField(required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    sort_by = serializers.ChoiceField(
        choices=[
            'created_at',
            'rating',
            'helpful_count'
        ],
        default='created_at'
    )
    sort_order = serializers.ChoiceField(
        choices=['asc', 'desc'],
        default='desc'
    )


class ReviewAnalyticsSerializer(serializers.Serializer):
    """评价分析序列化器"""
    total_reviews = serializers.IntegerField()
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    rating_distribution = serializers.DictField()
    reviews_by_type = serializers.DictField()
    reviews_over_time = serializers.ListField()
    response_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_response_time = serializers.DurationField()
    most_helpful_reviews = serializers.ListField()
    recent_reviews = serializers.ListField()