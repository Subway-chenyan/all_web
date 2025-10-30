"""
Social authentication models for WeChat and QQ integration
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from apps.common.models import BaseModel
import uuid
import json

User = get_user_model()


class SocialProvider(models.TextChoices):
    """Supported social authentication providers"""
    WECHAT = 'wechat', 'WeChat'
    QQ = 'qq', 'QQ'
    WEIBO = 'weibo', 'Weibo'
    ALIPAY = 'alipay', 'Alipay'


class SocialAccount(BaseModel):
    """
    Social account association model
    Links social platform accounts to Django users
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='social_accounts',
        verbose_name='关联用户'
    )

    provider = models.CharField(
        '平台提供商',
        max_length=20,
        choices=SocialProvider.choices,
        db_index=True
    )

    uid = models.CharField(
        '平台用户ID',
        max_length=255,
        db_index=True
    )

    # Raw data from social platform
    raw_data = models.JSONField(
        '原始数据',
        default=dict,
        blank=True,
        help_text="Raw response data from social platform"
    )

    # Extra data for platform-specific fields
    extra_data = models.JSONField(
        '扩展数据',
        default=dict,
        blank=True,
        help_text="Platform-specific additional data"
    )

    # Access tokens and refresh tokens
    access_token = models.TextField(
        '访问令牌',
        blank=True,
        help_text="OAuth access token"
    )

    refresh_token = models.TextField(
        '刷新令牌',
        blank=True,
        help_text="OAuth refresh token"
    )

    token_expires_at = models.DateTimeField(
        '令牌过期时间',
        null=True,
        blank=True,
        help_text="Access token expiration time"
    )

    # Account status
    is_active = models.BooleanField(
        '账户激活状态',
        default=True,
        db_index=True,
        help_text="Whether this social account is active"
    )

    last_synced_at = models.DateTimeField(
        '最后同步时间',
        null=True,
        blank=True,
        help_text="Last time data was synced from social platform"
    )

    # WeChat specific fields
    unionid = models.CharField(
        'UnionID',
        max_length=100,
        null=True,
        blank=True,
        db_index=True,
        help_text="WeChat UnionID for cross-platform identification"
    )

    openid = models.CharField(
        'OpenID',
        max_length=100,
        null=True,
        blank=True,
        db_index=True,
        help_text="Platform-specific OpenID"
    )

    class Meta:
        db_table = 'accounts_social_account'
        verbose_name = '社交账户'
        verbose_name_plural = '社交账户'
        unique_together = [
            ['provider', 'uid'],
            ['provider', 'openid']
        ]
        indexes = [
            models.Index(fields=['user', 'provider']),
            models.Index(fields=['provider', 'is_active']),
            models.Index(fields=['unionid']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_provider_display()}"

    def clean(self):
        """Validate social account data"""
        if self.provider == SocialProvider.WECHAT and not self.openid:
            raise ValidationError('WeChat accounts require an openid')

        if self.provider == SocialProvider.QQ and not self.uid:
            raise ValidationError('QQ accounts require a uid')

    @property
    def is_token_expired(self):
        """Check if access token is expired"""
        if not self.token_expires_at:
            return False
        from django.utils import timezone
        return timezone.now() >= self.token_expires_at

    def update_token(self, access_token, refresh_token=None, expires_in=None):
        """Update access token information"""
        self.access_token = access_token
        if refresh_token:
            self.refresh_token = refresh_token
        if expires_in:
            from django.utils import timezone
            from datetime import timedelta
            self.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        self.save()


class SocialLoginAttempt(BaseModel):
    """
    Track social login attempts for security and analytics
    """
    attempt_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    provider = models.CharField(
        '平台提供商',
        max_length=20,
        choices=SocialProvider.choices,
        db_index=True
    )

    state = models.CharField(
        '状态参数',
        max_length=255,
        db_index=True,
        help_text="OAuth state parameter for CSRF protection"
    )

    # User information (can be null for new users)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='social_login_attempts',
        null=True,
        blank=True,
        verbose_name='用户'
    )

    # Request information
    ip_address = models.GenericIPAddressField(
        'IP地址',
        null=True,
        blank=True
    )

    user_agent = models.TextField(
        'User Agent',
        blank=True
    )

    # Attempt status
    status = models.CharField(
        '状态',
        max_length=20,
        choices=[
            ('pending', '待处理'),
            ('success', '成功'),
            ('failed', '失败'),
            ('cancelled', '已取消'),
            ('expired', '已过期'),
        ],
        default='pending',
        db_index=True
    )

    # Result information
    social_account = models.ForeignKey(
        SocialAccount,
        on_delete=models.CASCADE,
        related_name='login_attempts',
        null=True,
        blank=True,
        verbose_name='关联社交账户'
    )

    error_message = models.TextField(
        '错误信息',
        blank=True
    )

    # User choice during signup (for new users)
    chosen_user_type = models.CharField(
        '选择用户类型',
        max_length=20,
        choices=User.USER_TYPE_CHOICES,
        null=True,
        blank=True
    )

    # Timestamps
    initiated_at = models.DateTimeField(
        '发起时间',
        auto_now_add=True
    )

    completed_at = models.DateTimeField(
        '完成时间',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'accounts_social_login_attempt'
        verbose_name = '社交登录尝试'
        verbose_name_plural = '社交登录尝试'
        indexes = [
            models.Index(fields=['state']),
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['initiated_at']),
            models.Index(fields=['ip_address']),
        ]

    def __str__(self):
        return f"{self.get_provider_display()} - {self.status}"

    def mark_completed(self, status, social_account=None, error_message=None):
        """Mark the attempt as completed"""
        from django.utils import timezone
        self.status = status
        self.completed_at = timezone.now()
        if social_account:
            self.social_account = social_account
        if error_message:
            self.error_message = error_message
        self.save()


class SocialProfileSync(BaseModel):
    """
    Track profile synchronization from social platforms
    """
    social_account = models.ForeignKey(
        SocialAccount,
        on_delete=models.CASCADE,
        related_name='profile_syncs',
        verbose_name='社交账户'
    )

    sync_type = models.CharField(
        '同步类型',
        max_length=20,
        choices=[
            ('profile', '个人资料'),
            ('avatar', '头像'),
            ('contacts', '联系人'),
            ('full_sync', '完整同步'),
        ],
        db_index=True
    )

    # Sync status
    status = models.CharField(
        '状态',
        max_length=20,
        choices=[
            ('pending', '待处理'),
            ('processing', '处理中'),
            ('success', '成功'),
            ('failed', '失败'),
            ('partial', '部分成功'),
        ],
        default='pending',
        db_index=True
    )

    # Data fields
    sync_data = models.JSONField(
        '同步数据',
        default=dict,
        blank=True,
        help_text="Data synced from social platform"
    )

    processed_fields = models.JSONField(
        '已处理字段',
        default=list,
        blank=True,
        help_text="List of fields that were successfully processed"
    )

    # Error handling
    error_message = models.TextField(
        '错误信息',
        blank=True
    )

    # Processing time
    started_at = models.DateTimeField(
        '开始时间',
        auto_now_add=True
    )

    completed_at = models.DateTimeField(
        '完成时间',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'accounts_social_profile_sync'
        verbose_name = '社交资料同步'
        verbose_name_plural = '社交资料同步'
        indexes = [
            models.Index(fields=['social_account', 'sync_type']),
            models.Index(fields=['status']),
            models.Index(fields=['started_at']),
        ]

    def __str__(self):
        return f"{self.social_account} - {self.get_sync_type_display()}"