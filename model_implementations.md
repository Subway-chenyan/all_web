# Django Model Implementations for Chinese Freelance Marketplace

## 1. Users App Models

### apps/users/models.py
```python
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
import uuid
import os

def get_profile_image_path(instance, filename):
    """Generate path for profile images"""
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('profiles', filename)

class User(AbstractUser):
    """Extended User model with additional fields"""
    USER_TYPE_CHOICES = [
        ('client', _('客户')),
        ('freelancer', _('自由职业者')),
        ('admin', _('管理员')),
    ]

    VERIFICATION_STATUS_CHOICES = [
        ('pending', _('待验证')),
        ('verified', _('已验证')),
        ('rejected', _('已拒绝')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('邮箱地址'), unique=True)
    user_type = models.CharField(
        _('用户类型'),
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='client'
    )
    phone = models.CharField(_('手机号码'), max_length=20, blank=True)
    verification_status = models.CharField(
        _('验证状态'),
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='pending'
    )
    is_verified = models.BooleanField(_('是否已验证'), default=False)
    date_of_birth = models.DateField(_('出生日期'), null=True, blank=True)
    bio = models.TextField(_('个人简介'), max_length=500, blank=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        verbose_name = _('用户')
        verbose_name_plural = _('用户')
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def is_freelancer(self):
        return self.user_type == 'freelancer'

    @property
    def is_client(self):
        return self.user_type == 'client'

class UserProfile(models.Model):
    """Extended user profile information"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('用户')
    )
    profile_image = models.ImageField(
        _('头像'),
        upload_to=get_profile_image_path,
        blank=True,
        null=True
    )
    location = models.CharField(_('所在地区'), max_length=100, blank=True)
    language = models.CharField(_('语言'), max_length=50, default='zh-cn')
    timezone = models.CharField(_('时区'), max_length=50, default='Asia/Shanghai')
    website = models.URLField(_('个人网站'), blank=True)
    linkedin_url = models.URLField(_('LinkedIn'), blank=True)
    wechat_id = models.CharField(_('微信号'), max_length=50, blank=True)
    response_rate = models.DecimalField(
        _('回复率'),
        max_digits=5,
        decimal_places=2,
        default=0.00
    )
    response_time = models.IntegerField(
        _('平均回复时间(小时)'),
        default=24
    )
    profile_completion = models.IntegerField(
        _('资料完成度'),
        default=0
    )

    class Meta:
        db_table = 'user_profiles'
        verbose_name = _('用户资料')
        verbose_name_plural = _('用户资料')

    def __str__(self):
        return f'{self.user.email} - Profile'

    def calculate_completion(self):
        """Calculate profile completion percentage"""
        fields_to_check = [
            self.profile_image,
            self.location,
            self.user.bio,
            self.user.phone,
            self.wechat_id,
            self.website
        ]
        completed_fields = sum(1 for field in fields_to_check if field)
        self.profile_completion = int((completed_fields / len(fields_to_check)) * 100)
        self.save(update_fields=['profile_completion'])
        return self.profile_completion

class Skill(models.Model):
    """User skills for freelancers"""
    name = models.CharField(_('技能名称'), max_length=100, unique=True)
    description = models.TextField(_('技能描述'), blank=True)
    category = models.CharField(_('技能分类'), max_length=50)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        db_table = 'skills'
        verbose_name = _('技能')
        verbose_name_plural = _('技能')
        ordering = ['name']

    def __str__(self):
        return self.name

class UserSkill(models.Model):
    """Many-to-many relationship between users and skills"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_skills'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='skill_users'
    )
    proficiency_level = models.IntegerField(
        _('熟练程度'),
        choices=[
            (1, _('初级')),
            (2, _('中级')),
            (3, _('高级')),
            (4, _('专家')),
        ],
        default=2
    )
    years_of_experience = models.IntegerField(_('经验年限'), default=0)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        db_table = 'user_skills'
        unique_together = ['user', 'skill']
        verbose_name = _('用户技能')
        verbose_name_plural = _('用户技能')

    def __str__(self):
        return f'{self.user.email} - {self.skill.name}'

def get_portfolio_image_path(instance, filename):
    """Generate path for portfolio images"""
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('portfolios', str(instance.user.id), filename)

class Portfolio(models.Model):
    """User portfolio items"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='portfolios'
    )
    title = models.CharField(_('作品标题'), max_length=200)
    description = models.TextField(_('作品描述'))
    image = models.ImageField(
        _('作品图片'),
        upload_to=get_portfolio_image_path
    )
    project_url = models.URLField(_('项目链接'), blank=True)
    tags = models.CharField(_('标签'), max_length=200, blank=True)
    is_featured = models.BooleanField(_('是否精选'), default=False)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    class Meta:
        db_table = 'portfolios'
        verbose_name = _('作品集')
        verbose_name_plural = _('作品集')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.title}'

class UserVerification(models.Model):
    """User verification documents"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='verification'
    )
    id_card_front = models.ImageField(
        _('身份证正面'),
        upload_to='verification/'
    )
    id_card_back = models.ImageField(
        _('身份证背面'),
        upload_to='verification/'
    )
    real_name = models.CharField(_('真实姓名'), max_length=100)
    id_number = models.CharField(_('身份证号'), max_length=20)
    status = models.CharField(
        _('验证状态'),
        max_length=20,
        choices=User.VERIFICATION_STATUS_CHOICES,
        default='pending'
    )
    rejection_reason = models.TextField(
        _('拒绝原因'),
        blank=True
    )
    submitted_at = models.DateTimeField(_('提交时间'), auto_now_add=True)
    reviewed_at = models.DateTimeField(_('审核时间'), null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_verifications'
    )

    class Meta:
        db_table = 'user_verifications'
        verbose_name = _('用户验证')
        verbose_name_plural = _('用户验证')

    def __str__(self):
        return f'{self.user.email} - {self.status}'
```

## 2. Gigs App Models

### apps/gigs/models.py
```python
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
import uuid
import os

def get_gig_image_path(instance, filename):
    """Generate path for gig images"""
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('gigs', str(instance.user.id), filename)

class GigCategory(models.Model):
    """Gig categories (hierarchical)"""
    name = models.CharField(_('分类名称'), max_length=100)
    slug = models.SlugField(_('分类链接'), unique=True)
    description = models.TextField(_('分类描述'), blank=True)
    icon = models.ImageField(_('分类图标'), upload_to='categories/', blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('父分类')
    )
    level = models.IntegerField(_('分类层级'), default=0)
    is_active = models.BooleanField(_('是否激活'), default=True)
    sort_order = models.IntegerField(_('排序'), default=0)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        db_table = 'gig_categories'
        verbose_name = _('服务分类')
        verbose_name_plural = _('服务分类')
        ordering = ['sort_order', 'name']
        unique_together = ['parent', 'slug']

    def __str__(self):
        return self.name

    @property
    def get_full_name(self):
        """Get full category name with parents"""
        if self.parent:
            return f'{self.parent.get_full_name} > {self.name}'
        return self.name

class Gig(models.Model):
    """Main gig model"""
    STATUS_CHOICES = [
        ('draft', _('草稿')),
        ('active', _('激活')),
        ('paused', _('暂停')),
        ('denied', _('拒绝')),
        ('archived', _('归档')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gigs',
        verbose_name=_('发布者')
    )
    title = models.CharField(_('服务标题'), max_length=200)
    slug = models.SlugField(_('服务链接'), unique=True)
    description = models.TextField(_('服务描述'))
    category = models.ForeignKey(
        GigCategory,
        on_delete=models.PROTECT,
        related_name='gigs',
        verbose_name=_('服务分类')
    )
    status = models.CharField(
        _('状态'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    total_orders = models.IntegerField(_('总订单数'), default=0)
    in_queue_orders = models.IntegerField(_('排队订单数'), default=0)
    average_rating = models.DecimalField(
        _('平均评分'),
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    review_count = models.IntegerField(_('评论数'), default=0)
    click_count = models.IntegerField(_('点击次数'), default=0)
    is_featured = models.BooleanField(_('是否精选'), default=False)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    class Meta:
        db_table = 'gigs'
        verbose_name = _('服务')
        verbose_name_plural = _('服务')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return self.title

    @property
    def main_package(self):
        """Get the main gig package"""
        return self.packages.filter(is_main=True).first() or self.packages.first()

    @property
    def starting_price(self):
        """Get the lowest package price"""
        cheapest_package = self.packages.order_by('price').first()
        return cheapest_package.price if cheapest_package else 0

    def update_stats(self):
        """Update gig statistics"""
        from apps.orders.models import Order
        from apps.reviews.models import Review

        # Update order stats
        self.total_orders = Order.objects.filter(
            gig=self,
            status='completed'
        ).count()
        self.in_queue_orders = Order.objects.filter(
            gig=self,
            status__in=['pending', 'in_progress']
        ).count()

        # Update rating stats
        reviews = Review.objects.filter(order__gig=self)
        self.review_count = reviews.count()
        if self.review_count > 0:
            self.average_rating = reviews.aggregate(
                avg_rating=models.Avg('rating')
            )['avg_rating']
        else:
            self.average_rating = 0.00

        self.save(update_fields=[
            'total_orders', 'in_queue_orders',
            'review_count', 'average_rating'
        ])

class GigPackage(models.Model):
    """Gig pricing packages"""
    PACKAGE_TYPE_CHOICES = [
        ('basic', _('基础版')),
        ('standard', _('标准版')),
        ('premium', _('高级版')),
        ('custom', _('定制版')),
    ]

    gig = models.ForeignKey(
        Gig,
        on_delete=models.CASCADE,
        related_name='packages',
        verbose_name=_('服务')
    )
    name = models.CharField(_('套餐名称'), max_length=100)
    package_type = models.CharField(
        _('套餐类型'),
        max_length=20,
        choices=PACKAGE_TYPE_CHOICES,
        default='basic'
    )
    description = models.TextField(_('套餐描述'))
    price = models.DecimalField(
        _('价格'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    delivery_days = models.IntegerField(
        _('交付天数'),
        validators=[MinValueValidator(1)]
    )
    revisions = models.IntegerField(_('修改次数'), default=1)
    features = models.JSONField(_('功能特性'), default=list)
    is_main = models.BooleanField(_('是否主套餐'), default=False)
    is_active = models.BooleanField(_('是否激活'), default=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        db_table = 'gig_packages'
        verbose_name = _('服务套餐')
        verbose_name_plural = _('服务套餐')
        ordering = ['price']
        unique_together = ['gig', 'package_type']

    def __str__(self):
        return f'{self.gig.title} - {self.name}'

class GigMedia(models.Model):
    """Gig media files (images, videos, PDFs)"""
    MEDIA_TYPE_CHOICES = [
        ('image', _('图片')),
        ('video', _('视频')),
        ('pdf', _('PDF文件')),
    ]

    gig = models.ForeignKey(
        Gig,
        on_delete=models.CASCADE,
        related_name='media',
        verbose_name=_('服务')
    )
    media_type = models.CharField(
        _('媒体类型'),
        max_length=20,
        choices=MEDIA_TYPE_CHOICES,
        default='image'
    )
    file = models.FileField(
        _('文件'),
        upload_to=get_gig_image_path
    )
    title = models.CharField(_('标题'), max_length=200, blank=True)
    description = models.TextField(_('描述'), blank=True)
    order = models.IntegerField(_('排序'), default=0)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        db_table = 'gig_media'
        verbose_name = _('服务媒体')
        verbose_name_plural = _('服务媒体')
        ordering = ['order', 'created_at']

    def __str__(self):
        return f'{self.gig.title} - {self.media_type}'

class GigRequirement(models.Model):
    """Requirements buyer needs to provide"""
    gig = models.ForeignKey(
        Gig,
        on_delete=models.CASCADE,
        related_name='requirements',
        verbose_name=_('服务')
    )
    question = models.TextField(_('问题'))
    is_required = models.BooleanField(_('是否必填'), default=True)
    answer_type = models.CharField(
        _('答案类型'),
        max_length=20,
        choices=[
            ('text', _('文本')),
            ('file', _('文件')),
            ('multiple_choice', _('多选')),
        ],
        default='text'
    )
    options = models.JSONField(_('选项'), default=list, blank=True)
    order = models.IntegerField(_('排序'), default=0)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        db_table = 'gig_requirements'
        verbose_name = _('服务要求')
        verbose_name_plural = _('服务要求')
        ordering = ['order', 'created_at']

    def __str__(self):
        return f'{self.gig.title} - {self.question[:50]}'

class GigTag(models.Model):
    """Gig tags for better search"""
    name = models.CharField(_('标签名称'), max_length=50, unique=True)
    slug = models.SlugField(_('标签链接'), unique=True)
    usage_count = models.IntegerField(_('使用次数'), default=0)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        db_table = 'gig_tags'
        verbose_name = _('服务标签')
        verbose_name_plural = _('服务标签')
        ordering = ['-usage_count', 'name']

    def __str__(self):
        return self.name

class GigTagRelation(models.Model):
    """Many-to-many relationship between gigs and tags"""
    gig = models.ForeignKey(
        Gig,
        on_delete=models.CASCADE,
        related_name='tag_relations'
    )
    tag = models.ForeignKey(
        GigTag,
        on_delete=models.CASCADE,
        related_name='gig_relations'
    )
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        db_table = 'gig_tag_relations'
        unique_together = ['gig', 'tag']
        verbose_name = _('服务标签关系')
        verbose_name_plural = _('服务标签关系')

    def __str__(self):
        return f'{self.gig.title} - {self.tag.name}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update tag usage count
        self.tag.usage_count = self.tag.gig_relations.count()
        self.tag.save(update_fields=['usage_count'])
```

## 3. Orders App Models

### apps/orders/models.py
```python
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
import uuid

class Order(models.Model):
    """Main order model"""
    STATUS_CHOICES = [
        ('pending', _('待付款')),
        ('paid', _('已付款')),
        ('in_progress', _('进行中')),
        ('delivered', _('已交付')),
        ('completed', _('已完成')),
        ('cancelled', _('已取消')),
        ('refunded', _('已退款')),
        ('disputed', _('纠纷中')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(_('订单号'), max_length=50, unique=True)
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='purchases',
        verbose_name=_('买家')
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sales',
        verbose_name=_('卖家')
    )
    gig = models.ForeignKey(
        'gigs.Gig',
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name=_('服务')
    )
    package = models.ForeignKey(
        'gigs.GigPackage',
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name=_('套餐')
    )
    status = models.CharField(
        _('状态'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    total_amount = models.DecimalField(
        _('总金额'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    service_fee = models.DecimalField(
        _('服务费'),
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    buyer_requirements = models.JSONField(
        _('买家要求'),
        default=dict,
        blank=True
    )
    seller_earnings = models.DecimalField(
        _('卖家收入'),
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    delivery_deadline = models.DateTimeField(_('交付截止时间'))
    actual_delivery_time = models.DateTimeField(
        _('实际交付时间'),
        null=True,
        blank=True
    )
    accepted_at = models.DateTimeField(_('接受时间'), null=True, blank=True)
    completed_at = models.DateTimeField(_('完成时间'), null=True, blank=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    class Meta:
        db_table = 'orders'
        verbose_name = _('订单')
        verbose_name_plural = _('订单')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['buyer', 'status']),
            models.Index(fields=['seller', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f'{self.order_number} - {self.buyer.email}'

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number
            import datetime
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            self.order_number = f'ORD{timestamp}{str(uuid.uuid4())[:8].upper()}'

        # Calculate service fee and seller earnings
        if self.total_amount and not self.service_fee:
            self.service_fee = self.total_amount * Decimal('0.20')  # 20% platform fee
            self.seller_earnings = self.total_amount - self.service_fee

        super().save(*args, **kwargs)

    @property
    def is_deliverable(self):
        """Check if order can be delivered"""
        return self.status in ['paid', 'in_progress']

    @property
    def is_overdue(self):
        """Check if order is overdue"""
        from django.utils import timezone
        return (
            self.status == 'in_progress' and
            self.delivery_deadline < timezone.now()
        )

    @property
    def days_remaining(self):
        """Calculate days remaining until deadline"""
        from django.utils import timezone
        if self.status in ['completed', 'cancelled', 'refunded']:
            return 0
        delta = self.delivery_deadline - timezone.now()
        return max(0, delta.days)

class OrderMilestone(models.Model):
    """Order milestones for complex projects"""
    STATUS_CHOICES = [
        ('pending', _('待处理')),
        ('in_progress', _('进行中')),
        ('completed', _('已完成')),
        ('cancelled', _('已取消')),
    ]

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='milestones',
        verbose_name=_('订单')
    )
    title = models.CharField(_('里程碑标题'), max_length=200)
    description = models.TextField(_('里程碑描述'))
    status = models.CharField(
        _('状态'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    amount = models.DecimalField(
        _('金额'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    due_date = models.DateTimeField(_('截止时间'))
    completed_at = models.DateTimeField(_('完成时间'), null=True, blank=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    class Meta:
        db_table = 'order_milestones'
        verbose_name = _('订单里程碑')
        verbose_name_plural = _('订单里程碑')
        ordering = ['due_date']

    def __str__(self):
        return f'{self.order.order_number} - {self.title}'

class Delivery(models.Model):
    """Order deliveries"""
    STATUS_CHOICES = [
        ('pending', _('待审核')),
        ('accepted', _('已接受')),
        ('rejected', _('已拒绝')),
        ('revision_requested', _('要求修改')),
    ]

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='deliveries',
        verbose_name=_('订单')
    )
    title = models.CharField(_('交付标题'), max_length=200)
    description = models.TextField(_('交付描述'))
    status = models.CharField(
        _('状态'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    seller_message = models.TextField(_('卖家留言'), blank=True)
    buyer_message = models.TextField(_('买家留言'), blank=True)
    revision_count = models.IntegerField(_('修改次数'), default=0)
    max_revisions = models.IntegerField(_('最大修改次数'), default=3)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    reviewed_at = models.DateTimeField(_('审核时间'), null=True, blank=True)

    class Meta:
        db_table = 'deliveries'
        verbose_name = _('交付')
        verbose_name_plural = _('交付')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.order.order_number} - Delivery {self.id}'

def get_delivery_file_path(instance, filename):
    """Generate path for delivery files"""
    import uuid
    import os
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('deliveries', str(instance.order.id), filename)

class DeliveryFile(models.Model):
    """Files attached to deliveries"""
    delivery = models.ForeignKey(
        Delivery,
        on_delete=models.CASCADE,
        related_name='files',
        verbose_name=_('交付')
    )
    file = models.FileField(
        _('文件'),
        upload_to=get_delivery_file_path
    )
    original_name = models.CharField(_('原始文件名'), max_length=255)
    file_size = models.IntegerField(_('文件大小'), default=0)
    file_type = models.CharField(_('文件类型'), max_length=50)
    description = models.TextField(_('文件描述'), blank=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        db_table = 'delivery_files'
        verbose_name = _('交付文件')
        verbose_name_plural = _('交付文件')

    def __str__(self):
        return f'{self.delivery.order.order_number} - {self.original_name}'

class Dispute(models.Model):
    """Order disputes"""
    STATUS_CHOICES = [
        ('opened', _('已开启')),
        ('investigating', _('调查中')),
        ('resolved', _('已解决')),
        ('escalated', _('已升级')),
        ('cancelled', _('已取消')),
    ]

    DISPUTE_TYPE_CHOICES = [
        ('quality', _('质量问题')),
        ('delivery', _('交付问题')),
        ('communication', _('沟通问题')),
        ('payment', _('支付问题')),
        ('other', _('其他问题')),
    ]

    RESOLUTION_CHOICES = [
        ('refund_buyer', _('退款给买家')),
        ('release_payment', _('释放给卖家')),
        ('partial_refund', _('部分退款')),
        ('service_credit', _('服务信用')),
        ('other', _('其他解决方案')),
    ]

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='dispute',
        verbose_name=_('订单')
    )
    raised_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='raised_disputes',
        verbose_name=_('发起人')
    )
    dispute_type = models.CharField(
        _('纠纷类型'),
        max_length=20,
        choices=DISPUTE_TYPE_CHOICES
    )
    reason = models.TextField(_('纠纷原因'))
    description = models.TextField(_('详细描述'))
    status = models.CharField(
        _('状态'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='opened'
    )
    resolution = models.CharField(
        _('解决方案'),
        max_length=20,
        choices=RESOLUTION_CHOICES,
        blank=True
    )
    resolution_amount = models.DecimalField(
        _('解决金额'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    admin_notes = models.TextField(_('管理员备注'), blank=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    resolved_at = models.DateTimeField(_('解决时间'), null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_disputes',
        verbose_name=_('解决人')
    )

    class Meta:
        db_table = 'disputes'
        verbose_name = _('纠纷')
        verbose_name_plural = _('纠纷')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.order.order_number} - {self.dispute_type}'
```

These model implementations provide a comprehensive foundation for the Chinese freelance marketplace with proper relationships, validation, and functionality.

Key features of these models:

1. **User System**: Multi-role users with profiles, skills, portfolios, and verification
2. **Gig Management**: Hierarchical categories, packages, media, and requirements
3. **Order System**: Complete order lifecycle with milestones, deliveries, and disputes
4. **Database Optimization**: Proper indexing, relationships, and constraints
5. **Chinese Localization**: All field labels and choices support Chinese
6. **File Management**: Proper file upload paths and organization
7. **Validation**: Input validation and business logic constraints
8. **Extensibility**: Designed for future feature additions

The models follow Django best practices and provide a solid foundation for building the REST API and business logic layers.