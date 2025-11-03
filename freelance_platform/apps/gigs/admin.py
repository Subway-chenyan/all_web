from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Gig, GigPackage, GigRequirement, GigFAQ,
    GigExtra, GigFavorite, GigView, GigStat, GigSearchHistory, GigReport
)


class GigPackageInline(admin.TabularInline):
    model = GigPackage
    extra = 1


class GigRequirementInline(admin.TabularInline):
    model = GigRequirement
    extra = 1


class GigFAQInline(admin.TabularInline):
    model = GigFAQ
    extra = 1


class GigExtraInline(admin.TabularInline):
    model = GigExtra
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'sort_order', 'gig_count', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('sort_order', 'name')
    # prepopulated_fields = {'slug': ('name',)}  # Commented out as slug field doesn't exist

    def gig_count(self, obj):
        return obj.gigs.filter(status='active').count()
    gig_count.short_description = 'Active Gigs'


@admin.register(Gig)
class GigAdmin(admin.ModelAdmin):
    list_display = ('title', 'freelancer', 'category', 'status', 'is_featured', 'average_rating', 'view_count', 'order_count', 'created_at')
    list_filter = ('status', 'is_featured', 'category', 'created_at')
    search_fields = ('title', 'description', 'freelancer__username', 'freelancer__email')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    # filter_horizontal = ('tags',)  # Commented out as tags field doesn't exist

    inlines = [GigPackageInline, GigRequirementInline, GigFAQInline, GigExtraInline]

    fieldsets = (
        ('Basic Info', {
            'fields': ('freelancer', 'category', 'title', 'description')
        }),
        ('Media', {
            'fields': ('thumbnail', 'gallery_images')
        }),
        ('Status & Visibility', {
            'fields': ('status', 'is_featured')
        }),
        ('SEO', {
            'fields': ('slug', 'meta_description')
        }),
        ('Statistics', {
            'fields': ('view_count', 'order_count', 'average_rating', 'review_count'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('freelancer', 'category')

    actions = ['make_featured', 'remove_featured']

    def make_featured(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f'{count} gigs marked as featured.')
    make_featured.short_description = 'Mark selected gigs as featured'

    def remove_featured(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f'{count} gigs removed from featured.')
    remove_featured.short_description = 'Remove featured status from selected gigs'


@admin.register(GigPackage)
class GigPackageAdmin(admin.ModelAdmin):
    list_display = ('gig', 'title', 'package_type', 'price', 'delivery_days')
    list_filter = ('package_type', 'delivery_days', 'created_at')
    search_fields = ('gig__title', 'title', 'description')
    ordering = ('gig', 'created_at')

    fieldsets = (
        ('Package Info', {
            'fields': ('gig', 'title', 'package_type', 'description')
        }),
        ('Pricing & Delivery', {
            'fields': ('price', 'delivery_days')
        }),
    )


@admin.register(GigRequirement)
class GigRequirementAdmin(admin.ModelAdmin):
    list_display = ('gig', 'requirement_text', 'is_required', 'sort_order')
    list_filter = ('is_required', 'created_at')
    search_fields = ('gig__title', 'requirement_text')
    ordering = ('gig', 'created_at')


@admin.register(GigFAQ)
class GigFAQAdmin(admin.ModelAdmin):
    list_display = ('gig', 'question', 'sort_order', 'created_at')
    search_fields = ('gig__title', 'question', 'answer')
    ordering = ('gig', 'created_at')


@admin.register(GigExtra)
class GigExtraAdmin(admin.ModelAdmin):
    list_display = ('gig', 'title', 'price', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('gig__title', 'title', 'description')
    ordering = ('gig', 'created_at')


@admin.register(GigFavorite)
class GigFavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'gig', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'gig__title')
    ordering = ('-created_at',)

    def has_add_permission(self, request):
        return False


@admin.register(GigView)
class GigViewAdmin(admin.ModelAdmin):
    list_display = ('gig', 'user', 'ip_address', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('gig__title', 'user__username', 'ip_address')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False


@admin.register(GigStat)
class GigStatAdmin(admin.ModelAdmin):
    list_display = ('gig', 'date', 'views', 'orders', 'revenue', 'conversion_rate')
    list_filter = ('date',)
    search_fields = ('gig__title',)
    ordering = ('-date', 'gig')
    date_hierarchy = 'date'

    def conversion_rate(self, obj):
        if obj.views > 0:
            return f"{(obj.orders / obj.views * 100):.2f}%"
        return "0%"
    conversion_rate.short_description = 'Conversion Rate'


@admin.register(GigSearchHistory)
class GigSearchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'query', 'results_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'query')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False


@admin.register(GigReport)
class GigReportAdmin(admin.ModelAdmin):
    list_display = ('gig', 'reporter', 'reason', 'status', 'created_at')
    list_filter = ('reason', 'status', 'created_at')
    search_fields = ('gig__title', 'reporter__username', 'description')
    ordering = ('-created_at',)

    actions = ['mark_as_resolved', 'dismiss_reports']

    def mark_as_resolved(self, request, queryset):
        count = queryset.update(status='resolved')
        self.message_user(request, f'{count} reports marked as resolved.')
    mark_as_resolved.short_description = 'Mark selected reports as resolved'

    def dismiss_reports(self, request, queryset):
        count = queryset.update(status='dismissed')
        self.message_user(request, f'{count} reports dismissed.')
    dismiss_reports.short_description = 'Dismiss selected reports'