from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Property, Unit
from decimal import Decimal

User = get_user_model()

class PropertyModelTest(TestCase):
    def setUp(self):
        self.landlord = User.objects.create_user(
            username='landlord', 
            password='password123',
            role='landlord'
        )
        self.property = Property.objects.create(
            owner=self.landlord,
            title='Sunset Villa',
            description='A beautiful villa.',
            address='123 Ocean Dr'
        )
        self.unit = Unit.objects.create(
            property=self.property,
            title='Suite 1',
            unit_number='101',
            description='Luxury suite',
            base_price=Decimal('150.00'),
            features={'pool': True, 'wifi': True}
        )

    def test_property_creation(self):
        """Test that a property is created correctly."""
        self.assertEqual(self.property.title, 'Sunset Villa')
        self.assertEqual(self.property.owner, self.landlord)

    def test_unit_creation(self):
        """Test that a unit is created correctly with price and features."""
        self.assertEqual(self.unit.property, self.property)
        self.assertEqual(self.unit.base_price, Decimal('150.00'))
        self.assertTrue(self.unit.features['pool'])

    def test_string_representation(self):
        self.assertEqual(str(self.property), 'Sunset Villa')
        self.assertEqual(str(self.unit), 'Sunset Villa - 101')
