from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    User, UserProfile, Skill, UserSkill, Education,
    WorkExperience, Portfolio, UserVerification, UserActivityLog
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'user_type', 'user_status', 'is_email_verified', 'profile_completion_percentage', 'created_at')
    list_filter = ('user_type', 'user_status', 'is_email_verified', 'is_phone_verified', 'is_identity_verified', 'created_at')
    search_fields = ('username', 'email', 'phone_number', 'wechat_id')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'first_name', 'last_name')}),
        ('User Type', {'fields': ('user_type', 'user_status')}),
        ('Chinese Market Fields', {'fields': ('phone_number', 'wechat_id')}),
        ('Verification', {'fields': ('is_email_verified', 'is_phone_verified', 'is_identity_verified')}),
        ('Profile Completion', {'fields': ('profile_completion_percentage',)}),
        ('Activity Tracking', {'fields': ('last_login_ip', 'last_login_location')}),
        ('Email Preferences', {'fields': ('email_notifications_enabled', 'marketing_emails_enabled')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'province', 'city', 'hourly_rate', 'profile_visibility', 'created_at')
    list_filter = ('province', 'profile_visibility', 'preferred_language', 'created_at')
    search_fields = ('user__username', 'user__email', 'first_name', 'last_name', 'company_name')
    ordering = ('-created_at',)

    fieldsets = (
        ('Basic Information', {'fields': ('user', 'first_name', 'last_name', 'bio', 'avatar')}),
        ('Location', {'fields': ('country', 'province', 'city', 'address', 'postal_code')}),
        ('Language & Timezone', {'fields': ('preferred_language', 'timezone')}),
        ('Freelancer Info', {'fields': ('hourly_rate', 'years_of_experience')}),
        ('Company Info', {'fields': ('company_name', 'company_registration_number', 'company_website')}),
        ('Social Links', {'fields': ('linkedin_url', 'github_url', 'portfolio_url')}),
        ('Settings', {'fields': ('profile_visibility',)}),
    )

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)


class UserSkillInline(admin.TabularInline):
    model = UserSkill
    extra = 1


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill', 'proficiency_level', 'years_experience', 'created_at')
    list_filter = ('proficiency_level', 'skill__category', 'created_at')
    search_fields = ('user__username', 'skill__name')
    ordering = ('-created_at',)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('user', 'institution_name', 'degree', 'field_of_study', 'is_current', 'start_date', 'end_date')
    list_filter = ('is_current', 'degree', 'created_at')
    search_fields = ('user__username', 'institution_name', 'degree', 'field_of_study')
    ordering = ('-is_current', '-end_date')
    date_hierarchy = 'start_date'


@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ('user', 'job_title', 'company_name', 'is_current', 'start_date', 'end_date')
    list_filter = ('is_current', 'created_at')
    search_fields = ('user__username', 'job_title', 'company_name', 'company_location')
    ordering = ('-is_current', '-end_date')
    date_hierarchy = 'start_date'
    filter_horizontal = ('skills_used',)


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_featured', 'is_public', 'completion_date', 'created_at')
    list_filter = ('is_featured', 'is_public', 'created_at')
    search_fields = ('user__username', 'title', 'description', 'technologies_used')
    ordering = ('-is_featured', '-created_at')
    date_hierarchy = 'completion_date'

    fieldsets = (
        ('Basic Info', {'fields': ('user', 'title', 'description')}),
        ('Media Files', {'fields': ('image', 'file', 'url')}),
        ('Project Details', {'fields': ('project_url', 'completion_date', 'technologies_used')}),
        ('Visibility', {'fields': ('is_featured', 'is_public')}),
    )


@admin.register(UserVerification)
class UserVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'verification_status', 'identity_document_type', 'verified_at', 'verified_by')
    list_filter = ('verification_status', 'identity_document_type', 'verified_at')
    search_fields = ('user__username', 'admin_notes')
    ordering = ('-created_at',)

    actions = ['approve_verification', 'reject_verification']

    def approve_verification(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(
            verification_status='approved',
            verified_at=timezone.now(),
            verified_by=request.user
        )
        self.message_user(request, f'{count} verifications approved.')
    approve_verification.short_description = 'Approve selected verifications'

    def reject_verification(self, request, queryset):
        count = queryset.update(verification_status='rejected')
        self.message_user(request, f'{count} verifications rejected.')
    reject_verification.short_description = 'Reject selected verifications'


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'ip_address', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('user__username', 'description', 'ip_address')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    readonly_fields = ('user', 'activity_type', 'description', 'ip_address', 'user_agent', 'metadata', 'created_at', 'updated_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False