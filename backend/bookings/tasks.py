from celery import shared_task
import time

@shared_task
def send_booking_confirmation_email(booking_id):
    """
    Simulates sending an email confirmation.
    In a real app, this would use django.core.mail.
    """
    from .models import Booking
    try:
        booking = Booking.objects.get(id=booking_id)
        print(f"Sending confirmation email for Booking {booking_id} to {booking.tenant.email}")
        # Simulate network delay
        time.sleep(5)
        print(f"Email sent successfully for Booking {booking_id}")
        return True
    except Booking.DoesNotExist:
        print(f"Booking {booking_id} does not exist. Task failed.")
        return False
