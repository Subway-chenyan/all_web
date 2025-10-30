from django.contrib import admin
from .models import (
    Wallet, PaymentMethod, Transaction, Escrow, Withdrawal,
    PaymentRefund, PaymentStat, PayoutBatch
)


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'frozen_balance', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('user', 'created_at')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'user', 'transaction_type', 'amount', 'status', 'created_at')
    list_filter = ('transaction_type', 'status', 'provider', 'created_at')
    search_fields = ('transaction_id', 'user__username', 'order__order_number')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    readonly_fields = ('transaction_id', 'created_at')


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('user', 'method_type', 'provider', 'is_default', 'is_active', 'created_at')
    list_filter = ('method_type', 'provider', 'is_default', 'is_active', 'created_at')
    search_fields = ('user__username', 'provider', 'account_identifier')
    ordering = ('-created_at',)


@admin.register(Escrow)
class EscrowAdmin(admin.ModelAdmin):
    list_display = ('order', 'client', 'freelancer', 'status', 'funded_at', 'auto_release_date')
    list_filter = ('status', 'funded_at', 'auto_release_date')
    search_fields = ('order__order_number', 'client__username', 'freelancer__username')
    ordering = ('-created_at',)


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'withdrawal_method', 'status', 'created_at')
    list_filter = ('withdrawal_method', 'status', 'created_at')
    search_fields = ('user__username', 'withdrawal_method', 'reference_number')
    ordering = ('-created_at',)


@admin.register(PaymentStat)
class PaymentStatAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_transactions', 'total_volume', 'successful_transactions', 'failed_transactions')
    ordering = ('-date',)
    date_hierarchy = 'date'

# Register other models
admin.site.register(PaymentRefund)
admin.site.register(PayoutBatch)