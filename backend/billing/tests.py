from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from properties.models import Property, Unit
from bookings.models import Booking
from billing.models import Invoice
from billing.tasks import generate_invoice_for_booking
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class BillingTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.landlord = User.objects.create_user(username='landlord', password='pass', role='landlord')
        self.tenant = User.objects.create_user(username='tenant', password='pass', role='tenant')
        self.property = Property.objects.create(
            owner=self.landlord,
            title='Test Property',
            address='Test Addr'
        )
        self.unit = Unit.objects.create(
            property=self.property,
            title='Test Unit',
            unit_number='101',
            base_price=100.00,
            description='Test Desc'
        )
        self.booking = Booking.objects.create(
            unit=self.unit,
            tenant=self.tenant,
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=3),
            status='pending',
            total_price=200.00
        )

    def test_invoice_generated_on_confirmation(self):
        # Initial state: no invoice
        self.assertFalse(hasattr(self.booking, 'invoice'))

        # Confirm booking
        self.booking.status = 'confirmed'
        self.booking.save()

        # In a real async environment, we'd wait for celery. 
        # Here we can call the task directly or rely on the fact that we're testing the logic.
        generate_invoice_for_booking(self.booking.id)
        
        self.booking.refresh_from_db()
        self.assertTrue(hasattr(self.booking, 'invoice'))
        self.assertEqual(self.booking.invoice.amount, 200.00) # 2 nights * 100
        self.assertEqual(self.booking.invoice.status, 'pending')

    def test_pay_invoice_api(self):
        # Setup invoice
        invoice = Invoice.objects.create(
            booking=self.booking,
            amount=200.00,
            due_date=date.today() + timedelta(days=7),
            status='pending'
        )

        self.client.force_authenticate(user=self.tenant)
        response = self.client.post(f'/api/v1/billing/invoices/{invoice.id}/pay/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, 'paid')

    def test_landlord_cannot_pay_invoice(self):
        invoice = Invoice.objects.create(
            booking=self.booking,
            amount=200.00,
            due_date=date.today() + timedelta(days=7),
            status='pending'
        )

        self.client.force_authenticate(user=self.landlord)
        response = self.client.post(f'/api/v1/billing/invoices/{invoice.id}/pay/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, 'pending')