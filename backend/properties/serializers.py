from rest_framework import serializers
from .models import Property, PropertyImage, Unit
from users.serializers import UserSerializer

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'is_main')

class UnitSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    property_title = serializers.CharField(source='property.title', read_only=True)

    class Meta:
        model = Unit
        fields = '__all__'

class PropertySerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source='owner', read_only=True)
    units = UnitSerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Property
        fields = (
            'id', 'owner', 'owner_details', 'title', 'description', 
            'address', 'features', 'base_price', 'is_active', 
            'images', 'uploaded_images', 'created_at', 'updated_at'
        )
        read_only_fields = ('owner', 'created_at', 'updated_at')

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        property_obj = Property.objects.create(**validated_data)
        for image in uploaded_images:
            PropertyImage.objects.create(property=property_obj, image=image)
        return property_obj
