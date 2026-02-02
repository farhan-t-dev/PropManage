from rest_framework import serializers
from .models import MaintenanceRequest, MaintenancePhoto

class MaintenancePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenancePhoto
        fields = ('id', 'image', 'uploaded_at')

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    photos = MaintenancePhotoSerializer(many=True, read_only=True)
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )

    class Meta:
        model = MaintenanceRequest
        fields = '__all__'
        read_only_fields = ('tenant', 'created_at', 'updated_at', 'resolved_at')

    def create(self, validated_data):
        uploaded_photos = validated_data.pop('uploaded_photos', [])
        request = MaintenanceRequest.objects.create(**validated_data)
        for photo in uploaded_photos:
            MaintenancePhoto.objects.create(request=request, image=photo)
        return request
