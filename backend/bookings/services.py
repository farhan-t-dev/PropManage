from django.db import transaction
from django.core.exceptions import ValidationError
from datetime import timedelta
from .models import Booking
from .tasks import send_booking_confirmation_email

def calculate_booking_price(unit, start_date, end_date):
    """
    Advanced pricing logic. 
    In a real app, this would check a 'PricingRule' model.
    Here we'll implement a 'Senior' example: 20% surge during Peak Season (June-August).
    """
    days = (end_date - start_date).days
    base_price = unit.base_price * days
    
    # Peak Season Surge (June, July, August)
    if start_date.month in [6, 7, 8]:
        return base_price * 1.20
    
    return base_price

def is_unit_available(unit, start_date, end_date, exclude_booking_id=None):
    """
    Check availability considering the Turnover Buffer.
    """
    if start_date >= end_date:
        return False

    buffer_days = (unit.turnover_buffer_hours / 24)
    buffer_delta = timedelta(days=buffer_days)

    overlapping_bookings = Booking.objects.filter(
        unit=unit,
        status__in=['pending', 'confirmed', 'completed'],
        start_date__lt=end_date + buffer_delta,
        end_date__gt=start_date - buffer_delta
    )

    if exclude_booking_id:
        overlapping_bookings = overlapping_bookings.exclude(pk=exclude_booking_id)

    return not overlapping_bookings.exists()

@transaction.atomic
def create_booking(user, unit, start_date, end_date):
    """
    Safely creates a booking with concurrency protection.
    """
    # Use select_for_update on the unit to prevent race conditions during availability check
    from properties.models import Unit
    Unit.objects.select_for_update().get(pk=unit.pk)

    if not is_unit_available(unit, start_date, end_date):
        raise ValidationError(f"This unit is not available for these dates (Turnover buffer of {unit.turnover_buffer_hours}h required).")

    total_price = calculate_booking_price(unit, start_date, end_date)

    booking = Booking.objects.create(
        tenant=user,
        unit=unit,
        start_date=start_date,
        end_date=end_date,
        total_price=total_price,
        status='pending'
    )
    
    transaction.on_commit(lambda: send_booking_confirmation_email.delay(booking.id))
    
    return booking