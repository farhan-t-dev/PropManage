from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Property
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
            address='123 Ocean Dr',
            base_price=Decimal('150.00'),
            features={'pool': True, 'wifi': True}
        )

    def test_property_creation(self):
        """Test that a property is created correctly."""
        self.assertEqual(self.property.title, 'Sunset Villa')
        self.assertEqual(self.property.owner, self.landlord)
        self.assertEqual(self.property.base_price, Decimal('150.00'))
        self.assertTrue(self.property.features['pool'])

    def test_string_representation(self):
        self.assertEqual(str(self.property), 'Sunset Villa')
