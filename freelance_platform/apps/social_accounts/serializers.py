from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .models import SocialAccount, SocialUserRegistration
from apps.common.models import chinese_phone_validator

User = get_user_model()


class SocialLoginSerializer(serializers.Serializer):
    """社交登录序列化器"""
    provider = serializers.ChoiceField(choices=SocialAccount.PROVIDER_CHOICES)
    code = serializers.CharField(required=False, help_text="OAuth授权码")
    access_token = serializers.CharField(required=False, help_text="访问令牌")
    openid = serializers.CharField(required=False, help_text="微信OpenID")
    unionid = serializers.CharField(required=False, help_text="微信UnionID")

    # 用户信息（用于注册新用户）
    social_info = serializers.JSONField(required=False, default=dict)

    # 用户选择的角色
    user_type = serializers.ChoiceField(
        choices=[('client', '客户'), ('freelancer', '自由职业者')],
        required=False,
        default='client'
    )

    def validate(self, attrs):
        provider = attrs.get('provider')

        # 验证不同平台需要的参数
        if provider == 'wechat':
            if not attrs.get('code') and not attrs.get('access_token'):
                raise serializers.ValidationError("微信登录需要提供code或access_token")
        elif provider == 'qq':
            if not attrs.get('code') and not attrs.get('access_token'):
                raise serializers.ValidationError("QQ登录需要提供code或access_token")

        return attrs


class SocialAccountSerializer(serializers.ModelSerializer):
    """社交账号序列化器"""
    user_info = serializers.SerializerMethodField()
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)

    class Meta:
        model = SocialAccount
        fields = [
            'id', 'user', 'provider', 'provider_display', 'uid',
            'openid', 'unionid', 'social_nickname', 'social_avatar',
            'social_profile_url', 'last_login_at', 'login_count',
            'is_active', 'is_verified', 'created_at', 'user_info'
        ]
        read_only_fields = [
            'id', 'user', 'uid', 'openid', 'unionid', 'last_login_at',
            'login_count', 'created_at'
        ]

    def get_user_info(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email,
                'user_type': obj.user.get_user_type_display(),
                'avatar': obj.user.profile.avatar.url if obj.user.profile.avatar else None,
            }
        return None


class SocialRegistrationSerializer(serializers.ModelSerializer):
    """社交用户注册序列化器"""
    provided_email = serializers.EmailField(required=False)
    provided_phone = serializers.CharField(
        required=False,
        validators=[chinese_phone_validator]
    )

    class Meta:
        model = SocialUserRegistration
        fields = [
            'id', 'social_account', 'selected_user_type', 'registration_status',
            'current_step', 'total_steps', 'email_collected', 'phone_collected',
            'nickname_collected', 'provided_email', 'provided_phone',
            'registration_completed_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'social_account', 'registration_status', 'current_step',
            'total_steps', 'registration_completed_at', 'created_at'
        ]

    def validate_provided_email(self, value):
        if value:
            try:
                validate_email(value)
                # 检查邮箱是否已被其他用户使用
                if User.objects.filter(email=value).exists():
                    raise serializers.ValidationError("该邮箱已被其他用户使用")
            except ValidationError:
                raise serializers.ValidationError("请输入有效的邮箱地址")
        return value

    def validate_provided_phone(self, value):
        if value:
            # 检查手机号是否已被其他用户使用
            if User.objects.filter(phone_number=value).exists():
                raise serializers.ValidationError("该手机号已被其他用户使用")
        return value


class SocialAccountBindingSerializer(serializers.Serializer):
    """社交账号绑定序列化器"""
    provider = serializers.ChoiceField(choices=SocialAccount.PROVIDER_CHOICES)
    code = serializers.CharField(required=False, help_text="OAuth授权码")
    access_token = serializers.CharField(required=False, help_text="访问令牌")
    bind_type = serializers.ChoiceField(
        choices=[('bind', '绑定'), 'unbind', '解绑'],
        default='bind'
    )

    def validate(self, attrs):
        provider = attrs.get('provider')
        bind_type = attrs.get('bind_type')

        if bind_type == 'bind':
            if not attrs.get('code') and not attrs.get('access_token'):
                raise serializers.ValidationError("绑定社交账号需要提供code或access_token")

        return attrs


class SocialUserInfoSerializer(serializers.Serializer):
    """社交用户信息序列化器"""
    # 微信用户信息
    wechat_nickname = serializers.CharField(required=False)
    wechat_avatar = serializers.URLField(required=False)
    wechat_gender = serializers.IntegerField(required=False, allow_null=True)
    wechat_city = serializers.CharField(required=False)
    wechat_province = serializers.CharField(required=False)
    wechat_country = serializers.CharField(required=False)
    wechat_language = serializers.CharField(required=False)

    # QQ用户信息
    qq_nickname = serializers.CharField(required=False)
    qq_avatar = serializers.URLField(required=False)
    qq_gender = serializers.CharField(required=False)
    qq_city = serializers.CharField(required=False)
    qq_province = serializers.CharField(required=False)
    qq_year = serializers.CharField(required=False)
    qq_vip_info = serializers.JSONField(required=False)

    def validate_wechat_gender(self, value):
        if value is not None and value not in [0, 1, 2]:
            raise serializers.ValidationError("微信性别值无效，应为0(未知)、1(男)或2(女)")
        return value


class SocialLoginCallbackSerializer(serializers.Serializer):
    """社交登录回调序列化器"""
    provider = serializers.ChoiceField(choices=SocialAccount.PROVIDER_CHOICES)
    code = serializers.CharField(help_text="OAuth授权码")
    state = serializers.CharField(required=False, help_text="状态参数")
    error = serializers.CharField(required=False, help_text="错误代码")
    error_description = serializers.CharField(required=False, help_text="错误描述")

    def validate(self, attrs):
        if 'error' in attrs:
            raise serializers.ValidationError(
                f"社交登录失败: {attrs.get('error_description', attrs['error'])}"
            )
        return attrs


class SocialTokenRefreshSerializer(serializers.Serializer):
    """社交令牌刷新序列化器"""
    provider = serializers.ChoiceField(choices=SocialAccount.PROVIDER_CHOICES)
    refresh_token = serializers.CharField(help_text="刷新令牌")
    social_account_id = serializers.IntegerField(help_text="社交账号ID")

    def validate_social_account_id(self, value):
        try:
            social_account = SocialAccount.objects.get(id=value)
            if not social_account.is_active:
                raise serializers.ValidationError("该社交账号已被禁用")
            return value
        except SocialAccount.DoesNotExist:
            raise serializers.ValidationError("社交账号不存在")


class SocialAccountListSerializer(serializers.ModelSerializer):
    """社交账号列表序列化器"""
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    last_login_format = serializers.DateTimeField(source='last_login_at', format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = SocialAccount
        fields = [
            'id', 'provider', 'provider_display', 'social_nickname',
            'social_avatar', 'last_login_format', 'login_count',
            'is_active', 'created_at'
        ]


class UserSocialAccountsSerializer(serializers.ModelSerializer):
    """用户社交账号信息序列化器"""
    social_accounts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'social_accounts']
        read_only_fields = ['id', 'username', 'email', 'user_type']

    def get_social_accounts(self, obj):
        accounts = SocialAccount.objects.filter(user=obj, is_active=True)
        return SocialAccountListSerializer(accounts, many=True).data