from django.urls import path
from . import views

app_name = 'gigs'

urlpatterns = [
    # 分类相关
    path('categories/', views.CategoryListAPIView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', views.CategoryDetailAPIView.as_view(), name='category-detail'),

    # 服务相关
    path('', views.GigListAPIView.as_view(), name='gig-list'),
    path('<slug:slug>/', views.GigDetailAPIView.as_view(), name='gig-detail'),
    path('create/', views.GigCreateAPIView.as_view(), name='gig-create'),
    path('<slug:slug>/update/', views.GigUpdateAPIView.as_view(), name='gig-update'),
    path('<slug:slug>/delete/', views.GigDeleteAPIView.as_view(), name='gig-delete'),

    # 自由职业者相关
    path('my-gigs/', views.FreelancerGigListAPIView.as_view(), name='freelancer-gigs'),
    path('stats/', views.freelancer_stats, name='freelancer-stats'),

    # 收藏相关
    path('<slug:slug>/favorite/', views.toggle_gig_favorite, name='toggle-favorite'),
    path('favorites/', views.user_favorites, name='user-favorites'),

    # 举报相关
    path('<slug:slug>/report/', views.report_gig, name='report-gig'),

    # 搜索相关
    path('search/suggestions/', views.search_suggestions, name='search-suggestions'),

    # 分析相关
    path('<slug:slug>/analytics/', views.gig_analytics, name='gig-analytics'),
]
