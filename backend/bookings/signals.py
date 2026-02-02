from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
from billing.tasks import generate_invoice_for_booking # Import the task

@receiver(post_save, sender=Booking)
def booking_post_save(sender, instance, created, **kwargs):
    if not created and instance.status == 'confirmed' and instance._original_status != 'confirmed':
        # Status changed to confirmed, and it was not confirmed before
        generate_invoice_for_booking.delay(instance.id)
    
    # Store the original status for the next save
    instance._original_status = instance.status

# We need to save the original status before a change
# This requires overriding the save method or using a pre_save signal.
# I'll use pre_save signal to store the original status.
from django.db.models.signals import pre_save

@receiver(pre_save, sender=Booking)
def booking_pre_save(sender, instance, **kwargs):
    if instance.pk: # Only on existing objects
        try:
            instance._original_status = Booking.objects.get(pk=instance.pk).status
        except Booking.DoesNotExist:
            instance._original_status = None # New object being saved for the first time
    else:
        instance._original_status = None # New object
