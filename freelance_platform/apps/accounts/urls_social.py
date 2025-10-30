"""
URL configuration for social authentication endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views_social

app_name = 'accounts_social'

urlpatterns = [
    # Social authentication endpoints
    path('auth/start/', views_social.SocialAuthStartView.as_view(), name='social-auth-start'),
    path('auth/callback/', views_social.SocialAuthCallbackView.as_view(), name='social-auth-callback'),

    # Social account management
    path('accounts/', views_social.SocialAccountListView.as_view(), name='social-account-list'),
    path('accounts/link/', views_social.link_social_account_view, name='social-account-link'),
    path('accounts/<str:provider>/disconnect/', views_social.SocialAccountDisconnectView.as_view(), name='social-account-disconnect'),
    path('accounts/<str:provider>/sync/', views_social.SocialProfileSyncView.as_view(), name='social-profile-sync'),

    # Utility endpoints
    path('providers/', views_social.social_providers_view, name='social-providers'),
]