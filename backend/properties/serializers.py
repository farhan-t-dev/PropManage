from rest_framework import serializers
from .models import Property
from users.serializers import UserSerializer

class PropertySerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source='owner', read_only=True)

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')

    def create(self, validated_data):
        # Assign current user as owner
        request = self.context.get('request')
        validated_data['owner'] = request.user
        return super().create(validated_data)
