from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Booking
from .tasks import send_booking_confirmation_email

def is_property_available(property_obj, start_date, end_date, exclude_booking_id=None):
    """
    Business logic to check if a property can be booked for a given date range.
    """
    if start_date >= end_date:
        return False

    overlapping_bookings = Booking.objects.filter(
        property=property_obj,
        status__in=['pending', 'confirmed'],
        start_date__lt=end_date,
        end_date__gt=start_date
    )

    if exclude_booking_id:
        overlapping_bookings = overlapping_bookings.exclude(pk=exclude_booking_id)

    return not overlapping_bookings.exists()

@transaction.atomic
def create_booking(user, property_obj, start_date, end_date):
    """
    Safely creates a booking after verifying availability within a database transaction.
    """
    if not is_property_available(property_obj, start_date, end_date):
        raise ValidationError("The property is not available for the selected dates.")

    booking = Booking.objects.create(
        tenant=user,
        property=property_obj,
        start_date=start_date,
        end_date=end_date,
        status='pending'
    )
    
    # Trigger background task
    # We use on_commit to ensure the task is only sent if the transaction succeeds
    transaction.on_commit(lambda: send_booking_confirmation_email.delay(booking.id))
    
    return booking
