from django.urls import path
from . import views

app_name = 'social_accounts'

urlpatterns = [
    # 社交登录相关
    path('login/', views.SocialLoginView.as_view(), name='social-login'),
    path('login/providers/', views.social_login_providers, name='social-login-providers'),
    path('login/callback/', views.SocialLoginCallbackView.as_view(), name='social-login-callback'),

    # 社交账号管理
    path('accounts/', views.UserSocialAccountsView.as_view(), name='user-social-accounts'),
    path('bind/', views.SocialAccountBindView.as_view(), name='social-account-bind'),
    path('token/refresh/', views.SocialTokenRefreshView.as_view(), name='social-token-refresh'),

    # 社交用户注册完成
    path('registration/complete/', views.SocialRegistrationCompleteView.as_view(), name='social-registration-complete'),
]