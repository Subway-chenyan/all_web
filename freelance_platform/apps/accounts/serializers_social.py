"""
Serializers for social authentication
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from .models_social import SocialAccount, SocialProvider, SocialLoginAttempt
from .models import UserProfile

User = get_user_model()


class SocialAuthStartSerializer(serializers.Serializer):
    """
    Serializer for starting social authentication
    """
    provider = serializers.ChoiceField(
        choices=SocialProvider.choices,
        required=True,
        help_text="Social authentication provider"
    )
    redirect_url = serializers.URLField(
        required=False,
        allow_blank=True,
        help_text="Optional custom redirect URL after authentication"
    )

    def validate_provider(self, value):
        """Validate provider is supported"""
        supported_providers = [p.value for p in SocialProvider]
        if value not in supported_providers:
            raise serializers.ValidationError(f"Provider '{value}' is not supported")
        return value


class SocialAuthCompleteSerializer(serializers.Serializer):
    """
    Serializer for completing social authentication
    """
    code = serializers.CharField(
        required=True,
        help_text="Authorization code from social platform"
    )
    state = serializers.CharField(
        required=True,
        help_text="State parameter for CSRF protection"
    )
    user_type = serializers.ChoiceField(
        choices=User.USER_TYPE_CHOICES,
        required=False,
        allow_null=True,
        help_text="User type for new accounts (client, freelancer, admin)"
    )

    def validate(self, attrs):
        """Validate the complete authentication request"""
        code = attrs.get('code')
        state = attrs.get('state')

        if not code or not state:
            raise serializers.ValidationError("Both code and state are required")

        # Check if the login attempt exists and is valid
        try:
            attempt = SocialLoginAttempt.objects.get(
                state=state,
                status='pending'
            )

            # Check if attempt is not too old (10 minutes)
            from django.utils import timezone
            from datetime import timedelta
            if timezone.now() - attempt.initiated_at > timedelta(minutes=10):
                attempt.status = 'expired'
                attempt.save()
                raise serializers.ValidationError("Authentication session has expired")

            attrs['attempt'] = attempt
            return attrs

        except SocialLoginAttempt.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired authentication session")

    def validate_user_type(self, value):
        """Validate user type for new accounts"""
        if value and value not in ['client', 'freelancer', 'admin']:
            raise serializers.ValidationError("Invalid user type")
        return value


class SocialAccountSerializer(serializers.ModelSerializer):
    """
    Serializer for social account information
    """
    provider_name = serializers.CharField(source='get_provider_display', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    last_synced_at_formatted = serializers.SerializerMethodField()
    is_token_valid = serializers.SerializerMethodField()

    class Meta:
        model = SocialAccount
        fields = [
            'id',
            'provider',
            'provider_name',
            'uid',
            'openid',
            'unionid',
            'is_active',
            'created_at',
            'created_at_formatted',
            'last_synced_at',
            'last_synced_at_formatted',
            'is_token_valid',
            'token_expires_at',
        ]
        read_only_fields = ['id', 'uid', 'openid', 'unionid', 'created_at', 'last_synced_at']

    def get_created_at_formatted(self, obj):
        """Format created at timestamp"""
        if obj.created_at:
            return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')
        return None

    def get_last_synced_at_formatted(self, obj):
        """Format last synced at timestamp"""
        if obj.last_synced_at:
            return obj.last_synced_at.strftime('%Y-%m-%d %H:%M:%S')
        return None

    def get_is_token_valid(self, obj):
        """Check if access token is still valid"""
        return not obj.is_token_expired


class UserSocialProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile with social authentication info
    """
    social_accounts = SocialAccountSerializer(many=True, read_only=True)
    profile = serializers.SerializerMethodField()
    has_password = serializers.SerializerMethodField()
    social_login_enabled = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'user_type',
            'user_status',
            'is_email_verified',
            'is_phone_verified',
            'phone_number',
            'wechat_id',
            'profile_completion_percentage',
            'social_accounts',
            'profile',
            'has_password',
            'social_login_enabled',
        ]

    def get_profile(self, obj):
        """Get user profile information"""
        try:
            profile = UserProfile.objects.get(user=obj)
            return {
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'bio': profile.bio,
                'avatar': profile.avatar.url if profile.avatar else None,
                'country': profile.country,
                'province': profile.province,
                'city': profile.city,
                'profile_visibility': profile.profile_visibility,
            }
        except UserProfile.DoesNotExist:
            return None

    def get_has_password(self, obj):
        """Check if user has a password set"""
        return obj.has_usable_password()

    def get_social_login_enabled(self, obj):
        """Check if user has any active social accounts"""
        return obj.social_accounts.filter(is_active=True).exists()


class SocialLoginAttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for social login attempts (admin use)
    """
    provider_name = serializers.CharField(source='get_provider_display', read_only=True)
    status_name = serializers.CharField(source='get_status_display', read_only=True)
    initiated_at_formatted = serializers.SerializerMethodField()
    completed_at_formatted = serializers.SerializerMethodField()
    duration_seconds = serializers.SerializerMethodField()

    class Meta:
        model = SocialLoginAttempt
        fields = [
            'attempt_id',
            'provider',
            'provider_name',
            'state',
            'user',
            'status',
            'status_name',
            'ip_address',
            'user_agent',
            'social_account',
            'chosen_user_type',
            'initiated_at',
            'initiated_at_formatted',
            'completed_at',
            'completed_at_formatted',
            'duration_seconds',
            'error_message',
        ]
        read_only_fields = ['attempt_id', 'initiated_at', 'completed_at']

    def get_initiated_at_formatted(self, obj):
        """Format initiated at timestamp"""
        if obj.initiated_at:
            return obj.initiated_at.strftime('%Y-%m-%d %H:%M:%S')
        return None

    def get_completed_at_formatted(self, obj):
        """Format completed at timestamp"""
        if obj.completed_at:
            return obj.completed_at.strftime('%Y-%m-%d %H:%M:%S')
        return None

    def get_duration_seconds(self, obj):
        """Calculate duration in seconds"""
        if obj.initiated_at and obj.completed_at:
            delta = obj.completed_at - obj.initiated_at
            return int(delta.total_seconds())
        return None


class SocialAuthResponseSerializer(serializers.Serializer):
    """
    Serializer for social authentication response
    """
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    token_type = serializers.CharField(default='Bearer')
    expires_in = serializers.IntegerField()
    user = UserSocialProfileSerializer()
    is_new_user = serializers.BooleanField()
    social_account = SocialAccountSerializer(required=False)


class SocialAuthErrorResponseSerializer(serializers.Serializer):
    """
    Serializer for social authentication error response
    """
    success = serializers.BooleanField(default=False)
    error = serializers.CharField()
    details = serializers.CharField(required=False, allow_blank=True)
    error_code = serializers.CharField(required=False, allow_blank=True)


class LinkSocialAccountRequestSerializer(serializers.Serializer):
    """
    Serializer for linking social account request
    """
    provider = serializers.ChoiceField(
        choices=SocialProvider.choices,
        required=True,
        help_text="Social authentication provider to link"
    )

    def validate_provider(self, value):
        """Validate provider is supported"""
        supported_providers = [p.value for p in SocialProvider]
        if value not in supported_providers:
            raise serializers.ValidationError(f"Provider '{value}' is not supported")
        return value


class unlinkSocialAccountRequestSerializer(serializers.Serializer):
    """
    Serializer for unlinking social account request
    """
    provider = serializers.ChoiceField(
        choices=SocialProvider.choices,
        required=True,
        help_text="Social authentication provider to unlink"
    )
    confirm = serializers.BooleanField(
        required=True,
        help_text="Confirmation to unlink the social account"
    )

    def validate(self, attrs):
        """Validate unlink request"""
        provider = attrs.get('provider')
        confirm = attrs.get('confirm')

        if not confirm:
            raise serializers.ValidationError("Confirmation is required to unlink social account")

        return attrs