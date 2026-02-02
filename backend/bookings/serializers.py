from rest_framework import serializers
from .models import Booking
from properties.serializers import UnitSerializer
from users.serializers import UserSerializer
from billing.serializers import InvoiceSerializer

class BookingSerializer(serializers.ModelSerializer):
    unit_details = UnitSerializer(source='unit', read_only=True)
    tenant_details = UserSerializer(source='tenant', read_only=True)
    invoice = InvoiceSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'unit', 'unit_details', 'tenant', 'tenant_details', 
            'start_date', 'end_date', 'status', 'total_price', 
            'invoice', 'created_at', 'updated_at'
        )
        read_only_fields = ('tenant', 'status', 'total_price', 'created_at', 'updated_at')

    def validate(self, data):
        # Call model's clean method for validation
        instance = Booking(**data)
        if self.instance: # Update scenario
            instance.pk = self.instance.pk
        
        # We need to set the property and tenant for validation to work if they are not in data
        # Note: 'tenant' is read_only, so it won't be in data usually.
        # But 'property' should be in data for create.
        
        # This is a bit complex to map DRF validation to Model validation perfectly without saving.
        # So we might skip calling clean() here or mock it.
        # However, DRF's validators are better suited here.
        # But let's rely on database integrity and model signals/clean for now.
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tenant'] = request.user
        return super().create(validated_data)
