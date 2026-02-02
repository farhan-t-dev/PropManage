from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from properties.models import Property, Unit
from bookings.models import Booking
from billing.models import Invoice, Transaction
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Elite seeding: Creates Multi-property, Multi-unit data with ledger history'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true')

    def handle(self, *args, **kwargs):
        if kwargs['clear']:
            self.stdout.write('Clearing old data...')
            Transaction.objects.all().delete()
            Invoice.objects.all().delete()
            Booking.objects.all().delete()
            Unit.objects.all().delete()
            Property.objects.all().delete()

        # 1. Users
        landlord, _ = User.objects.get_or_create(username='landlord_pro', defaults={'role': 'landlord', 'email': 'pro@prop.com'})
        landlord.set_password('pass123')
        landlord.save()

        tenant, _ = User.objects.get_or_create(username='tenant_alice', defaults={'role': 'tenant', 'email': 'alice@gmail.com'})
        tenant.set_password('pass123')
        tenant.save()

        # 2. Properties & Units
        p1 = Property.objects.create(owner=landlord, title='Metropolis Heights', address='100 Skyline Blvd', description='Elite luxury apartments.')
        p2 = Property.objects.create(owner=landlord, title='Oceanic Resort', address='500 Beach Dr', description='Seaside serenity.')

        units = [
            Unit.objects.create(property=p1, unit_number='101A', title='Executive Studio', base_price=Decimal('150.00'), description='High floor view.'),
            Unit.objects.create(property=p1, unit_number='202B', title='Family Penthouse', base_price=Decimal('450.00'), description='Spacious 3-bedroom.'),
            Unit.objects.create(property=p2, unit_number='S1', title='Sunset Villa', base_price=Decimal('300.00'), description='Private pool access.'),
        ]

        # 3. Historical Ledger Data (Last 4 months)
        today = date.today()
        self.stdout.write('Generating ledger history...')
        
        for i in range(4):
            month_start = (today - timedelta(days=30 * (i+1))).replace(day=1)
            for idx, unit in enumerate(units):
                start = month_start + timedelta(days=2 + idx)
                end = start + timedelta(days=5)
                
                # Create Booking
                booking = Booking.objects.create(
                    unit=unit, tenant=tenant, start_date=start, end_date=end,
                    status='completed', total_price=unit.base_price * 5
                )
                
                # Create Paid Invoice
                invoice = Invoice.objects.create(
                    booking=booking, amount=booking.total_price,
                    due_date=start, status='paid'
                )
                
                # Create Ledger Entries
                Transaction.objects.create(
                    invoice=invoice, user=tenant, amount=invoice.amount,
                    transaction_type='payment', description=f'Payment for {unit.unit_number}',
                    is_verified=True
                )
                
                # Payout 90% to Landlord (10% fee)
                Transaction.objects.create(
                    invoice=invoice, user=landlord, amount=invoice.amount * Decimal('0.9'),
                    transaction_type='payout', description=f'Earnings for {unit.unit_number}',
                    is_verified=True
                )

        self.stdout.write(self.style.SUCCESS('Elite Seed Complete. Platform is ready for professional demo.'))