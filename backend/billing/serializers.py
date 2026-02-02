from rest_framework import serializers
from .models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'booking', 'amount', 'issue_date', 'due_date', 'status', 'payout_status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'booking', 'amount', 'issue_date', 'payout_status', 'created_at', 'updated_at']
