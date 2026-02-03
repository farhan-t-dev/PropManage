from django.db import models
from django.conf import settings
from django_fsm import FSMField, transition

class MaintenanceRequest(models.Model):
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('emergency', 'Emergency'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('cancelled', 'Cancelled'),
    )
    CATEGORY_CHOICES = (
        ('plumbing', 'Plumbing'),
        ('electrical', 'Electrical'),
        ('hvac', 'HVAC'),
        ('appliance', 'Appliance'),
        ('structural', 'Structural'),
        ('other', 'Other'),
    )

    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='maintenance_requests')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='maintenance_requests')
    unit = models.ForeignKey('properties.Unit', on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_requests')
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # State Machine Field
    status = FSMField(default='pending', choices=STATUS_CHOICES)
    
    # Operations Data
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Ticket #{self.id} - {self.title} ({self.status})"

    # Transitions
    @transition(field=status, source='pending', target='in_progress')
    def start_work(self):
        pass

    def can_resolve(self):
        return self.cost is not None and self.cost > 0

    @transition(field=status, source='in_progress', target='resolved', conditions=[can_resolve])
    def resolve(self):
        pass

    @transition(field=status, source=['pending', 'in_progress'], target='cancelled')
    def cancel(self):
        pass

class MaintenancePhoto(models.Model):
    request = models.ForeignKey(MaintenanceRequest, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='maintenance/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
