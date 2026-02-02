from django.contrib import admin
from .models import MaintenanceRequest, MaintenancePhoto

class MaintenancePhotoInline(admin.TabularInline):
    model = MaintenancePhoto
    extra = 1

@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'property', 'unit', 'tenant', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority', 'category', 'property')
    search_fields = ('title', 'description', 'tenant__username')
    inlines = [MaintenancePhotoInline]
