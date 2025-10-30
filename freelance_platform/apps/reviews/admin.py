from django.contrib import admin
from .models import (
    Review, ReviewHelpful, ReviewInvitation, ReviewReport,
    ReviewStat, ReviewTemplate, UserRating
)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'reviewee', 'order', 'rating', 'review_type', 'status', 'created_at')
    list_filter = ('review_type', 'status', 'rating', 'is_visible', 'is_flagged', 'created_at')
    search_fields = ('reviewer__username', 'reviewee__username', 'order__order_number', 'review_title', 'review_content')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    actions = ['approve_reviews', 'flag_reviews', 'make_visible', 'make_hidden']

    def approve_reviews(self, request, queryset):
        count = queryset.update(status='approved')
        self.message_user(request, f'{count} reviews approved.')
    approve_reviews.short_description = 'Approve selected reviews'

    def flag_reviews(self, request, queryset):
        count = queryset.update(is_flagged=True)
        self.message_user(request, f'{count} reviews flagged.')
    flag_reviews.short_description = 'Flag selected reviews'

    def make_visible(self, request, queryset):
        count = queryset.update(is_visible=True)
        self.message_user(request, f'{count} reviews made visible.')
    make_visible.short_description = 'Make selected reviews visible'

    def make_hidden(self, request, queryset):
        count = queryset.update(is_visible=False)
        self.message_user(request, f'{count} reviews made hidden.')
    make_hidden.short_description = 'Hide selected reviews'


@admin.register(UserRating)
class UserRatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'overall_rating', 'total_reviews', 'reputation_score', 'rank_percentile', 'updated_at')
    list_filter = ('overall_rating', 'updated_at')
    search_fields = ('user__username', 'user__email')
    ordering = ('-reputation_score',)
    readonly_fields = ('user', 'updated_at')

    def has_add_permission(self, request):
        return False


@admin.register(ReviewInvitation)
class ReviewInvitationAdmin(admin.ModelAdmin):
    list_display = ('order', 'client_reviewed', 'freelancer_reviewed', 'created_at')
    list_filter = ('client_reviewed', 'freelancer_reviewed', 'created_at')
    search_fields = ('order__order_number',)
    ordering = ('-created_at',)


@admin.register(ReviewReport)
class ReviewReportAdmin(admin.ModelAdmin):
    list_display = ('review', 'reporter', 'reason', 'status', 'created_at')
    list_filter = ('reason', 'status', 'created_at')
    search_fields = ('review__review_content', 'reporter__username', 'description')
    ordering = ('-created_at',)

    actions = ['resolve_reports', 'dismiss_reports']

    def resolve_reports(self, request, queryset):
        count = queryset.update(status='resolved')
        self.message_user(request, f'{count} reports resolved.')
    resolve_reports.short_description = 'Resolve selected reports'

    def dismiss_reports(self, request, queryset):
        count = queryset.update(status='dismissed')
        self.message_user(request, f'{count} reports dismissed.')
    dismiss_reports.short_description = 'Dismiss selected reports'


@admin.register(ReviewTemplate)
class ReviewTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type', 'is_active', 'created_at')
    list_filter = ('template_type', 'is_active', 'created_at')
    search_fields = ('name', 'template_text')
    ordering = ('name',)


@admin.register(ReviewStat)
class ReviewStatAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_reviews', 'average_rating', 'five_star_reviews')
    ordering = ('-date',)
    date_hierarchy = 'date'

    def has_add_permission(self, request):
        return False


# Register other models
admin.site.register(ReviewHelpful)