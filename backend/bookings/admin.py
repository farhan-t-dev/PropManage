from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('unit', 'tenant', 'start_date', 'end_date', 'status', 'total_price')
    list_filter = ('status', 'start_date', 'unit__property')
    search_fields = ('unit__title', 'unit__unit_number', 'tenant__username')
