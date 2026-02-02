from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from .services import generate_invoice_pdf

@shared_task
def generate_invoice_for_booking(booking_id):
    """
    Generates an invoice record and then triggers the PDF generation.
    """
    from bookings.models import Booking
    from billing.models import Invoice

    try:
        booking = Booking.objects.select_related('unit').get(id=booking_id)

        if hasattr(booking, 'invoice'):
            return False

        duration = (booking.end_date - booking.start_date).days
        amount = booking.unit.base_price * duration
        due_date = timezone.now().date() + timedelta(days=7)

        invoice = Invoice.objects.create(
            booking=booking,
            amount=amount,
            due_date=due_date,
            status='pending'
        )
        
        # Trigger PDF generation
        generate_invoice_pdf_task.delay(invoice.id)
        
        return True
    except Exception as e:
        print(f"Task Error: {e}")
        return False

@shared_task
def generate_invoice_pdf_task(invoice_id):
    return generate_invoice_pdf(invoice_id)
