from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from properties.models import Property
from bookings.models import Booking
from bookings.services import is_property_available
from billing.models import Invoice
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial properties, users, and historical bookings/invoices'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing bookings, invoices, and properties before seeding',
        )

    def handle(self, *args, **kwargs):
        if kwargs['clear']:
            self.stdout.write('Clearing existing data...')
            Invoice.objects.all().delete()
            Booking.objects.all().delete()
            Property.objects.all().delete()
            self.stdout.write('Data cleared.')

        self.stdout.write('Seeding data...')

        # 1. Create Landlord
        landlord, created = User.objects.get_or_create(
            username='landlord_jane',
            defaults={
                'email': 'jane@example.com',
                'role': 'landlord',
                'first_name': 'Jane',
                'last_name': 'Host'
            }
        )
        if created:
            landlord.set_password('pass123')
            landlord.save()
            self.stdout.write('Created landlord: landlord_jane')

        # 2. Create Tenant
        tenant, created = User.objects.get_or_create(
            username='tenant_bob',
            defaults={
                'email': 'bob@example.com',
                'role': 'tenant',
                'first_name': 'Bob',
                'last_name': 'Renter'
            }
        )
        if created:
            tenant.set_password('pass123')
            tenant.save()
            self.stdout.write('Created tenant: tenant_bob')

        # 3. Create Properties
        properties_data = [
            {
                'title': 'Modern Downtown Loft',
                'description': 'A beautiful industrial loft in the heart of the city.',
                'address': '456 Main St, Metropolis',
                'base_price': Decimal('120.00'),
                'features': {'wifi': True, 'kitchen': True, 'parking': False}
            },
            {
                'title': 'Cozy Seaside Cottage',
                'description': 'Wake up to the sound of waves.',
                'address': '101 Beach Rd, Seaside',
                'base_price': Decimal('200.00'),
                'features': {'wifi': True, 'kitchen': True, 'view': 'Ocean'}
            }
        ]

        props = []
        for p_data in properties_data:
            prop, p_created = Property.objects.get_or_create(
                title=p_data['title'],
                defaults={
                    'owner': landlord,
                    'description': p_data['description'],
                    'address': p_data['address'],
                    'base_price': p_data['base_price'],
                    'features': p_data['features']
                }
            )
            props.append(prop)
            if p_created:
                self.stdout.write(f"Created property: {p_data['title']}")

        # 4. Create Historical Bookings & Invoices for Charting
        self.stdout.write('Generating historical bookings...')
        today = date.today()
        
        # Generate 6 months of data
        for i in range(6):
            # Calculate a stable start of the month to avoid shifting dates on subsequent runs
            month_start = (today - timedelta(days=31 * i)).replace(day=1)
            
            for prop in props:
                start_date = month_start + timedelta(days=5)
                end_date = month_start + timedelta(days=10)
                
                # Check if this exact booking already exists
                existing_booking = Booking.objects.filter(
                    property=prop,
                    tenant=tenant,
                    start_date=start_date,
                    end_date=end_date
                ).first()

                if not existing_booking:
                    # Check if the property is available (not overlapping with OTHER bookings)
                    if is_property_available(prop, start_date, end_date):
                        booking = Booking.objects.create(
                            property=prop,
                            tenant=tenant,
                            start_date=start_date,
                            end_date=end_date,
                            status='confirmed'
                        )
                        # Manually create paid invoices for these historical bookings
                        duration = (end_date - start_date).days
                        amount = prop.base_price * duration
                        Invoice.objects.get_or_create(
                            booking=booking,
                            defaults={
                                'amount': amount,
                                'due_date': start_date,
                                'status': 'paid'
                            }
                        )
                    else:
                        self.stdout.write(f"Skipping overlapping booking for {prop.title} on {start_date}")
                else:
                    # If it exists, ensure it has an invoice
                    if not hasattr(existing_booking, 'invoice'):
                        duration = (end_date - start_date).days
                        amount = prop.base_price * duration
                        Invoice.objects.create(
                            booking=existing_booking,
                            amount=amount,
                            due_date=start_date,
                            status='paid'
                        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded data with history!'))
