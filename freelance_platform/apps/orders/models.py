from django.db import models
from django.core.validators import MinValueValidator
from apps.common.models import BaseModel
from apps.accounts.models import User
from apps.gigs.models import Gig, GigPackage
from decimal import Decimal
from django.utils import timezone


class Order(BaseModel):
    """Main order model"""

    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid'),
        ('requirements_provided', 'Requirements Provided'),
        ('in_progress', 'In Progress'),
        ('delivered', 'Delivered'),
        ('revision_requested', 'Revision Requested'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
        ('disputed', 'Disputed'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('standard', 'Standard'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    # Basic Information
    order_number = models.CharField(max_length=20, unique=True, db_index=True)
    client = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='client_orders',
        limit_choices_to={'user_type': 'client'}
    )
    freelancer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='freelancer_orders',
        limit_choices_to={'user_type': 'freelancer'}
    )

    # Gig Information
    gig = models.ForeignKey(Gig, on_delete=models.PROTECT, related_name='orders')
    gig_package = models.ForeignKey(GigPackage, on_delete=models.PROTECT)

    # Order Details
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    client_requirements = models.TextField(blank=True)

    # Pricing
    base_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    extras_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    freelancer_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])

    # Status and Timeline
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending', db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='standard', db_index=True)

    # Delivery Timeline
    delivery_deadline = models.DateTimeField(db_index=True)
    estimated_delivery = models.DateTimeField(db_index=True)
    actual_delivery = models.DateTimeField(null=True, blank=True)

    # Communication Preferences
    preferred_communication_method = models.CharField(
        max_length=20,
        choices=[
            ('platform', 'Platform Messaging'),
            ('email', 'Email'),
            ('wechat', 'WeChat'),
        ],
        default='platform'
    )

    # Client Information (for this specific order)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=20, blank=True)

    # Cancellation/Refund
    cancellation_reason = models.TextField(blank=True)
    cancelled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_orders'
    )
    cancellation_date = models.DateTimeField(null=True, blank=True)

    # Metadata
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'orders_order'
        verbose_name = '订单'
        verbose_name_plural = '订单'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['freelancer', 'status']),
            models.Index(fields=['gig', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['delivery_deadline']),
            models.Index(fields=['estimated_delivery']),
            models.Index(fields=['total_price']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f"Order {self.order_number} - {self.client.username} → {self.freelancer.username}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)

    def generate_order_number(self):
        """Generate unique order number"""
        from django.utils import timezone
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        import random
        random_num = random.randint(1000, 9999)
        return f"ORD{timestamp}{random_num}"

    def update_status(self, new_status, user=None, notes=''):
        """Update order status with tracking"""
        from .models import OrderStatusHistory
        old_status = self.status
        self.status = new_status
        self.save(update_fields=['status', 'updated_at'])

        # Create status history record
        OrderStatusHistory.objects.create(
            order=self,
            old_status=old_status,
            new_status=new_status,
            changed_by=user,
            notes=notes
        )

    @property
    def is_overdue(self):
        """Check if order is overdue"""
        if self.status in ['completed', 'cancelled', 'refunded']:
            return False
        return timezone.now() > self.delivery_deadline

    @property
    def days_until_deadline(self):
        """Calculate days until deadline"""
        if self.actual_delivery:
            return 0
        delta = self.delivery_deadline - timezone.now()
        return max(0, delta.days)


class OrderStatusHistory(BaseModel):
    """Track order status changes"""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=30)
    new_status = models.CharField(max_length=30, db_index=True)
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='status_changes'
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'orders_order_status_history'
        verbose_name = '订单状态历史'
        verbose_name_plural = '订单状态历史'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order', 'created_at']),
            models.Index(fields=['new_status', 'created_at']),
        ]

    def __str__(self):
        return f"{self.order.order_number}: {self.old_status} → {self.new_status}"


class OrderExtra(BaseModel):
    """Additional extras selected for an order"""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_extras')
    gig_extra = models.ForeignKey('gigs.GigExtra', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    class Meta:
        db_table = 'orders_order_extra'
        verbose_name = '订单附加项'
        verbose_name_plural = '订单附加项'
        indexes = [
            models.Index(fields=['order']),
        ]

    def __str__(self):
        return f"Extra for {self.order.order_number}: {self.gig_extra.title}"


class OrderRequirement(BaseModel):
    """Client requirements for an order"""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='requirements')
    requirement_text = models.TextField()
    response = models.TextField(blank=True)
    is_provided = models.BooleanField(default=False, db_index=True)
    provided_at = models.DateTimeField(null=True, blank=True)

    # File attachments
    attachments = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'orders_order_requirement'
        verbose_name = '订单需求'
        verbose_name_plural = '订单需求'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['order', 'is_provided']),
        ]

    def __str__(self):
        return f"Requirement for {self.order.order_number}"


class Delivery(BaseModel):
    """Delivery files for orders"""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='deliveries')

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    message = models.TextField(blank=True)

    # Files
    files = models.JSONField(default=list, blank=True)  # Array of file information
    file_count = models.PositiveIntegerField(default=0)

    # Status
    is_final_delivery = models.BooleanField(default=False, db_index=True)
    is_accepted = models.BooleanField(null=True, blank=True)  # null=pending, true=accepted, false=rejected
    accepted_at = models.DateTimeField(null=True, blank=True)
    rejected_reason = models.TextField(blank=True)

    # Revision tracking
    revision_number = models.PositiveIntegerField(default=1)
    previous_delivery = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'orders_delivery'
        verbose_name = '交付'
        verbose_name_plural = '交付'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order', 'is_final_delivery']),
            models.Index(fields=['order', 'is_accepted']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Delivery {self.id} for {self.order.order_number}"


class OrderMessage(BaseModel):
    """Messages related to orders"""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='order_messages')
    message = models.TextField()

    # Attachments
    attachments = models.JSONField(default=list, blank=True)

    # Message type
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Text'),
            ('file', 'File'),
            ('image', 'Image'),
            ('delivery', 'Delivery'),
            ('system', 'System'),
        ],
        default='text',
        db_index=True
    )

    # Read status
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'orders_order_message'
        verbose_name = '订单消息'
        verbose_name_plural = '订单消息'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['order', 'created_at']),
            models.Index(fields=['sender']),
            models.Index(fields=['message_type']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f"Message for {self.order.order_number} by {self.sender.username}"


class OrderReview(BaseModel):
    """Review requests for completed orders"""

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review_request')
    client_review_submitted = models.BooleanField(default=False, db_index=True)
    freelancer_review_submitted = models.BooleanField(default=False, db_index=True)
    review_deadline = models.DateTimeField(db_index=True)
    reminder_sent = models.BooleanField(default=False, db_index=True)

    class Meta:
        db_table = 'orders_order_review'
        verbose_name = '订单评价邀请'
        verbose_name_plural = '订单评价邀请'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['client_review_submitted']),
            models.Index(fields=['freelancer_review_submitted']),
            models.Index(fields=['review_deadline']),
        ]

    def __str__(self):
        return f"Review request for {self.order.order_number}"


class OrderDispute(BaseModel):
    """Dispute resolution for orders"""

    DISPUTE_TYPES = [
        ('delivery', 'Delivery Issues'),
        ('quality', 'Quality Issues'),
        ('communication', 'Communication Issues'),
        ('payment', 'Payment Issues'),
        ('other', 'Other Issues'),
    ]

    DISPUTE_STATUS = [
        ('open', 'Open'),
        ('investigating', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('escalated', 'Escalated'),
        ('closed', 'Closed'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='dispute')
    raised_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='raised_disputes')
    dispute_type = models.CharField(max_length=30, choices=DISPUTE_TYPES, db_index=True)
    description = models.TextField()
    evidence = models.JSONField(default=list, blank=True)  # Array of evidence files/links

    # Resolution
    status = models.CharField(max_length=20, choices=DISPUTE_STATUS, default='open', db_index=True)
    resolution = models.TextField(blank=True)
    resolution_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_disputes'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    # Admin notes
    admin_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'orders_order_dispute'
        verbose_name = '订单纠纷'
        verbose_name_plural = '订单纠纷'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['raised_by']),
            models.Index(fields=['status']),
            models.Index(fields=['dispute_type', 'status']),
        ]

    def __str__(self):
        return f"Dispute for {self.order.order_number}: {self.dispute_type}"


class OrderStat(BaseModel):
    """Daily order statistics"""

    date = models.DateField(db_index=True)
    total_orders = models.PositiveIntegerField(default=0)
    completed_orders = models.PositiveIntegerField(default=0)
    cancelled_orders = models.PositiveIntegerField(default=0)
    refunded_orders = models.PositiveIntegerField(default=0)
    disputed_orders = models.PositiveIntegerField(default=0)

    # Financial statistics
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_fees = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    refunds_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Average values
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_completion_time = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # in days

    class Meta:
        db_table = 'orders_order_stat'
        verbose_name = '订单统计'
        verbose_name_plural = '订单统计'
        unique_together = ['date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"Order stats for {self.date}"


class OrderCancellation(BaseModel):
    """Detailed cancellation information"""

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='cancellation_details')
    cancelled_by = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.CharField(
        max_length=50,
        choices=[
            ('client_request', 'Client Request'),
            ('freelancer_request', 'Freelancer Request'),
            ('mutual_agreement', 'Mutual Agreement'),
            ('platform_intervention', 'Platform Intervention'),
            ('fraud', 'Fraud'),
            ('other', 'Other'),
        ],
        db_index=True
    )
    detailed_reason = models.TextField()

    # Refund information
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    refund_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    refund_reason = models.TextField(blank=True)

    # Status
    is_processed = models.BooleanField(default=False, db_index=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_cancellations'
    )

    class Meta:
        db_table = 'orders_order_cancellation'
        verbose_name = '订单取消'
        verbose_name_plural = '订单取消'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['cancelled_by']),
            models.Index(fields=['reason']),
            models.Index(fields=['is_processed']),
        ]

    def __str__(self):
        return f"Cancellation for {self.order.order_number}: {self.reason}"