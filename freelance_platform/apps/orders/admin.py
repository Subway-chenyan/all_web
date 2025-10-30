from django.contrib import admin
from .models import (
    Order, OrderStatusHistory, OrderExtra, OrderRequirement,
    Delivery, OrderMessage, OrderReview, OrderDispute,
    OrderStat, OrderCancellation
)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'client', 'freelancer', 'gig', 'status', 'total_price', 'created_at')
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('order_number', 'client__username', 'freelancer__username', 'gig__title')
    ordering = ('-created_at',)
    readonly_fields = ('order_number',)


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('order', 'old_status', 'new_status', 'changed_by', 'created_at')
    list_filter = ('new_status', 'created_at')
    ordering = ('-created_at',)


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('order', 'title', 'is_final_delivery', 'is_accepted', 'created_at')
    list_filter = ('is_final_delivery', 'is_accepted', 'created_at')
    ordering = ('-created_at',)


@admin.register(OrderDispute)
class OrderDisputeAdmin(admin.ModelAdmin):
    list_display = ('order', 'raised_by', 'dispute_type', 'status', 'created_at')
    list_filter = ('dispute_type', 'status', 'created_at')
    ordering = ('-created_at',)


@admin.register(OrderStat)
class OrderStatAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_orders', 'completed_orders', 'total_revenue', 'average_order_value')
    ordering = ('-date',)
    date_hierarchy = 'date'

# Register other models
admin.site.register(OrderExtra)
admin.site.register(OrderRequirement)
admin.site.register(OrderMessage)
admin.site.register(OrderReview)
admin.site.register(OrderCancellation)