from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from properties.models import Property
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial properties and users'

    def handle(self, *args, **kwargs):
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
                'description': 'A beautiful industrial loft in the heart of the city. Features high ceilings and exposed brick.',
                'address': '456 Main St, Metropolis',
                'base_price': Decimal('120.00'),
                'features': {'wifi': True, 'kitchen': True, 'parking': False}
            },
            {
                'title': 'Cozy Seaside Cottage',
                'description': 'Wake up to the sound of waves. This small cottage is perfect for a weekend getaway.',
                'address': '101 Beach Rd, Seaside',
                'base_price': Decimal('200.00'),
                'features': {'wifi': True, 'kitchen': True, 'view': 'Ocean'}
            },
            {
                'title': 'Quiet Suburban Home',
                'description': 'Spacious family home with a large backyard. Located in a safe and quiet neighborhood.',
                'address': '789 Oak Ave, Suburbia',
                'base_price': Decimal('150.00'),
                'features': {'wifi': True, 'garden': True, 'parking': True}
            }
        ]

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
            if p_created:
                self.stdout.write(f"Created property: {p_data['title']}")

        self.stdout.write(self.style.SUCCESS('Successfully seeded data!'))
