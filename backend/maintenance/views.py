from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MaintenanceRequest
from .serializers import MaintenanceRequestSerializer
from django.db.models import Q
from notifications.utils import send_notification

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
        instance = serializer.save(tenant=self.request.user)
        # Notify Landlord
        send_notification(instance.property.owner.id, f"New ticket: {instance.title}", "info")

    @action(detail=True, methods=['post'])
    def start_work(self, request, pk=None):
        instance = self.get_object()
        if request.user.role != 'landlord':
            return Response({"detail": "Only landlords can start work."}, status=403)
        
        try:
            instance.start_work()
            instance.save()
            send_notification(instance.tenant.id, f"Work started on: {instance.title}", "info")
            return Response(self.get_serializer(instance).data)
        except Exception as e:
            return Response({"detail": "Transition not allowed."}, status=400)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        instance = self.get_object()
        if request.user.role != 'landlord':
            return Response({"detail": "Only landlords can resolve tickets."}, status=403)
        
        cost = request.data.get('cost')
        if cost:
            instance.cost = cost
            
        try:
            instance.resolve()
            instance.save()
            send_notification(instance.tenant.id, f"Ticket resolved: {instance.title}", "success")
            return Response(self.get_serializer(instance).data)
        except Exception as e:
            return Response({"detail": "Cannot resolve: Cost required or invalid state."}, status=400)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        instance = self.get_object()
        # Tenant can cancel their own, Landlord can cancel any in their property
        is_owner = instance.tenant == request.user
        is_landlord = request.user.role == 'landlord' and instance.property.owner == request.user
        
        if not (is_owner or is_landlord):
            return Response({"detail": "Permission denied."}, status=403)

        try:
            instance.cancel()
            instance.save()
            
            if is_owner:
                send_notification(instance.property.owner.id, f"Ticket cancelled by tenant: {instance.title}", "warning")
            else:
                send_notification(instance.tenant.id, f"Ticket cancelled by landlord: {instance.title}", "warning")
                
            return Response(self.get_serializer(instance).data)
        except Exception as e:
            return Response({"detail": "Transition not allowed."}, status=400)
