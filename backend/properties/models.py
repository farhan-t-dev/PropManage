from django.db import models
from django.conf import settings

class Property(models.Model):
    """Container for multiple units (e.g., an Apartment Building or a Resort)."""
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=255)
    description = models.TextField()
    address = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Properties"

    def __str__(self):
        return self.title

class Unit(models.Model):
    """The actual bookable entity (e.g., Room 101, Apartment 4B)."""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='units')
    unit_number = models.CharField(max_length=50)
    title = models.CharField(max_length=255) # e.g. "Luxury Suite with Ocean View"
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    features = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Turnover buffer (hours) - Business Logic requirement
    turnover_buffer_hours = models.PositiveIntegerField(default=24)

    def __str__(self):
        return f"{self.property.title} - {self.unit_number}"

class PropertyImage(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='images', null=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    image = models.ImageField(upload_to='properties/')
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Document(models.Model):
    """Secure vault for leases, IDs, etc."""
    CATEGORY_CHOICES = (
        ('lease', 'Lease Agreement'),
        ('id', 'Identification'),
        ('contract', 'Contract'),
        ('other', 'Other'),
    )
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
