from django.db import models
from django.contrib.auth import get_user_model
from apps.common.models import BaseModel
import uuid

User = get_user_model()


class SocialAccount(BaseModel):
    """社交账号关联模型"""

    PROVIDER_CHOICES = [
        ('wechat', '微信'),
        ('qq', 'QQ'),
        ('wechat_open', '微信开放平台'),
        ('wechat_union', '微信开放平台UnionID'),
        ('alipay', '支付宝'),
        ('weibo', '微博'),
        ('github', 'GitHub'),
        ('google', 'Google'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='social_accounts',
        verbose_name='用户'
    )

    provider = models.CharField(
        '社交平台',
        max_length=50,
        choices=PROVIDER_CHOICES,
        db_index=True
    )

    uid = models.CharField('社交平台用户ID', max_length=255, db_index=True)

    # 微信相关字段
    openid = models.CharField('OpenID', max_length=255, unique=True, null=True, blank=True, db_index=True)
    unionid = models.CharField('UnionID', max_length=255, null=True, blank=True, db_index=True)

    # 社交账号基本信息
    social_nickname = models.CharField('社交昵称', max_length=100, blank=True)
    social_avatar = models.URLField('社交头像', blank=True)
    social_profile_url = models.URLField('社交资料链接', blank=True)

    # 登录信息
    last_login_at = models.DateTimeField('最后登录时间', null=True, blank=True)
    login_count = models.IntegerField('登录次数', default=0, db_index=True)

    # 社交账号状态
    is_active = models.BooleanField('是否活跃', default=True, db_index=True)
    is_verified = models.BooleanField('是否已验证', default=False, db_index=True)

    # OAuth相关
    access_token = models.TextField('访问令牌', blank=True)
    refresh_token = models.TextField('刷新令牌', blank=True)
    token_expires_at = models.DateTimeField('令牌过期时间', null=True, blank=True)

    # 额外信息（JSON格式存储）
    extra_data = models.JSONField('额外数据', default=dict, blank=True)

    class Meta:
        db_table = 'social_accounts_social_account'
        verbose_name = '社交账号'
        verbose_name_plural = '社交账号'
        unique_together = [
            ['provider', 'uid'],
            ['provider', 'openid'],
        ]
        indexes = [
            models.Index(fields=['user', 'provider']),
            models.Index(fields=['provider', 'is_active']),
            models.Index(fields=['unionid']),
            models.Index(fields=['last_login_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_provider_display()} ({self.social_nickname or self.uid})"


class SocialAuthBinding(BaseModel):
    """社交账号绑定确认模型"""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='social_bindings',
        verbose_name='用户'
    )

    provider = models.CharField(
        '社交平台',
        max_length=50,
        choices=SocialAccount.PROVIDER_CHOICES,
        db_index=True
    )

    social_uid = models.CharField('社交平台用户ID', max_length=255, db_index=True)
    social_nickname = models.CharField('社交昵称', max_length=100, blank=True)

    # 绑定确认信息
    confirmation_token = models.UUIDField('确认令牌', default=uuid.uuid4, unique=True)
    confirmation_code = models.CharField('确认码', max_length=6, blank=True)

    # 状态
    status = models.CharField(
        '状态',
        max_length=20,
        choices=[
            ('pending', '待确认'),
            ('confirmed', '已确认'),
            ('cancelled', '已取消'),
            ('expired', '已过期'),
        ],
        default='pending',
        db_index=True
    )

    # 时间相关
    confirmed_at = models.DateTimeField('确认时间', null=True, blank=True)
    expires_at = models.DateTimeField('过期时间', null=True, blank=True)

    # 绑定上下文信息
    bind_context = models.JSONField('绑定上下文', default=dict, blank=True)

    class Meta:
        db_table = 'social_accounts_social_auth_binding'
        verbose_name = '社交账号绑定'
        verbose_name_plural = '社交账号绑定'
        unique_together = ['user', 'provider', 'social_uid']
        indexes = [
            models.Index(fields=['confirmation_token']),
            models.Index(fields=['status', 'expires_at']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_provider_display()} 绑定 ({self.status})"


class SocialLoginAttempt(BaseModel):
    """社交登录尝试记录"""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='social_login_attempts',
        null=True,
        blank=True,
        verbose_name='用户'
    )

    provider = models.CharField(
        '社交平台',
        max_length=50,
        choices=SocialAccount.PROVIDER_CHOICES,
        db_index=True
    )

    # 请求信息
    ip_address = models.GenericIPAddressField('IP地址', null=True, blank=True)
    user_agent = models.TextField('用户代理', blank=True)

    # 登录结果
    status = models.CharField(
        '登录状态',
        max_length=20,
        choices=[
            ('success', '成功'),
            ('failed', '失败'),
            ('pending', '进行中'),
            ('cancelled', '已取消'),
        ],
        default='pending',
        db_index=True
    )

    # 错误信息
    error_code = models.CharField('错误代码', max_length=50, blank=True)
    error_message = models.TextField('错误信息', blank=True)

    # 社交账号信息（用于创建新账号时）
    social_info = models.JSONField('社交账号信息', default=dict, blank=True)

    # 处理时间
    started_at = models.DateTimeField('开始时间', auto_now_add=True)
    completed_at = models.DateTimeField('完成时间', null=True, blank=True)

    class Meta:
        db_table = 'social_accounts_social_login_attempt'
        verbose_name = '社交登录尝试'
        verbose_name_plural = '社交登录尝试'
        indexes = [
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['ip_address', 'status']),
            models.Index(fields=['started_at']),
        ]

    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - {self.get_provider_display()} ({self.status})"


class SocialUserRegistration(BaseModel):
    """通过社交登录的用户注册信息"""

    social_account = models.OneToOneField(
        SocialAccount,
        on_delete=models.CASCADE,
        related_name='registration_info',
        verbose_name='社交账号'
    )

    # 用户选择的角色
    selected_user_type = models.CharField(
        '选择用户类型',
        max_length=20,
        choices=[
            ('client', '客户'),
            ('freelancer', '自由职业者'),
        ],
        default='client',
        db_index=True
    )

    # 注册流程状态
    registration_status = models.CharField(
        '注册状态',
        max_length=20,
        choices=[
            ('social_login', '社交登录完成'),
            ('profile_incomplete', '资料不完整'),
            ('phone_required', '需要手机验证'),
            ('email_required', '需要邮箱验证'),
            ('completed', '注册完成'),
            ('suspended', '已暂停'),
        ],
        default='social_login',
        db_index=True
    )

    # 必填字段收集状态
    email_collected = models.BooleanField('邮箱已收集', default=False)
    phone_collected = models.BooleanField('手机已收集', default=False)
    nickname_collected = models.BooleanField('昵称已收集', default=False)

    # 邮箱和手机（用户后续提供）
    provided_email = models.EmailField('提供的邮箱', blank=True)
    provided_phone = models.CharField('提供的手机', max_length=11, blank=True)

    # 注册步骤
    current_step = models.IntegerField('当前步骤', default=1, db_index=True)
    total_steps = models.IntegerField('总步骤', default=4)

    # 完成时间
    registration_completed_at = models.DateTimeField('注册完成时间', null=True, blank=True)

    class Meta:
        db_table = 'social_accounts_social_user_registration'
        verbose_name = '社交用户注册'
        verbose_name_plural = '社交用户注册'
        indexes = [
            models.Index(fields=['registration_status', 'current_step']),
            models.Index(fields=['selected_user_type']),
            models.Index(fields=['registration_completed_at']),
        ]

    def __str__(self):
        return f"{self.social_account.user.username} - {self.registration_status}"


class WeChatUserInfo(BaseModel):
    """微信用户详细信息"""

    social_account = models.OneToOneField(
        SocialAccount,
        on_delete=models.CASCADE,
        related_name='wechat_info',
        verbose_name='社交账号'
    )

    # 微信个人信息
    nickname = models.CharField('微信昵称', max_length=100, blank=True)
    avatar_url = models.URLField('微信头像', blank=True)
    gender = models.IntegerField('性别', choices=[(1, '男'), (2, '女')], null=True, blank=True)
    language = models.CharField('语言', max_length=20, blank=True)
    city = models.CharField('城市', max_length=50, blank=True)
    province = models.CharField('省份', max_length=50, blank=True)
    country = models.CharField('国家', max_length=50, blank=True)

    # 微信特权信息
    privilege = models.JSONField('特权信息', default=list, blank=True)

    # 订阅信息
    subscribe_time = models.DateTimeField('订阅时间', null=True, blank=True)
    subscribe_scene = models.CharField('订阅场景', max_length=50, blank=True)
    qr_scene = models.IntegerField('二维码场景', null=True, blank=True)
    qr_scene_str = models.CharField('二维码场景字符串', max_length=64, blank=True)

    # 用户标签
    groupid = models.IntegerField('用户分组ID', null=True, blank=True)
    tagid_list = models.JSONField('用户标签列表', default=list, blank=True)

    # 备注信息
    remark = models.CharField('备注名', max_length=30, blank=True)

    # 实时位置信息（需要用户授权）
    latitude = models.DecimalField('纬度', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('经度', max_digits=9, decimal_places=6, null=True, blank=True)
    location_precision = models.FloatField('位置精度', null=True, blank=True)

    class Meta:
        db_table = 'social_accounts_wechat_user_info'
        verbose_name = '微信用户信息'
        verbose_name_plural = '微信用户信息'
        indexes = [
            models.Index(fields=['city', 'province']),
            models.Index(fields=['subscribe_time']),
            models.Index(fields=['groupid']),
        ]

    def __str__(self):
        return f"{self.nickname or self.social_account.uid} - 微信用户"


class QQUserInfo(BaseModel):
    """QQ用户详细信息"""

    social_account = models.OneToOneField(
        SocialAccount,
        on_delete=models.CASCADE,
        related_name='qq_info',
        verbose_name='社交账号'
    )

    # QQ个人信息
    nickname = models.CharField('QQ昵称', max_length=100, blank=True)
    avatar_url = models.URLField('QQ头像', blank=True)
    gender = models.CharField('性别', max_length=10, blank=True)
    province = models.CharField('省份', max_length=50, blank=True)
    city = models.CharField('城市', max_length=50, blank=True)
    year = models.CharField('出生年份', max_length=4, blank=True)

    # QQ会员信息
    is_vip = models.BooleanField('是否VIP', default=False)
    vip_level = models.IntegerField('VIP等级', default=0)

    # 黄钻信息
    is_yellow_vip = models.BooleanField('是否黄钻', default=False)
    yellow_vip_level = models.IntegerField('黄钻等级', default=0)

    # 靓号信息
    is_yellow_year_vip = models.BooleanField('是否年费黄钻', default=False)

    class Meta:
        db_table = 'social_accounts_qq_user_info'
        verbose_name = 'QQ用户信息'
        verbose_name_plural = 'QQ用户信息'
        indexes = [
            models.Index(fields=['province', 'city']),
            models.Index(fields=['is_vip', 'vip_level']),
            models.Index(fields=['is_yellow_vip', 'yellow_vip_level']),
        ]

    def __str__(self):
        return f"{self.nickname or self.social_account.uid} - QQ用户"
