from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.common.models import BaseModel, chinese_phone_validator, wechat_id_validator, PROVINCE_CHOICES
import uuid


class User(AbstractUser, BaseModel):
    """Extended User model for freelance platform"""

    USER_TYPE_CHOICES = [
        ('client', '客户'),
        ('freelancer', '自由职业者'),
        ('admin', '管理员'),
    ]

    USER_STATUS_CHOICES = [
        ('active', '活跃'),
        ('inactive', '非活跃'),
        ('suspended', '已暂停'),
        ('pending_verification', '待验证'),
    ]

    # Basic Information
    email = models.EmailField('邮箱', unique=True, db_index=True)
    user_type = models.CharField('用户类型', max_length=20, choices=USER_TYPE_CHOICES, db_index=True)
    user_status = models.CharField('用户状态', max_length=30, choices=USER_STATUS_CHOICES, default='active', db_index=True)

    # Chinese Market Specific Fields
    phone_number = models.CharField(
        '手机号码',
        max_length=11,
        validators=[chinese_phone_validator],
        unique=True,
        null=True,
        blank=True,
        db_index=True
    )
    wechat_id = models.CharField(
        '微信号',
        max_length=50,
        validators=[wechat_id_validator],
        unique=True,
        null=True,
        blank=True,
        db_index=True
    )

    # Verification
    is_email_verified = models.BooleanField('邮箱已验证', default=False, db_index=True)
    is_phone_verified = models.BooleanField('手机已验证', default=False, db_index=True)
    is_identity_verified = models.BooleanField('身份已验证', default=False, db_index=True)

    # Profile Completion
    profile_completion_percentage = models.IntegerField(
        '资料完成度',
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        db_index=True
    )

    # Last Activity Tracking
    last_login_ip = models.GenericIPAddressField('最后登录IP', null=True, blank=True)
    last_login_location = models.CharField('最后登录位置', max_length=100, null=True, blank=True)

    # Email preferences
    email_notifications_enabled = models.BooleanField('邮件通知启用', default=True)
    marketing_emails_enabled = models.BooleanField('营销邮件启用', default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'accounts_user'
        verbose_name = '用户'
        verbose_name_plural = '用户'
        indexes = [
            models.Index(fields=['user_type', 'user_status']),
            models.Index(fields=['created_at', 'user_status']),
            models.Index(fields=['email', 'user_type']),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class UserProfile(BaseModel):
    """Extended user profile information"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name='用户')

    # Personal Information
    first_name = models.CharField('名字', max_length=50, blank=True)
    last_name = models.CharField('姓氏', max_length=50, blank=True)
    bio = models.TextField('个人简介', max_length=2000, blank=True)
    avatar = models.ImageField('头像', upload_to='avatars/', null=True, blank=True)

    # Location Information
    country = models.CharField('国家', max_length=50, default='China')
    province = models.CharField('省份', max_length=50, choices=PROVINCE_CHOICES, blank=True)
    city = models.CharField('城市', max_length=100, blank=True)
    address = models.CharField('地址', max_length=500, blank=True)
    postal_code = models.CharField('邮政编码', max_length=20, blank=True)

    # Language and Timezone
    preferred_language = models.CharField('首选语言', max_length=10, default='zh-hans')
    timezone = models.CharField('时区', max_length=50, default='Asia/Shanghai')

    # Freelancer Specific Fields
    hourly_rate = models.DecimalField(
        '时薪',
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    years_of_experience = models.IntegerField(
        '工作经验年限',
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )

    # Company Information (for business accounts)
    company_name = models.CharField('公司名称', max_length=200, blank=True)
    company_registration_number = models.CharField('公司注册号', max_length=100, blank=True)
    company_website = models.URLField('公司网站', blank=True)

    # Social Links
    linkedin_url = models.URLField('LinkedIn链接', blank=True)
    github_url = models.URLField('GitHub链接', blank=True)
    portfolio_url = models.URLField('作品集链接', blank=True)

    # Settings
    profile_visibility = models.CharField(
        '资料可见性',
        max_length=20,
        choices=[
            ('public', '公开'),
            ('private', '私有'),
            ('unlisted', '不公开'),
        ],
        default='public'
    )

    class Meta:
        db_table = 'accounts_user_profile'
        verbose_name = '用户资料'
        verbose_name_plural = '用户资料'
        indexes = [
            models.Index(fields=['user', 'profile_visibility']),
            models.Index(fields=['province', 'city']),
            models.Index(fields=['hourly_rate']),
        ]

    def __str__(self):
        return f"{self.user.username} Profile"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.user.username


class Skill(BaseModel):
    """Skills model for freelancers"""

    name = models.CharField('技能名称', max_length=100, unique=True, db_index=True)
    description = models.TextField('技能描述', blank=True)
    category = models.CharField('技能分类', max_length=50, db_index=True)

    class Meta:
        db_table = 'accounts_skill'
        verbose_name = '技能'
        verbose_name_plural = '技能'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.name


class UserSkill(BaseModel):
    """Many-to-many relationship between users and skills"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_skills', verbose_name='用户')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='skill_users', verbose_name='技能')

    # Proficiency level (1-5)
    proficiency_level = models.IntegerField(
        '熟练程度',
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=3,
        db_index=True
    )

    # Years of experience with this skill
    years_experience = models.DecimalField(
        '经验年限',
        max_digits=4,
        decimal_places=1,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'accounts_user_skill'
        verbose_name = '用户技能'
        verbose_name_plural = '用户技能'
        unique_together = ['user', 'skill']
        indexes = [
            models.Index(fields=['skill', 'proficiency_level']),
            models.Index(fields=['user', 'proficiency_level']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.proficiency_level}/5)"


class Education(BaseModel):
    """Education information for users"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='educations', verbose_name='用户')

    institution_name = models.CharField('学校名称', max_length=200, db_index=True)
    degree = models.CharField('学位', max_length=100, db_index=True)
    field_of_study = models.CharField('专业', max_length=100)
    start_date = models.DateField('开始时间')
    end_date = models.DateField('结束时间', null=True, blank=True)
    is_current = models.BooleanField('当前在读', default=False, db_index=True)
    gpa = models.DecimalField('GPA', max_digits=3, decimal_places=2, null=True, blank=True)
    description = models.TextField('描述', blank=True)

    class Meta:
        db_table = 'accounts_education'
        verbose_name = '教育经历'
        verbose_name_plural = '教育经历'
        ordering = ['-is_current', '-end_date']
        indexes = [
            models.Index(fields=['user', 'is_current']),
            models.Index(fields=['institution_name']),
            models.Index(fields=['degree']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.institution_name}"


class WorkExperience(BaseModel):
    """Work experience for users"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='work_experiences')

    company_name = models.CharField(max_length=200, db_index=True)
    job_title = models.CharField(max_length=100, db_index=True)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False, db_index=True)

    # Location
    company_location = models.CharField(max_length=200, blank=True)

    # Skills used in this job
    skills_used = models.ManyToManyField(Skill, blank=True)

    class Meta:
        db_table = 'accounts_work_experience'
        ordering = ['-is_current', '-end_date']
        indexes = [
            models.Index(fields=['user', 'is_current']),
            models.Index(fields=['company_name']),
            models.Index(fields=['job_title']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.job_title} at {self.company_name}"


class Portfolio(BaseModel):
    """Portfolio items for freelancers"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')

    title = models.CharField(max_length=200, db_index=True)
    description = models.TextField()

    # Media files
    image = models.ImageField(upload_to='portfolio/images/', null=True, blank=True)
    file = models.FileField(upload_to='portfolio/files/', null=True, blank=True)
    url = models.URLField(blank=True)

    # Project details
    project_url = models.URLField(blank=True)
    completion_date = models.DateField(null=True, blank=True)
    technologies_used = models.TextField(help_text="Comma-separated list of technologies")

    # Visibility
    is_featured = models.BooleanField(default=False, db_index=True)
    is_public = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'accounts_portfolio'
        ordering = ['-is_featured', '-created_at']
        indexes = [
            models.Index(fields=['user', 'is_featured']),
            models.Index(fields=['user', 'is_public']),
            models.Index(fields=['title']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class UserVerification(BaseModel):
    """User verification documents"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification')

    # Identity Verification
    identity_document_type = models.CharField(
        max_length=50,
        choices=[
            ('national_id', 'National ID'),
            ('passport', 'Passport'),
            ('driving_license', 'Driving License'),
        ],
        blank=True
    )
    identity_document_front = models.ImageField(upload_to='verification/identity/', null=True, blank=True)
    identity_document_back = models.ImageField(upload_to='verification/identity/', null=True, blank=True)

    # Verification Status
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('expired', 'Expired'),
        ],
        default='pending',
        db_index=True
    )

    # Admin Notes
    admin_notes = models.TextField(blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_users'
    )

    class Meta:
        db_table = 'accounts_user_verification'
        indexes = [
            models.Index(fields=['verification_status']),
            models.Index(fields=['verified_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.verification_status}"


class UserActivityLog(BaseModel):
    """Track user activities for analytics and security"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')

    activity_type = models.CharField(
        max_length=50,
        choices=[
            ('login', 'Login'),
            ('logout', 'Logout'),
            ('profile_update', 'Profile Update'),
            ('gig_created', 'Gig Created'),
            ('order_created', 'Order Created'),
            ('payment_made', 'Payment Made'),
            ('review_given', 'Review Given'),
            ('password_change', 'Password Change'),
            ('email_change', 'Email Change'),
        ],
        db_index=True
    )

    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Additional data stored as JSON
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'accounts_user_activity_log'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'activity_type']),
            models.Index(fields=['activity_type', 'created_at']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} at {self.created_at}"