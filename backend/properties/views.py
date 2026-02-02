from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Property, Unit
from .serializers import PropertySerializer, UnitSerializer
from bookings.services import is_unit_available
from datetime import datetime

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # For Property, check owner. For Unit, check property.owner
        owner = getattr(obj, 'owner', None) or getattr(obj.property, 'owner', None)
        return owner == request.user

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().prefetch_related('units', 'images')
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_properties(self, request):
        properties = self.get_queryset().filter(owner=request.user)
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

class UnitViewSet(viewsets.ModelViewSet):

    queryset = Unit.objects.all().select_related('property').prefetch_related('images')

    serializer_class = UnitSerializer

    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    filterset_fields = ['property', 'is_active']

    search_fields = ['title', 'unit_number', 'property__title']

    ordering_fields = ['base_price', 'created_at']



    def get_queryset(self):

        queryset = super().get_queryset()

        min_price = self.request.query_params.get('min_price')

        max_price = self.request.query_params.get('max_price')

        

        if min_price:

            queryset = queryset.filter(base_price__gte=min_price)

        if max_price:

            queryset = queryset.filter(base_price__lte=max_price)

            

        return queryset

    @action(detail=True, methods=['get'])
    def check_availability(self, request, pk=None):
        unit = self.get_object()
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            return Response({"error": "Missing dates"}, status=400)

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format"}, status=400)

        available = is_unit_available(unit, start_date, end_date)
        return Response({"available": available})
