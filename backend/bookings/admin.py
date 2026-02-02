from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('property', 'tenant', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'start_date')
    search_fields = ('property__title', 'tenant__username')
