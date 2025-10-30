from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    SocialAccount, SocialAuthBinding, SocialLoginAttempt,
    SocialUserRegistration, WeChatUserInfo, QQUserInfo
)


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    """社交账号管理"""
    list_display = [
        'user', 'provider', 'social_nickname', 'login_count',
        'is_active', 'is_verified', 'last_login_at', 'created_at'
    ]
    list_filter = [
        'provider', 'is_active', 'is_verified', 'created_at', 'last_login_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'social_nickname', 'uid', 'openid'
    ]
    readonly_fields = [
        'uid', 'openid', 'unionid', 'access_token', 'refresh_token',
        'token_expires_at', 'created_at', 'updated_at'
    ]

    fieldsets = (
        ('基本信息', {
            'fields': ('user', 'provider', 'uid', 'openid', 'unionid')
        }),
        ('社交账号信息', {
            'fields': ('social_nickname', 'social_avatar', 'social_profile_url')
        }),
        ('登录信息', {
            'fields': ('last_login_at', 'login_count', 'is_active', 'is_verified')
        }),
        ('OAuth信息', {
            'fields': ('access_token', 'refresh_token', 'token_expires_at'),
            'classes': ('collapse',)
        }),
        ('额外信息', {
            'fields': ('extra_data',),
            'classes': ('collapse',)
        }),
        ('系统信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_type(self, obj):
        return obj.user.get_user_type_display() if obj.user else '-'
    user_type.short_description = '用户类型'

    def social_avatar_preview(self, obj):
        if obj.social_avatar:
            return format_html(
                '<img src="{}" width="32" height="32" style="border-radius: 50%;" />',
                obj.social_avatar
            )
        return '-'
    social_avatar_preview.short_description = '头像预览'


@admin.register(SocialAuthBinding)
class SocialAuthBindingAdmin(admin.ModelAdmin):
    """社交账号绑定管理"""
    list_display = [
        'user', 'provider', 'social_nickname', 'status',
        'created_at', 'expires_at'
    ]
    list_filter = [
        'provider', 'status', 'created_at', 'expires_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'social_nickname', 'social_uid'
    ]
    readonly_fields = [
        'confirmation_token', 'confirmation_code', 'confirmed_at',
        'created_at', 'updated_at'
    ]

    fieldsets = (
        ('绑定信息', {
            'fields': ('user', 'provider', 'social_uid', 'social_nickname')
        }),
        ('确认信息', {
            'fields': ('confirmation_token', 'confirmation_code', 'status')
        }),
        ('时间信息', {
            'fields': ('confirmed_at', 'expires_at', 'created_at', 'updated_at')
        }),
        ('绑定上下文', {
            'fields': ('bind_context',),
            'classes': ('collapse',)
        }),
    )

    def confirmation_status(self, obj):
        if obj.status == 'confirmed':
            return format_html(
                '<span style="color: green;">✓ 已确认</span>'
            )
        elif obj.status == 'expired':
            return format_html(
                '<span style="color: red;">✗ 已过期</span>'
            )
        elif obj.status == 'pending':
            return format_html(
                '<span style="color: orange;">⏳ 待确认</span>'
            )
        return obj.get_status_display()
    confirmation_status.short_description = '确认状态'


@admin.register(SocialLoginAttempt)
class SocialLoginAttemptAdmin(admin.ModelAdmin):
    """社交登录尝试记录"""
    list_display = [
        'user_info', 'provider', 'status', 'ip_address',
        'started_at', 'completed_at'
    ]
    list_filter = [
        'provider', 'status', 'started_at', 'completed_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'ip_address', 'error_code'
    ]
    readonly_fields = [
        'started_at', 'completed_at', 'created_at', 'updated_at'
    ]

    fieldsets = (
        ('登录信息', {
            'fields': ('user', 'provider', 'status')
        }),
        ('请求信息', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('错误信息', {
            'fields': ('error_code', 'error_message'),
            'classes': ('collapse',)
        }),
        ('社交账号信息', {
            'fields': ('social_info',),
            'classes': ('collapse',)
        }),
        ('时间信息', {
            'fields': ('started_at', 'completed_at', 'created_at', 'updated_at')
        }),
    )

    def user_info(self, obj):
        if obj.user:
            return format_html(
                '<a href="{}">{}</a>',
                reverse('admin:accounts_user_change', args=[obj.user.id]),
                obj.user.username
            )
        return '匿名用户'
    user_info.short_description = '用户'

    def status_indicator(self, obj):
        if obj.status == 'success':
            return format_html(
                '<span style="color: green;">✓ 成功</span>'
            )
        elif obj.status == 'failed':
            return format_html(
                '<span style="color: red;">✗ 失败</span>'
            )
        elif obj.status == 'pending':
            return format_html(
                '<span style="color: orange;">⏳ 进行中</span>'
            )
        return obj.get_status_display()
    status_indicator.short_description = '登录状态'


@admin.register(SocialUserRegistration)
class SocialUserRegistrationAdmin(admin.ModelAdmin):
    """社交用户注册管理"""
    list_display = [
        'user_info', 'selected_user_type', 'registration_status',
        'current_step', 'email_collected', 'phone_collected',
        'registration_completed_at'
    ]
    list_filter = [
        'selected_user_type', 'registration_status', 'email_collected',
        'phone_collected', 'registration_completed_at'
    ]
    search_fields = [
        'social_account__user__username', 'social_account__social_nickname',
        'provided_email', 'provided_phone'
    ]
    readonly_fields = [
        'registration_completed_at', 'created_at', 'updated_at'
    ]

    fieldsets = (
        ('注册信息', {
            'fields': ('social_account', 'selected_user_type', 'registration_status')
        }),
        ('进度信息', {
            'fields': ('current_step', 'total_steps')
        }),
        ('信息收集状态', {
            'fields': ('email_collected', 'phone_collected', 'nickname_collected')
        }),
        ('用户提供的信息', {
            'fields': ('provided_email', 'provided_phone')
        }),
        ('完成信息', {
            'fields': ('registration_completed_at', 'created_at', 'updated_at')
        }),
    )

    def user_info(self, obj):
        if obj.social_account and obj.social_account.user:
            return format_html(
                '<a href="{}">{}</a>',
                reverse('admin:accounts_user_change', args=[obj.social_account.user.id]),
                obj.social_account.user.username
            )
        return '-'
    user_info.short_description = '用户'

    def registration_progress(self, obj):
        if obj.total_steps > 0:
            percentage = (obj.current_step / obj.total_steps) * 100
            return format_html(
                '<div style="width: 100px; background: #f0f0f0; border-radius: 3px;">'
                '<div style="width: {}%; background: #007cba; color: white; text-align: center; border-radius: 3px;">{}/{} 步</div>'
                '</div>',
                percentage, obj.current_step, obj.total_steps
            )
        return f"{obj.current_step}/{obj.total_steps}"
    registration_progress.short_description = '注册进度'


@admin.register(WeChatUserInfo)
class WeChatUserInfoAdmin(admin.ModelAdmin):
    """微信用户信息管理"""
    list_display = [
        'social_account_info', 'nickname', 'gender_display',
        'city', 'province', 'subscribe_time', 'created_at'
    ]
    list_filter = [
        'gender', 'city', 'province', 'country', 'subscribe_time'
    ]
    search_fields = [
        'nickname', 'social_account__user__username',
        'social_account__openid', 'remark'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('基本信息', {
            'fields': ('social_account', 'nickname', 'avatar_url', 'gender')
        }),
        ('地区信息', {
            'fields': ('country', 'province', 'city')
        }),
        ('微信信息', {
            'fields': ('language', 'privilege', 'remark')
        }),
        ('订阅信息', {
            'fields': ('subscribe_time', 'subscribe_scene', 'qr_scene', 'qr_scene_str')
        }),
        ('用户标签', {
            'fields': ('groupid', 'tagid_list')
        }),
        ('位置信息', {
            'fields': ('latitude', 'longitude', 'location_precision'),
            'classes': ('collapse',)
        }),
        ('系统信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def social_account_info(self, obj):
        if obj.social_account:
            return format_html(
                '<a href="{}">{}</a>',
                reverse('admin:social_accounts_socialaccount_change', args=[obj.social_account.id]),
                obj.social_account.social_nickname or obj.social_account.uid
            )
        return '-'
    social_account_info.short_description = '社交账号'

    def gender_display(self, obj):
        if obj.gender == 1:
            return '男'
        elif obj.gender == 2:
            return '女'
        return '-'
    gender_display.short_description = '性别'

    def avatar_preview(self, obj):
        if obj.avatar_url:
            return format_html(
                '<img src="{}" width="32" height="32" style="border-radius: 50%;" />',
                obj.avatar_url
            )
        return '-'
    avatar_preview.short_description = '头像预览'


@admin.register(QQUserInfo)
class QQUserInfoAdmin(admin.ModelAdmin):
    """QQ用户信息管理"""
    list_display = [
        'social_account_info', 'nickname', 'gender',
        'city', 'province', 'vip_info', 'created_at'
    ]
    list_filter = [
        'gender', 'city', 'province', 'is_vip', 'is_yellow_vip',
        'yellow_vip_level', 'is_yellow_year_vip'
    ]
    search_fields = [
        'nickname', 'social_account__user__username',
        'social_account__uid', 'year'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('基本信息', {
            'fields': ('social_account', 'nickname', 'avatar_url', 'gender')
        }),
        ('地区信息', {
            'fields': ('province', 'city', 'year')
        }),
        ('QQ会员信息', {
            'fields': ('is_vip', 'vip_level')
        }),
        ('QQ黄钻信息', {
            'fields': ('is_yellow_vip', 'yellow_vip_level', 'is_yellow_year_vip')
        }),
        ('系统信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def social_account_info(self, obj):
        if obj.social_account:
            return format_html(
                '<a href="{}">{}</a>',
                reverse('admin:social_accounts_socialaccount_change', args=[obj.social_account.id]),
                obj.social_account.social_nickname or obj.social_account.uid
            )
        return '-'
    social_account_info.short_description = '社交账号'

    def vip_info(self, obj):
        info = []
        if obj.is_vip:
            info.append(f'VIP{obj.vip_level}')
        if obj.is_yellow_vip:
            info.append(f'黄钻{obj.yellow_vip_level}')
        if obj.is_yellow_year_vip:
            info.append('年费黄钻')
        return ', '.join(info) if info else '-'
    vip_info.short_description = '会员信息'

    def avatar_preview(self, obj):
        if obj.avatar_url:
            return format_html(
                '<img src="{}" width="32" height="32" style="border-radius: 50%;" />',
                obj.avatar_url
            )
        return '-'
    avatar_preview.short_description = '头像预览'
