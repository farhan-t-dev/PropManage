from celery import shared_task
from datetime import timedelta
from django.utils import timezone

@shared_task
def generate_invoice_for_booking(booking_id):
    """
    Generates an invoice for a given booking.
    """
    from bookings.models import Booking
    from billing.models import Invoice

    try:
        booking = Booking.objects.get(id=booking_id)

        # Check if an invoice already exists for this booking to prevent duplicates
        if hasattr(booking, 'invoice'):
            print(f"Invoice for booking {booking_id} already exists.")
            return False

        # Calculate amount based on property base price and booking duration
        # Example: daily rate * number of nights
        duration = (booking.end_date - booking.start_date).days
        amount = booking.property.base_price * duration

        # Due date could be, for example, 7 days from invoice issue date
        due_date = timezone.now().date() + timedelta(days=7)

        invoice = Invoice.objects.create(
            booking=booking,
            amount=amount,
            due_date=due_date,
            status='pending' # Initial status
        )
        print(f"Invoice {invoice.id} created for booking {booking_id} with amount {amount}.")
        return True
    except Booking.DoesNotExist:
        print(f"Booking {booking_id} does not exist. Cannot generate invoice.")
        return False
    except Exception as e:
        print(f"Error generating invoice for booking {booking_id}: {e}")
        return False