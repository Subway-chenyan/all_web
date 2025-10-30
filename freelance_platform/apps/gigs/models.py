from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.common.models import BaseModel
from apps.accounts.models import User
from django.urls import reverse


class Category(BaseModel):
    """Service categories for gigs"""

    name = models.CharField('名称', max_length=100, unique=True, db_index=True)
    description = models.TextField('描述', blank=True)
    icon = models.CharField('图标', max_length=50, blank=True)  # Icon class name
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name='父分类')

    # Category settings
    is_active = models.BooleanField('是否活跃', default=True, db_index=True)
    sort_order = models.PositiveIntegerField('排序', default=0)

    class Meta:
        db_table = 'gigs_category'
        ordering = ['sort_order', 'name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['parent', 'is_active']),
        ]
        verbose_name = '分类'
        verbose_name_plural = '分类'

    def __str__(self):
        return self.name

    @property
    def is_parent(self):
        return self.parent is None

    def get_children(self):
        return self.children.filter(is_active=True)


class Gig(BaseModel):
    """Main gig/service model"""

    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('active', '活跃'),
        ('paused', '暂停'),
        ('rejected', '被拒绝'),
        ('suspended', '被暂停'),
    ]

    # Basic Information
    title = models.CharField('标题', max_length=200, db_index=True)
    description = models.TextField('描述')
    freelancer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='gigs',
        limit_choices_to={'user_type': 'freelancer'},
        verbose_name='自由职业者'
    )
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='gigs', verbose_name='分类')

    # Status and visibility
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    is_featured = models.BooleanField('是否推荐', default=False, db_index=True)
    is_premium = models.BooleanField('是否高级', default=False, db_index=True)

    # Search and discovery
    tags = models.TextField('标签', help_text="搜索用逗号分隔的标签")
    searchable_text = models.TextField('搜索文本', db_index=True)  # For full-text search

    # Media
    thumbnail = models.ImageField('缩略图', upload_to='gigs/thumbnails/', null=True, blank=True)
    gallery_images = models.JSONField('画廊图片', default=list, blank=True)  # Array of image URLs

    # Statistics
    view_count = models.PositiveIntegerField('浏览次数', default=0, db_index=True)
    order_count = models.PositiveIntegerField('订单次数', default=0, db_index=True)
    favorite_count = models.PositiveIntegerField('收藏次数', default=0, db_index=True)

    # Rating
    average_rating = models.DecimalField(
        '平均评分',
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    review_count = models.PositiveIntegerField('评价次数', default=0)

    # SEO
    slug = models.SlugField('URL别名', max_length=200, unique=True, db_index=True)
    meta_description = models.CharField('SEO描述', max_length=160, blank=True)

    class Meta:
        db_table = 'gigs_gig'
        ordering = ['-is_featured', '-created_at']
        indexes = [
            models.Index(fields=['freelancer', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['average_rating', 'review_count']),
            models.Index(fields=['view_count']),
            models.Index(fields=['order_count']),
        ]
        verbose_name = '服务'
        verbose_name_plural = '服务'

    def __str__(self):
        return f"{self.title} by {self.freelancer.username}"

    def get_absolute_url(self):
        return reverse('gigs:detail', kwargs={'slug': self.slug})

    def update_rating(self):
        """Update average rating from reviews"""
        from apps.reviews.models import Review
        reviews = Review.objects.filter(gig=self, is_visible=True)
        if reviews.exists():
            self.average_rating = reviews.aggregate(
                avg_rating=models.Avg('rating')
            )['avg_rating']
            self.review_count = reviews.count()
        else:
            self.average_rating = 0
            self.review_count = 0
        self.save(update_fields=['average_rating', 'review_count'])


class GigPackage(BaseModel):
    """Gig packages (Basic, Standard, Premium)"""

    PACKAGE_TYPES = [
        ('basic', '基础'),
        ('standard', '标准'),
        ('premium', '高级'),
    ]

    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='packages', verbose_name='服务')
    package_type = models.CharField('套餐类型', max_length=20, choices=PACKAGE_TYPES, db_index=True)
    title = models.CharField('标题', max_length=100)
    description = models.TextField('描述')

    # Pricing
    price = models.DecimalField(
        '价格',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        db_index=True
    )

    # Delivery
    delivery_days = models.PositiveIntegerField('交付天数', validators=[MinValueValidator(1)], db_index=True)
    revisions = models.IntegerField('修改次数', default=0, validators=[MinValueValidator(0)])

    # Features
    features = models.JSONField('功能特点', default=list, blank=True)  # Array of feature strings

    class Meta:
        db_table = 'gigs_gig_package'
        unique_together = ['gig', 'package_type']
        ordering = ['price']
        indexes = [
            models.Index(fields=['gig', 'package_type']),
            models.Index(fields=['price']),
            models.Index(fields=['delivery_days']),
        ]
        verbose_name = '服务套餐'
        verbose_name_plural = '服务套餐'

    def __str__(self):
        return f"{self.gig.title} - {self.get_package_type_display()}"


class GigRequirement(BaseModel):
    """Requirements that clients need to provide"""

    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='requirements', verbose_name='服务')
    requirement_text = models.TextField('需求文本')
    is_required = models.BooleanField('是否必需', default=True)
    input_type = models.CharField(
        '输入类型',
        max_length=20,
        choices=[
            ('text', '文本'),
            ('textarea', '多行文本'),
            ('file', '文件'),
            ('checkbox', '复选框'),
            ('number', '数字'),
        ],
        default='text'
    )
    options = models.JSONField('选项', default=list, blank=True)  # For select/multiple choice
    sort_order = models.PositiveIntegerField('排序', default=0)

    class Meta:
        db_table = 'gigs_gig_requirement'
        ordering = ['sort_order', 'id']
        indexes = [
            models.Index(fields=['gig', 'sort_order']),
        ]
        verbose_name = '服务需求'
        verbose_name_plural = '服务需求'

    def __str__(self):
        return f"Requirement for {self.gig.title}"


class GigFAQ(BaseModel):
    """FAQ section for gigs"""

    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='faqs', verbose_name='服务')
    question = models.TextField('问题')
    answer = models.TextField('答案')
    sort_order = models.PositiveIntegerField('排序', default=0)

    class Meta:
        db_table = 'gigs_gig_faq'
        ordering = ['sort_order', 'id']
        indexes = [
            models.Index(fields=['gig', 'sort_order']),
        ]
        verbose_name = '服务常见问题'
        verbose_name_plural = '服务常见问题'

    def __str__(self):
        return f"FAQ for {self.gig.title}"


class GigExtra(BaseModel):
    """Additional services/extras for gigs"""

    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='extras', verbose_name='服务')
    title = models.CharField('标题', max_length=100)
    description = models.TextField('描述', blank=True)
    price = models.DecimalField(
        '价格',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    delivery_days = models.PositiveIntegerField('交付天数', validators=[MinValueValidator(0)], default=0)

    class Meta:
        db_table = 'gigs_gig_extra'
        ordering = ['price']
        indexes = [
            models.Index(fields=['gig', 'price']),
        ]
        verbose_name = '服务附加项'
        verbose_name_plural = '服务附加项'

    def __str__(self):
        return f"Extra for {self.gig.title}: {self.title}"


class GigFavorite(BaseModel):
    """Users who favorited a gig"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_gigs', verbose_name='用户')
    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='favorited_by', verbose_name='服务')

    class Meta:
        db_table = 'gigs_gig_favorite'
        unique_together = ['user', 'gig']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['gig']),
        ]
        verbose_name = '服务收藏'
        verbose_name_plural = '服务收藏'

    def __str__(self):
        return f"{self.user.username} favorited {self.gig.title}"


class GigView(BaseModel):
    """Track gig views for analytics"""

    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='views', verbose_name='服务')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='用户')
    ip_address = models.GenericIPAddressField('IP地址')
    user_agent = models.TextField('用户代理', blank=True)

    class Meta:
        db_table = 'gigs_gig_view'
        indexes = [
            models.Index(fields=['gig', 'created_at']),
            models.Index(fields=['user']),
            models.Index(fields=['ip_address']),
        ]
        verbose_name = '服务浏览记录'
        verbose_name_plural = '服务浏览记录'

    def __str__(self):
        return f"View of {self.gig.title}"


class GigStat(BaseModel):
    """Daily statistics for gigs"""

    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='stats', verbose_name='服务')
    date = models.DateField('日期', db_index=True)

    # Daily metrics
    views = models.PositiveIntegerField('浏览次数', default=0)
    unique_views = models.PositiveIntegerField('独立浏览次数', default=0)
    clicks = models.PositiveIntegerField('点击次数', default=0)
    orders = models.PositiveIntegerField('订单数', default=0)
    revenue = models.DecimalField('收入', max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'gigs_gig_stat'
        unique_together = ['gig', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['gig', 'date']),
            models.Index(fields=['date']),
        ]
        verbose_name = '服务统计'
        verbose_name_plural = '服务统计'

    def __str__(self):
        return f"Stats for {self.gig.title} on {self.date}"


class GigSearchHistory(BaseModel):
    """Track search queries for analytics and optimization"""

    query = models.CharField('搜索查询', max_length=200, db_index=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='用户')
    ip_address = models.GenericIPAddressField('IP地址')
    results_count = models.PositiveIntegerField('结果数量', default=0)
    filters_applied = models.JSONField('应用的筛选', default=dict, blank=True)

    class Meta:
        db_table = 'gigs_gig_search_history'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['query']),
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = '服务搜索历史'
        verbose_name_plural = '服务搜索历史'

    def __str__(self):
        return f"Search: {self.query}"


class GigReport(BaseModel):
    """Report inappropriate gigs"""

    REPORT_REASONS = [
        ('spam', '垃圾或误导内容'),
        ('inappropriate', '不当内容'),
        ('copyright', '版权侵犯'),
        ('fraud', '欺诈或骗局'),
        ('other', '其他'),
    ]

    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name='reports', verbose_name='服务')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_gigs', verbose_name='举报者')
    reason = models.CharField('举报原因', max_length=50, choices=REPORT_REASONS)
    description = models.TextField('描述')

    # Admin response
    status = models.CharField(
        '状态',
        max_length=20,
        choices=[
            ('pending', '待处理'),
            ('reviewed', '已审核'),
            ('resolved', '已解决'),
            ('dismissed', '已驳回'),
        ],
        default='pending',
        db_index=True
    )
    admin_notes = models.TextField('管理员备注', blank=True)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_gig_reports',
        verbose_name='审核者'
    )

    class Meta:
        db_table = 'gigs_gig_report'
        indexes = [
            models.Index(fields=['gig', 'status']),
            models.Index(fields=['reporter']),
            models.Index(fields=['status', 'created_at']),
        ]
        verbose_name = '服务报告'
        verbose_name_plural = '服务报告'

    def __str__(self):
        return f"Report on {self.gig.title}: {self.reason}"