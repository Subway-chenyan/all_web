from django.db import models
from django.core.validators import MinValueValidator
from apps.common.models import BaseModel
from apps.accounts.models import User
from apps.orders.models import Order
from decimal import Decimal
from django.utils import timezone
import uuid


class Wallet(BaseModel):
    """User wallet for managing funds"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet', verbose_name='用户')
    balance = models.DecimalField(
        '余额',
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        db_index=True
    )
    frozen_balance = models.DecimalField(
        '冻结余额',
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        db_index=True
    )
    total_earned = models.DecimalField(
        '总收入',
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    total_spent = models.DecimalField(
        '总支出',
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Withdrawal settings
    withdrawal_method = models.CharField(
        '提现方式',
        max_length=20,
        choices=[
            ('alipay', '支付宝'),
            ('wechat', '微信支付'),
            ('bank_transfer', '银行转账'),
        ],
        default='alipay'
    )
    withdrawal_account = models.CharField('提现账户', max_length=100, blank=True)
    withdrawal_account_name = models.CharField('账户名称', max_length=100, blank=True)

    class Meta:
        db_table = 'payments_wallet'
        verbose_name = '钱包'
        verbose_name_plural = '钱包'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['balance']),
            models.Index(fields=['frozen_balance']),
        ]

    def __str__(self):
        return f"{self.user.username} Wallet: ¥{self.balance}"

    def has_sufficient_balance(self, amount):
        """Check if wallet has sufficient balance"""
        return self.balance >= amount

    def freeze_funds(self, amount):
        """Freeze funds for pending transactions"""
        if self.has_sufficient_balance(amount):
            self.balance -= amount
            self.frozen_balance += amount
            self.save()
            return True
        return False

    def release_frozen_funds(self, amount):
        """Release frozen funds back to available balance"""
        if self.frozen_balance >= amount:
            self.frozen_balance -= amount
            self.balance += amount
            self.save()
            return True
        return False

    def deduct_frozen_funds(self, amount):
        """Deduct from frozen balance (completed transaction)"""
        if self.frozen_balance >= amount:
            self.frozen_balance -= amount
            self.total_spent += amount
            self.save()
            return True
        return False

    def add_funds(self, amount):
        """Add funds to wallet"""
        self.balance += amount
        self.total_earned += amount
        self.save()


class PaymentMethod(BaseModel):
    """Payment methods for users"""

    METHOD_TYPES = [
        ('alipay', '支付宝'),
        ('wechat', '微信支付'),
        ('bank_card', '银行卡'),
        ('credit_card', '信用卡'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods', verbose_name='用户')
    method_type = models.CharField('支付类型', max_length=20, choices=METHOD_TYPES)
    provider = models.CharField('提供商', max_length=50, blank=True)  # Bank name, etc.
    account_number = models.CharField('账号', max_length=100)  # Last 4 digits shown
    account_name = models.CharField('账户名', max_length=100)  # Account holder name
    is_default = models.BooleanField('是否默认', default=False, db_index=True)
    is_active = models.BooleanField('是否激活', default=True, db_index=True)

    # Encrypted data (should be stored securely)
    encrypted_data = models.TextField('加密数据', blank=True)  # Encrypted payment details

    class Meta:
        db_table = 'payments_payment_method'
        verbose_name = '支付方式'
        verbose_name_plural = '支付方式'
        indexes = [
            models.Index(fields=['user', 'is_default']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['method_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_method_type_display()} ({self.account_number})"


class Transaction(BaseModel):
    """Main transaction model"""

    TRANSACTION_TYPES = [
        ('deposit', '存款'),
        ('withdrawal', '提现'),
        ('payment', '支付'),
        ('refund', '退款'),
        ('payout', '派发'),
        ('fee', '平台费用'),
        ('bonus', '奖励'),
        ('penalty', '罚金'),
    ]

    TRANSACTION_STATUS = [
        ('pending', '待处理'),
        ('processing', '处理中'),
        ('completed', '已完成'),
        ('failed', '失败'),
        ('cancelled', '已取消'),
        ('reversed', '已撤销'),
    ]

    PAYMENT_PROVIDERS = [
        ('alipay', '支付宝'),
        ('wechat', '微信支付'),
        ('unionpay', '银联'),
        ('wallet', '平台钱包'),
        ('stripe', 'Stripe'),
    ]

    # Basic Information
    transaction_id = models.CharField('交易号', max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions', verbose_name='用户')
    transaction_type = models.CharField('交易类型', max_length=20, choices=TRANSACTION_TYPES, db_index=True)
    status = models.CharField('状态', max_length=20, choices=TRANSACTION_STATUS, default='pending', db_index=True)

    # Amount
    amount = models.DecimalField('金额', max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField('货币', max_length=3, default='CNY')
    fee = models.DecimalField('手续费', max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    net_amount = models.DecimalField('净金额', max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])

    # Related objects
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions', verbose_name='订单')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='支付方式')

    # Provider information
    provider = models.CharField('提供商', max_length=20, choices=PAYMENT_PROVIDERS, db_index=True)
    provider_transaction_id = models.CharField('提供商交易号', max_length=100, blank=True, db_index=True)
    provider_response = models.JSONField('提供商响应', default=dict, blank=True)

    # Timing
    processed_at = models.DateTimeField('处理时间', null=True, blank=True)
    completed_at = models.DateTimeField('完成时间', null=True, blank=True)

    # Details
    description = models.TextField('描述', blank=True)
    notes = models.TextField('备注', blank=True)
    metadata = models.JSONField('元数据', default=dict, blank=True)

    class Meta:
        db_table = 'payments_transaction'
        verbose_name = '交易'
        verbose_name_plural = '交易'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['user', 'transaction_type']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['provider']),
            models.Index(fields=['provider_transaction_id']),
            models.Index(fields=['order']),
            models.Index(fields=['amount']),
            models.Index(fields=['processed_at']),
            models.Index(fields=['completed_at']),
        ]

    def __str__(self):
        return f"Transaction {self.transaction_id}: {self.transaction_type} ¥{self.amount}"

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = self.generate_transaction_id()
        if not self.net_amount:
            self.net_amount = self.amount - self.fee
        super().save(*args, **kwargs)

    def generate_transaction_id(self):
        """Generate unique transaction ID"""
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        import random
        random_num = random.randint(1000, 9999)
        return f"TXN{timestamp}{random_num}"

    def process_transaction(self):
        """Process the transaction"""
        if self.status == 'pending':
            self.status = 'processing'
            self.processed_at = timezone.now()
            self.save(update_fields=['status', 'processed_at'])

    def complete_transaction(self):
        """Complete the transaction"""
        if self.status == 'processing':
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save(update_fields=['status', 'completed_at'])

    def fail_transaction(self, reason=''):
        """Mark transaction as failed"""
        self.status = 'failed'
        self.notes = reason
        self.save(update_fields=['status', 'notes'])


class Escrow(BaseModel):
    """Escrow account for order payments"""

    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('funded', '已资金'),
        ('released', '已释放'),
        ('refunded', '已退款'),
        ('disputed', '纠纷中'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='escrow', verbose_name='订单')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='escrow_as_client', verbose_name='客户')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='escrow_as_freelancer', verbose_name='自由职业者')

    # Amount
    total_amount = models.DecimalField('总金额', max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    platform_fee = models.DecimalField('平台费用', max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    freelancer_amount = models.DecimalField('自由职业者金额', max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])

    # Status
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)

    # Transactions
    funding_transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='funded_escrows',
        verbose_name='资金交易'
    )
    release_transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='released_escrows',
        verbose_name='释放交易'
    )

    # Timing
    funded_at = models.DateTimeField('资金时间', null=True, blank=True)
    released_at = models.DateTimeField('释放时间', null=True, blank=True)
    refunded_at = models.DateTimeField('退款时间', null=True, blank=True)

    # Release conditions
    auto_release_date = models.DateTimeField('自动释放日期', null=True, blank=True)
    is_manual_release_required = models.BooleanField('需要手动释放', default=False, db_index=True)

    class Meta:
        db_table = 'payments_escrow'
        verbose_name = '托管账户'
        verbose_name_plural = '托管账户'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['freelancer', 'status']),
            models.Index(fields=['status', 'funded_at']),
            models.Index(fields=['auto_release_date']),
        ]

    def __str__(self):
        return f"Escrow for {self.order.order_number}: {self.status}"

    def fund_escrow(self, transaction):
        """Fund the escrow account"""
        self.status = 'funded'
        self.funding_transaction = transaction
        self.funded_at = timezone.now()
        self.save(update_fields=['status', 'funding_transaction', 'funded_at'])

    def release_funds(self, transaction):
        """Release funds to freelancer"""
        self.status = 'released'
        self.release_transaction = transaction
        self.released_at = timezone.now()
        self.save(update_fields=['status', 'release_transaction', 'released_at'])

    def refund_funds(self):
        """Refund funds to client"""
        self.status = 'refunded'
        self.refunded_at = timezone.now()
        self.save(update_fields=['status', 'refunded_at'])


class Withdrawal(BaseModel):
    """Withdrawal requests"""

    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('processing', '处理中'),
        ('completed', '已完成'),
        ('rejected', '已拒绝'),
        ('cancelled', '已取消'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='withdrawals', verbose_name='用户')
    amount = models.DecimalField('金额', max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    fee = models.DecimalField('手续费', max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    net_amount = models.DecimalField('净金额', max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])

    # Withdrawal method
    withdrawal_method = models.CharField(
        '提现方式',
        max_length=20,
        choices=[
            ('alipay', '支付宝'),
            ('wechat', '微信支付'),
            ('bank_transfer', '银行转账'),
        ],
        db_index=True
    )
    withdrawal_account = models.CharField('提现账户', max_length=100)
    account_name = models.CharField('账户名称', max_length=100)

    # Status and processing
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    processed_at = models.DateTimeField('处理时间', null=True, blank=True)
    completed_at = models.DateTimeField('完成时间', null=True, blank=True)

    # Transaction reference
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='withdrawals',
        verbose_name='交易'
    )
    provider_reference = models.CharField('提供商参考号', max_length=100, blank=True)

    # Admin notes
    admin_notes = models.TextField('管理员备注', blank=True)
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_withdrawals',
        verbose_name='处理人'
    )

    class Meta:
        db_table = 'payments_withdrawal'
        verbose_name = '提现'
        verbose_name_plural = '提现'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['withdrawal_method']),
            models.Index(fields=['amount']),
        ]

    def __str__(self):
        return f"Withdrawal {self.id}: ¥{self.amount} by {self.user.username}"


class PaymentRefund(BaseModel):
    """Refund records"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    original_transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='refunds'
    )
    refund_transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='original_refunds',
        null=True,
        blank=True
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refunds')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)

    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])

    reason = models.CharField(
        max_length=50,
        choices=[
            ('cancellation', 'Order Cancellation'),
            ('dispute', 'Dispute Resolution'),
            ('error', 'Payment Error'),
            ('fraud', 'Fraud'),
            ('goodwill', 'Goodwill'),
            ('other', 'Other'),
        ],
        db_index=True
    )
    reason_description = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments_payment_refund'
        verbose_name = '支付退款'
        verbose_name_plural = '支付退款'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['original_transaction']),
            models.Index(fields=['refund_transaction']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['order']),
            models.Index(fields=['reason']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"Refund {self.id}: ¥{self.amount} for {self.user.username}"


class PaymentStat(BaseModel):
    """Daily payment statistics"""

    date = models.DateField(db_index=True)

    # Transaction counts
    total_transactions = models.PositiveIntegerField(default=0)
    successful_transactions = models.PositiveIntegerField(default=0)
    failed_transactions = models.PositiveIntegerField(default=0)

    # Transaction amounts
    total_volume = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    successful_volume = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    failed_volume = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    # Revenue
    platform_fees = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    withdrawal_fees = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # By provider
    alipay_volume = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    wechat_volume = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    wallet_volume = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        db_table = 'payments_payment_stat'
        verbose_name = '支付统计'
        verbose_name_plural = '支付统计'
        unique_together = ['date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"Payment stats for {self.date}"


class PayoutBatch(BaseModel):
    """Batch processing for payouts"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    batch_id = models.CharField(max_length=50, unique=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)

    # Batch totals
    total_withdrawals = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_fees = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Processing information
    provider = models.CharField(
        max_length=20,
        choices=[
            ('alipay', 'Alipay'),
            ('wechat', 'WeChat Pay'),
            ('bank_transfer', 'Bank Transfer'),
        ],
        db_index=True
    )
    provider_batch_id = models.CharField(max_length=100, blank=True)
    provider_response = models.JSONField(default=dict, blank=True)

    # Timing
    processed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments_payout_batch'
        verbose_name = '派发批次'
        verbose_name_plural = '派发批次'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['batch_id']),
            models.Index(fields=['status']),
            models.Index(fields=['provider']),
            models.Index(fields=['processed_at']),
        ]

    def __str__(self):
        return f"Payout Batch {self.batch_id}: {self.status}"

    def save(self, *args, **kwargs):
        if not self.batch_id:
            self.batch_id = self.generate_batch_id()
        super().save(*args, **kwargs)

    def generate_batch_id(self):
        """Generate unique batch ID"""
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        import random
        random_num = random.randint(100, 999)
        return f"PAY{timestamp}{random_num}"