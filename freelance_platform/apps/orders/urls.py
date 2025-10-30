"""
订单管理URL配置

这个模块定义了订单处理系统的所有URL路由，
包括订单CRUD、状态管理、交付、争议等功能。
"""

from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    # 订单基础操作
    path('', views.OrderListAPIView.as_view(), name='order-list'),
    path('create/', views.OrderCreateAPIView.as_view(), name='order-create'),
    path('<slug:slug>/', views.OrderDetailAPIView.as_view(), name='order-detail'),
    path('<slug:slug>/status/', views.OrderStatusUpdateAPIView.as_view(), name='order-status-update'),

    # 订单附加功能
    path('<slug:slug>/extras/', views.OrderExtraListCreateAPIView.as_view(), name='order-extras'),
    path('<slug:slug>/requirements/', views.OrderRequirementListCreateAPIView.as_view(), name='order-requirements'),
    path('<slug:slug>/deliveries/', views.OrderDeliveryListCreateAPIView.as_view(), name='order-deliveries'),
    path('<slug:slug>/messages/', views.OrderMessageListCreateAPIView.as_view(), name='order-messages'),

    # 订单操作
    path('<slug:slug>/cancel/', views.OrderCancellationAPIView.as_view(), name='order-cancel'),
    path('<slug:slug>/dispute/', views.OrderDisputeCreateAPIView.as_view(), name='order-dispute'),
    path('<slug:slug>/tracking/', views.OrderTrackingAPIView.as_view(), name='order-tracking'),
    path('<slug:slug>/confirm-delivery/', views.confirm_delivery, name='confirm-delivery'),
    path('<slug:slug>/request-revision/', views.request_revision, name='request-revision'),

    # 统计和搜索
    path('stats/', views.order_stats, name='order-stats'),
    path('earnings/', views.freelancer_earnings, name='freelancer-earnings'),
    path('search/', views.search_orders, name='search-orders'),
]
