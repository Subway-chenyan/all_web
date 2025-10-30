"""
Admin configuration for social authentication models
"""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models_social import SocialAccount, SocialLoginAttempt, SocialProfileSync
from import_export import resources
from import_export.admin import ImportExportModelAdmin


class SocialAccountResource(resources.ModelResource):
    """Resource for importing/exporting social accounts"""
    class Meta:
        model = SocialAccount
        fields = ('id', 'user', 'provider', 'uid', 'openid', 'unionid',
                 'is_active', 'created_at', 'last_synced_at')
        export_order = ('id', 'user', 'provider', 'uid', 'created_at')


class SocialAccountInline(admin.TabularInline):
    """Inline social accounts for user admin"""
    model = SocialAccount
    extra = 0
    readonly_fields = ('provider', 'uid', 'openid', 'unionid', 'created_at',
                      'last_synced_at', 'token_expires_at')
    fields = ('provider', 'uid', 'is_active', 'created_at', 'last_synced_at')


@admin.register(SocialAccount)
class SocialAccountAdmin(ImportExportModelAdmin):
    """Admin configuration for SocialAccount model"""
    resource_class = SocialAccountResource
    list_display = ('user_email', 'provider', 'uid', 'is_active',
                   'created_at', 'last_synced_at', 'token_status')
    list_filter = ('provider', 'is_active', 'created_at', 'last_synced_at')
    search_fields = ('user__email', 'user__username', 'uid', 'openid', 'unionid')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_synced_at',
                      'token_status', 'raw_data_preview', 'extra_data_preview')

    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'provider', 'uid', 'openid', 'unionid', 'is_active')
        }),
        ('Token Information', {
            'fields': ('access_token', 'refresh_token', 'token_expires_at', 'token_status'),
            'classes': ('collapse',)
        }),
        ('Data Fields', {
            'fields': ('raw_data_preview', 'extra_data_preview'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_synced_at'),
            'classes': ('collapse',)
        })
    )

    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def user_email(self, obj):
        """Display user email with link"""
        if obj.user:
            url = reverse('admin:accounts_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.email)
        return '-'
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'

    def token_status(self, obj):
        """Display token status with color coding"""
        if obj.is_token_expired:
            return format_html('<span style="color: red;">Expired</span>')
        elif obj.token_expires_at:
            from django.utils import timezone
            if timezone.now() >= obj.token_expires_at - timezone.timedelta(hours=1):
                return format_html('<span style="color: orange;">Expiring Soon</span>')
            else:
                return format_html('<span style="color: green;">Valid</span>')
        return format_html('<span style="color: gray;">Unknown</span>')
    token_status.short_description = 'Token Status'

    def raw_data_preview(self, obj):
        """Display preview of raw data"""
        if obj.raw_data:
            import json
            data_str = json.dumps(obj.raw_data, indent=2, ensure_ascii=False)
            if len(data_str) > 500:
                data_str = data_str[:500] + '...'
            return format_html('<pre>{}</pre>', data_str)
        return '-'
    raw_data_preview.short_description = 'Raw Data Preview'

    def extra_data_preview(self, obj):
        """Display preview of extra data"""
        if obj.extra_data:
            import json
            data_str = json.dumps(obj.extra_data, indent=2, ensure_ascii=False)
            if len(data_str) > 500:
                data_str = data_str[:500] + '...'
            return format_html('<pre>{}</pre>', data_str)
        return '-'
    extra_data_preview.short_description = 'Extra Data Preview'

    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related('user')


class SocialLoginAttemptResource(resources.ModelResource):
    """Resource for importing/exporting login attempts"""
    class Meta:
        model = SocialLoginAttempt
        fields = ('attempt_id', 'provider', 'state', 'user', 'status',
                 'ip_address', 'initiated_at', 'completed_at')
        export_order = ('attempt_id', 'provider', 'status', 'initiated_at')


@admin.register(SocialLoginAttempt)
class SocialLoginAttemptAdmin(ImportExportModelAdmin):
    """Admin configuration for SocialLoginAttempt model"""
    resource_class = SocialLoginAttemptResource
    list_display = ('provider', 'status', 'user_email', 'ip_address',
                   'initiated_at', 'duration', 'error_display')
    list_filter = ('provider', 'status', 'initiated_at')
    search_fields = ('user__email', 'user__username', 'state', 'ip_address',
                    'error_message')
    readonly_fields = ('attempt_id', 'state', 'initiated_at', 'completed_at',
                      'duration', 'social_account_link')

    fieldsets = (
        ('Basic Information', {
            'fields': ('attempt_id', 'provider', 'state', 'user', 'status')
        }),
        ('Request Information', {
            'fields': ('ip_address', 'user_agent', 'chosen_user_type')
        }),
        ('Result Information', {
            'fields': ('social_account_link', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('initiated_at', 'completed_at', 'duration'),
            'classes': ('collapse',)
        })
    )

    date_hierarchy = 'initiated_at'
    ordering = ('-initiated_at',)

    def user_email(self, obj):
        """Display user email with link"""
        if obj.user:
            url = reverse('admin:accounts_user_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.email)
        return '-'
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'

    def duration(self, obj):
        """Calculate and display duration"""
        if obj.initiated_at and obj.completed_at:
            duration = obj.completed_at - obj.initiated_at
            return f"{duration.total_seconds():.2f}s"
        return '-'
    duration.short_description = 'Duration'

    def error_display(self, obj):
        """Display error message with truncation"""
        if obj.error_message:
            if len(obj.error_message) > 100:
                return obj.error_message[:100] + '...'
            return obj.error_message
        return '-'
    error_display.short_description = 'Error Message'

    def social_account_link(self, obj):
        """Display link to social account"""
        if obj.social_account:
            url = reverse('admin:accounts_socialaccount_change',
                         args=[obj.social_account.id])
            return format_html('<a href="{}">View Social Account</a>', url)
        return '-'
    social_account_link.short_description = 'Social Account'

    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related('user', 'social_account')


class SocialProfileSyncResource(resources.ModelResource):
    """Resource for importing/exporting profile syncs"""
    class Meta:
        model = SocialProfileSync
        fields = ('id', 'social_account', 'sync_type', 'status',
                 'started_at', 'completed_at')
        export_order = ('id', 'social_account', 'sync_type', 'status', 'started_at')


@admin.register(SocialProfileSync)
class SocialProfileSyncAdmin(ImportExportModelAdmin):
    """Admin configuration for SocialProfileSync model"""
    resource_class = SocialProfileSyncResource
    list_display = ('social_account_info', 'sync_type', 'status',
                   'started_at', 'duration', 'processed_fields_count')
    list_filter = ('sync_type', 'status', 'started_at')
    search_fields = ('social_account__user__email', 'social_account__provider',
                    'error_message')
    readonly_fields = ('id', 'social_account', 'sync_type', 'sync_data_preview',
                      'processed_fields', 'error_message', 'started_at',
                      'completed_at', 'duration')

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'social_account', 'sync_type', 'status')
        }),
        ('Sync Data', {
            'fields': ('sync_data_preview', 'processed_fields', 'processed_fields_count'),
            'classes': ('collapse',)
        }),
        ('Error Information', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('started_at', 'completed_at', 'duration'),
            'classes': ('collapse',)
        })
    )

    date_hierarchy = 'started_at'
    ordering = ('-started_at',)

    def social_account_info(self, obj):
        """Display social account info with link"""
        if obj.social_account:
            url = reverse('admin:accounts_socialaccount_change',
                         args=[obj.social_account.id])
            return format_html(
                '<a href="{}">{} - {}</a>',
                url,
                obj.social_account.get_provider_display(),
                obj.social_account.user.email
            )
        return '-'
    social_account_info.short_description = 'Social Account'
    social_account_info.admin_order_field = 'social_account__user__email'

    def duration(self, obj):
        """Calculate and display duration"""
        if obj.started_at and obj.completed_at:
            duration = obj.completed_at - obj.started_at
            return f"{duration.total_seconds():.2f}s"
        return '-'
    duration.short_description = 'Duration'

    def processed_fields_count(self, obj):
        """Count processed fields"""
        if obj.processed_fields:
            return len(obj.processed_fields)
        return 0
    processed_fields_count.short_description = 'Processed Fields'

    def sync_data_preview(self, obj):
        """Display preview of sync data"""
        if obj.sync_data:
            import json
            data_str = json.dumps(obj.sync_data, indent=2, ensure_ascii=False)
            if len(data_str) > 500:
                data_str = data_str[:500] + '...'
            return format_html('<pre>{}</pre>', data_str)
        return '-'
    sync_data_preview.short_description = 'Sync Data Preview'

    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related(
            'social_account', 'social_account__user'
        )


# Custom admin site title
admin.site.site_header = 'Freelance Platform Administration'
admin.site.site_title = 'Freelance Platform Admin'
admin.site.index_title = 'Welcome to Freelance Platform Administration'