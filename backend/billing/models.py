from django.db import models

class Invoice(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    )

    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='invoice')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    # Track landlord payout
    payout_status = models.CharField(max_length=20, default='pending', choices=(
        ('pending', 'Pending'),
        ('processed', 'Processed'),
    ))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Invoices"

    def __str__(self):
        return f"Invoice for Booking {self.booking.id} - {self.amount}"

class Transaction(models.Model):
    """General ledger for all financial movements."""
    TYPE_CHOICES = (
        ('payment', 'Tenant Payment'),
        ('payout', 'Landlord Payout'),
        ('fee', 'Management Fee'),
        ('refund', 'Refund'),
    )
    
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, related_name='transactions')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type.upper()} - {self.amount}"
