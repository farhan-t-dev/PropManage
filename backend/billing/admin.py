from django.contrib import admin
from .models import Invoice, Transaction

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'status', 'payout_status', 'due_date')
    list_filter = ('status', 'payout_status', 'issue_date')
    search_fields = ('booking__unit__title', 'booking__tenant__username')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'transaction_type', 'amount', 'user', 'is_verified', 'created_at')
    list_filter = ('transaction_type', 'is_verified', 'created_at')
    search_fields = ('description', 'user__username')