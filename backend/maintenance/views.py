from rest_framework import viewsets, permissions
from .models import MaintenanceRequest
from .serializers import MaintenanceRequestSerializer
from django.db.models import Q

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return MaintenanceRequest.objects.all()
        # Tenants see their own, Landlords see for their properties
        return MaintenanceRequest.objects.filter(
            Q(tenant=user) | Q(property__owner=user)
        )

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user)
