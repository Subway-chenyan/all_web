"""
评价系统URL配置

这个模块定义了评价系统的所有URL路由，包括：
- 评价管理
- 评分统计
- 评价报告和审核
- 评价模板和邀请
"""

from django.urls import path
from . import views

app_name = 'reviews'

urlpatterns = [
    # 评价管理
    path('', views.ReviewListAPIView.as_view(), name='review-list'),
    path('create/', views.ReviewCreateAPIView.as_view(), name='review-create'),
    path('<int:pk>/', views.ReviewDetailAPIView.as_view(), name='review-detail'),
    path('<int:pk>/update/', views.ReviewUpdateAPIView.as_view(), name='review-update'),
    path('<int:pk>/respond/', views.ReviewResponseAPIView.as_view(), name='review-response'),

    # 评价互动
    path('<int:pk>/helpful/', views.ReviewHelpfulCreateAPIView.as_view(), name='review-helpful-create'),
    path('helpful/<int:review_id>/', views.ReviewHelpfulDestroyAPIView.as_view(), name='review-helpful-destroy'),
    path('<int:pk>/report/', views.ReviewReportCreateAPIView.as_view(), name='review-report'),

    # 用户和服务评价
    path('users/<int:user_id>/', views.UserReviewListAPIView.as_view(), name='user-reviews'),
    path('users/<int:user_id>/stats/', views.get_user_review_stats, name='user-review-stats'),
    path('gigs/<int:gig_id>/', views.GigReviewListAPIView.as_view(), name='gig-reviews'),
    path('gigs/<int:gig_id>/stats/', views.get_gig_review_stats, name='gig-review-stats'),

    # 用户评分
    path('ratings/<int:user_id>/', views.UserRatingAPIView.as_view(), name='user-rating'),

    # 评价邀请
    path('invitations/', views.ReviewInvitationListAPIView.as_view(), name='review-invitation-list'),
    path('invitations/send/', views.send_review_invitations, name='send-review-invitations'),

    # 评价模板
    path('templates/', views.ReviewTemplateListAPIView.as_view(), name='review-template-list'),

    # 评价审核
    path('<int:pk>/moderate/', views.ReviewModerationAPIView.as_view(), name='review-moderate'),

    # 搜索和分析
    path('search/', views.review_search, name='review-search'),
    path('analytics/', views.review_analytics, name='review-analytics'),
]
