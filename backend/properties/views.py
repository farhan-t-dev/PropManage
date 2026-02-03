from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
from .models import Property, Unit, Document
from .serializers import PropertySerializer, UnitSerializer, DocumentSerializer
from .permissions import IsOwnerOrReadOnly, IsLandlordOrReadOnly
from bookings.services import is_unit_available
from datetime import datetime

from rest_framework.views import APIView
from django.contrib.auth import get_user_model

User = get_user_model()

class GlobalSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])

        results = []
        user = request.user

        # 1. Search Properties (Owned by user if landlord, or all if staff)
        prop_qs = Property.objects.filter(title__icontains=query)
        if user.role == 'landlord':
            prop_qs = prop_qs.filter(owner=user)
        
        for p in prop_qs[:5]:
            results.append({
                'type': 'property',
                'id': p.id,
                'title': p.title,
                'subtitle': p.address,
                'url': f'/landlord-dashboard' # Or a specific prop page
            })

        # 2. Search Units
        unit_qs = Unit.objects.filter(Q(title__icontains=query) | Q(unit_number__icontains=query))
        if user.role == 'landlord':
            unit_qs = unit_qs.filter(property__owner=user)
        
        for u in unit_qs[:5]:
            results.append({
                'type': 'unit',
                'id': u.id,
                'title': u.title,
                'subtitle': f"{u.property.title} - {u.unit_number}",
                'url': f'/unit/{u.id}'
            })

        # 3. Search Tenants (Only for Landlords/Admin)
        if user.role in ['landlord', 'admin']:
            tenant_qs = User.objects.filter(role='tenant').filter(
                Q(username__icontains=query) | Q(first_name__icontains=query) | Q(last_name__icontains=query)
            )
            # If landlord, only show tenants that have bookings in their properties
            if user.role == 'landlord':
                tenant_qs = tenant_qs.filter(bookings__unit__property__owner=user).distinct()
            
            for t in tenant_qs[:5]:
                results.append({
                    'type': 'tenant',
                    'id': t.id,
                    'title': f"{t.first_name} {t.last_name}",
                    'subtitle': t.email,
                    'url': f'/landlord-dashboard' # Can be expanded to tenant detail
                })

        return Response(results)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Document.objects.all()
        # Landlord: docs for properties they own
        if user.role == 'landlord':
            return Document.objects.filter(property__owner=user)
        # Tenant: For now, return empty or specific shared docs (logic can be expanded)
        return Document.objects.none()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        doc = self.get_object()
        handle = doc.file.open()
        return FileResponse(handle, as_attachment=True, filename=doc.file.name.split('/')[-1])

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().prefetch_related('units', 'images')
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsLandlordOrReadOnly, IsOwnerOrReadOnly]

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

    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsLandlordOrReadOnly, IsOwnerOrReadOnly]

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
