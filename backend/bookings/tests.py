from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from datetime import date, timedelta
from properties.models import Property
from .models import Booking
from .services import is_property_available, create_booking

User = get_user_model()

class BookingLogicTest(TestCase):
    def setUp(self):
        self.landlord = User.objects.create_user(username='landlord', password='pass', role='landlord')
        self.tenant = User.objects.create_user(username='tenant', password='pass', role='tenant')
        self.property = Property.objects.create(
            owner=self.landlord,
            title='Test Property',
            address='Test Addr',
            base_price=100.00
        )
        
        # Create an existing booking: Feb 10 to Feb 15
        self.existing_booking = Booking.objects.create(
            property=self.property,
            tenant=self.tenant,
            start_date=date(2026, 2, 10),
            end_date=date(2026, 2, 15),
            status='confirmed'
        )

    def test_availability_no_overlap(self):
        # Before existing
        self.assertTrue(is_property_available(self.property, date(2026, 2, 1), date(2026, 2, 9)))
        # After existing
        self.assertTrue(is_property_available(self.property, date(2026, 2, 16), date(2026, 2, 20)))
        # Adjacent (ends when other starts)
        self.assertTrue(is_property_available(self.property, date(2026, 2, 5), date(2026, 2, 10)))
        # Adjacent (starts when other ends)
        self.assertTrue(is_property_available(self.property, date(2026, 2, 15), date(2026, 2, 20)))

    def test_availability_overlap(self):
        # Completely inside
        self.assertFalse(is_property_available(self.property, date(2026, 2, 11), date(2026, 2, 14)))
        # Overlap start
        self.assertFalse(is_property_available(self.property, date(2026, 2, 8), date(2026, 2, 12)))
        # Overlap end
        self.assertFalse(is_property_available(self.property, date(2026, 2, 14), date(2026, 2, 18)))
        # Identical
        self.assertFalse(is_property_available(self.property, date(2026, 2, 10), date(2026, 2, 15)))
        # Encompassing
        self.assertFalse(is_property_available(self.property, date(2026, 2, 5), date(2026, 2, 20)))

    def test_create_booking_service_success(self):
        new_booking = create_booking(
            user=self.tenant,
            property_obj=self.property,
            start_date=date(2026, 2, 20),
            end_date=date(2026, 2, 25)
        )
        self.assertEqual(new_booking.status, 'pending')
        self.assertEqual(Booking.objects.count(), 2)

    def test_create_booking_service_fail_overlap(self):
        with self.assertRaises(ValidationError):
            create_booking(
                user=self.tenant,
                property_obj=self.property,
                start_date=date(2026, 2, 12),
                end_date=date(2026, 2, 18)
            )

    def test_cancelled_bookings_do_not_block_availability(self):
        self.existing_booking.status = 'cancelled'
        self.existing_booking.save()
        self.assertTrue(is_property_available(self.property, date(2026, 2, 10), date(2026, 2, 15)))
