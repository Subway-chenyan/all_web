from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.common.models import BaseModel
from apps.accounts.models import User
from apps.gigs.models import Gig
from apps.orders.models import Order
from django.db.models import Avg, Count


class Review(BaseModel):
    """Review and rating system"""

    REVIEW_TYPES = [
        ('freelancer', 'Freelancer Review'),
        ('client', 'Client Review'),
        ('gig', 'Gig Review'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('published', 'Published'),
        ('hidden', 'Hidden'),
        ('flagged', 'Flagged'),
        ('removed', 'Removed'),
    ]

    # Basic Information
    reviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='given_reviews'
    )
    reviewee = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_reviews'
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    gig = models.ForeignKey(
        Gig,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )

    # Review type and status
    review_type = models.CharField(max_length=20, choices=REVIEW_TYPES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    is_visible = models.BooleanField(default=False, db_index=True)

    # Ratings (1-5 scale)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        db_index=True
    )
    communication_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    quality_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    delivery_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    value_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )

    # Content
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField(blank=True)

    # Response
    response = models.TextField(blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    response_helpful_count = models.PositiveIntegerField(default=0)

    # Moderation
    is_flagged = models.BooleanField(default=False, db_index=True)
    flag_reason = models.CharField(max_length=200, blank=True)
    moderated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_reviews'
    )
    moderated_at = models.DateTimeField(null=True, blank=True)
    moderation_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'reviews_review'
        verbose_name = '评价'
        verbose_name_plural = '评价'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reviewer', 'status']),
            models.Index(fields=['reviewee', 'status']),
            models.Index(fields=['order']),
            models.Index(fields=['gig']),
            models.Index(fields=['review_type', 'status']),
            models.Index(fields=['rating']),
            models.Index(fields=['is_visible']),
            models.Index(fields=['is_flagged']),
            models.Index(fields=['created_at']),
        ]
        unique_together = ['reviewer', 'order', 'review_type']

    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.reviewee.username}: {self.rating}/5"

    def save(self, *args, **kwargs):
        # Auto-publish if not flagged
        if self.status == 'pending' and not self.is_flagged:
            self.status = 'published'
            self.is_visible = True
        super().save(*args, **kwargs)

    def update_average_ratings(self):
        """Update user and gig average ratings"""
        # Update reviewee ratings
        reviews = Review.objects.filter(
            reviewee=self.reviewee,
            status='published',
            is_visible=True
        )

        avg_rating = reviews.aggregate(
            avg_rating=Avg('rating'),
            total_reviews=Count('id')
        )

        # Update user profile with rating info
        if hasattr(self.reviewee, 'profile'):
            profile = self.reviewee.profile
            # Add rating fields to profile or create separate rating model
            profile.save()

        # Update gig ratings
        if self.gig:
            self.gig.update_rating()


class ReviewHelpful(BaseModel):
    """Helpful votes on reviews"""

    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='helpful_votes')
    is_helpful = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'reviews_review_helpful'
        verbose_name = '评价有用'
        verbose_name_plural = '评价有用'
        unique_together = ['review', 'user']
        indexes = [
            models.Index(fields=['review', 'is_helpful']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.username} found review {self.review.id} helpful"


class ReviewReport(BaseModel):
    """Report inappropriate reviews"""

    REPORT_REASONS = [
        ('fake', 'Fake Review'),
        ('spam', 'Spam'),
        ('inappropriate', 'Inappropriate Content'),
        ('harassment', 'Harassment'),
        ('conflict_of_interest', 'Conflict of Interest'),
        ('other', 'Other'),
    ]

    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_reviews')
    reason = models.CharField(max_length=50, choices=REPORT_REASONS, db_index=True)
    description = models.TextField(blank=True)

    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('investigating', 'Under Investigation'),
            ('resolved', 'Resolved'),
            ('dismissed', 'Dismissed'),
        ],
        default='pending',
        db_index=True
    )

    # Admin response
    admin_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_review_reports'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'reviews_review_report'
        verbose_name = '评价报告'
        verbose_name_plural = '评价报告'
        indexes = [
            models.Index(fields=['review']),
            models.Index(fields=['reporter']),
            models.Index(fields=['reason']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Report on review {self.review.id}: {self.reason}"


class UserRating(BaseModel):
    """Aggregated user ratings and reputation"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rating_summary')

    # Overall rating
    overall_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_reviews = models.PositiveIntegerField(default=0)

    # Category ratings
    communication_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    quality_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    delivery_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    value_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )

    # Rating distribution
    five_star_count = models.PositiveIntegerField(default=0)
    four_star_count = models.PositiveIntegerField(default=0)
    three_star_count = models.PositiveIntegerField(default=0)
    two_star_count = models.PositiveIntegerField(default=0)
    one_star_count = models.PositiveIntegerField(default=0)

    # Reputation score (calculated based on various factors)
    reputation_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    rank_percentile = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    # Last updated
    last_review_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'reviews_user_rating'
        verbose_name = '用户评分'
        verbose_name_plural = '用户评分'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['overall_rating']),
            models.Index(fields=['total_reviews']),
            models.Index(fields=['reputation_score']),
            models.Index(fields=['rank_percentile']),
        ]

    def __str__(self):
        return f"{self.user.username} Rating: {self.overall_rating}/5 ({self.total_reviews} reviews)"

    def update_ratings(self):
        """Update user's rating statistics"""
        from apps.reviews.models import Review

        reviews = Review.objects.filter(
            reviewee=self.user,
            status='published',
            is_visible=True
        )

        if reviews.exists():
            # Calculate overall statistics
            rating_data = reviews.aggregate(
                overall_rating=Avg('rating'),
                communication_rating=Avg('communication_rating'),
                quality_rating=Avg('quality_rating'),
                delivery_rating=Avg('delivery_rating'),
                value_rating=Avg('value_rating'),
                total_reviews=Count('id')
            )

            # Update rating fields
            self.overall_rating = rating_data['overall_rating'] or 0
            self.communication_rating = rating_data['communication_rating'] or 0
            self.quality_rating = rating_data['quality_rating'] or 0
            self.delivery_rating = rating_data['delivery_rating'] or 0
            self.value_rating = rating_data['value_rating'] or 0
            self.total_reviews = rating_data['total_reviews']

            # Calculate rating distribution
            for rating in range(1, 6):
                count = reviews.filter(rating=rating).count()
                if rating == 5:
                    self.five_star_count = count
                elif rating == 4:
                    self.four_star_count = count
                elif rating == 3:
                    self.three_star_count = count
                elif rating == 2:
                    self.two_star_count = count
                elif rating == 1:
                    self.one_star_count = count

            # Calculate reputation score (complex algorithm)
            self.calculate_reputation_score()

            # Update last review date
            latest_review = reviews.order_by('-created_at').first()
            if latest_review:
                self.last_review_date = latest_review.created_at

        self.save()

    def calculate_reputation_score(self):
        """Calculate reputation score based on various factors"""
        base_score = float(self.overall_rating) * 20  # 0-100 scale

        # Review volume bonus
        volume_bonus = min(self.total_reviews * 0.5, 20)  # Max 20 points

        # Recency bonus (more recent reviews weigh more)
        if self.last_review_date:
            from django.utils import timezone
            days_since_last_review = (timezone.now() - self.last_review_date).days
            recency_bonus = max(0, 10 - (days_since_last_review / 30))  # Decay over time
        else:
            recency_bonus = 0

        # Quality of reviews (helpful votes, etc.)
        # This would need additional tracking

        self.reputation_score = base_score + volume_bonus + recency_bonus
        self.reputation_score = min(self.reputation_score, 100)  # Cap at 100


class ReviewInvitation(BaseModel):
    """Invitations to leave reviews"""

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review_invitation')
    client_invited = models.BooleanField(default=False, db_index=True)
    freelancer_invited = models.BooleanField(default=False, db_index=True)
    client_reviewed = models.BooleanField(default=False, db_index=True)
    freelancer_reviewed = models.BooleanField(default=False, db_index=True)

    # Invitation details
    client_invitation_sent_at = models.DateTimeField(null=True, blank=True)
    freelancer_invitation_sent_at = models.DateTimeField(null=True, blank=True)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)

    # Settings
    auto_send_invitation = models.BooleanField(default=True)
    days_until_reminder = models.PositiveIntegerField(default=3)

    class Meta:
        db_table = 'reviews_review_invitation'
        verbose_name = '评价邀请'
        verbose_name_plural = '评价邀请'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['client_invited', 'client_reviewed']),
            models.Index(fields=['freelancer_invited', 'freelancer_reviewed']),
        ]

    def __str__(self):
        return f"Review invitation for {self.order.order_number}"


class ReviewTemplate(BaseModel):
    """Review templates for common scenarios"""

    TEMPLATE_TYPES = [
        ('positive', 'Positive Review'),
        ('neutral', 'Neutral Review'),
        ('negative', 'Negative Review'),
        ('detailed', 'Detailed Review'),
    ]

    name = models.CharField(max_length=100, db_index=True)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES, db_index=True)
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()

    # Variables for template (e.g., {{freelancer_name}}, {{gig_title}})
    variables = models.JSONField(default=list, blank=True)

    # Usage statistics
    usage_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'reviews_review_template'
        verbose_name = '评价模板'
        verbose_name_plural = '评价模板'
        indexes = [
            models.Index(fields=['template_type']),
            models.Index(fields=['is_active']),
            models.Index(fields=['usage_count']),
        ]

    def __str__(self):
        return f"Review template: {self.name}"


class ReviewStat(BaseModel):
    """Daily review statistics"""

    date = models.DateField(db_index=True)

    # Review counts
    total_reviews = models.PositiveIntegerField(default=0)
    published_reviews = models.PositiveIntegerField(default=0)
    flagged_reviews = models.PositiveIntegerField(default=0)
    removed_reviews = models.PositiveIntegerField(default=0)

    # Rating statistics
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    five_star_reviews = models.PositiveIntegerField(default=0)
    four_star_reviews = models.PositiveIntegerField(default=0)
    three_star_reviews = models.PositiveIntegerField(default=0)
    two_star_reviews = models.PositiveIntegerField(default=0)
    one_star_reviews = models.PositiveIntegerField(default=0)

    # Response statistics
    responded_reviews = models.PositiveIntegerField(default=0)
    average_response_time = models.DurationField(null=True, blank=True)

    class Meta:
        db_table = 'reviews_review_stat'
        verbose_name = '评价统计'
        verbose_name_plural = '评价统计'
        unique_together = ['date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"Review stats for {self.date}"