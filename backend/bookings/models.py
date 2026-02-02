from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='bookings')
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError("End date must be after start date.")
        
        # Check for overlaps
        # We check if there are any bookings that start before our end date AND end after our start date
        overlapping_bookings = Booking.objects.filter(
            property=self.property,
            status__in=['pending', 'confirmed'],
            start_date__lt=self.end_date,
            end_date__gt=self.start_date
        ).exclude(pk=self.pk)
        
        if overlapping_bookings.exists():
            raise ValidationError("This property is already booked for these dates.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.pk} - {self.property} by {self.tenant}"
