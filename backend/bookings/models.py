from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from datetime import timedelta

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    unit = models.ForeignKey('properties.Unit', on_delete=models.CASCADE, related_name='bookings', null=True)
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date.")
        
        # Complex Overlap Logic with Turnover Buffer
        # We need to ensure that (existing_end + buffer) <= new_start 
        # OR (new_end + buffer) <= existing_start
        
        buffer_days = (self.unit.turnover_buffer_hours / 24)
        buffer_delta = timedelta(days=buffer_days)

        # Check for direct overlaps OR buffer violations
        # A booking overlaps if:
        # existing_start < new_end + buffer AND existing_end + buffer > new_start
        overlapping_bookings = Booking.objects.filter(
            unit=self.unit,
            status__in=['pending', 'confirmed', 'completed'],
            start_date__lt=self.end_date + buffer_delta,
            end_date__gt=self.start_date - buffer_delta
        ).exclude(pk=self.pk)
        
        if overlapping_bookings.exists():
            raise ValidationError(f"This unit is unavailable. Turnover buffer of {self.unit.turnover_buffer_hours}h required.")

    def save(self, *args, **kwargs):
        if not self.total_price and self.start_date and self.end_date:
            days = (self.end_date - self.start_date).days
            self.total_price = self.unit.base_price * days
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.pk} - {self.unit} by {self.tenant}"
