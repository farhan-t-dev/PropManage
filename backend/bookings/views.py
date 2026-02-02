from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum
from django.db.models.functions import ExtractMonth, ExtractYear
from django.core.exceptions import ValidationError
from django.http import StreamingHttpResponse
import csv
from .models import Booking
from .serializers import BookingSerializer
from .services import create_booking

class Echo:
    """An object that implements just the write method of the file-like interface."""
    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Booking.objects.all()
        # Tenant sees their bookings, Landlord sees bookings for their units
        return Booking.objects.filter(
            Q(tenant=user) | Q(unit__property__owner=user)
        ).select_related('unit__property', 'tenant', 'invoice')

    def perform_create(self, serializer):
        try:
            create_booking(
                user=self.request.user,
                unit=serializer.validated_data['unit'],
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date']
            )
        except ValidationError as e:
            raise serializers.ValidationError(e.message if hasattr(e, 'message') else e.messages)
            
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_properties_bookings(self, request):
        if not request.user.role == 'landlord':
            return Response({"detail": "Landlords only."}, status=403)
        
        bookings = Booking.objects.filter(unit__property__owner=request.user).select_related('unit__property', 'tenant', 'invoice')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def monthly_revenue(self, request):
        if not request.user.role == 'landlord':
            return Response({"detail": "Landlords only."}, status=403)

        revenue_data = Booking.objects.filter(
            unit__property__owner=request.user,
            status__in=['confirmed', 'completed'],
            invoice__status='paid'
        ).annotate(
            year=ExtractYear('start_date'),
            month=ExtractMonth('start_date')
        ).values('year', 'month').order_by('year', 'month').annotate(
            total_revenue=Sum('invoice__amount')
        )

        # Format data for frontend (e.g., labels for months, values for revenue)
        formatted_data = []
        for entry in revenue_data:
            month_name = {
                1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
                7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
            }.get(entry['month'], 'Unknown')
            formatted_data.append({
                'label': f"{month_name} {entry['year']}",
                'revenue': entry['total_revenue']
            })
        
        return Response(formatted_data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def confirm(self, request, pk=None):
        booking = self.get_object()
        if booking.unit.property.owner != request.user:
            return Response({"detail": "Not your property."}, status=403)
        
        if booking.status != 'pending':
            return Response({"detail": f"Cannot confirm from {booking.status}"}, status=400)

        booking.status = 'confirmed'
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.tenant != request.user and booking.unit.property.owner != request.user:
            return Response({"detail": "Permission denied."}, status=403)

        booking.status = 'cancelled'
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def download_bookings_csv(self, request):
        if not request.user.role == 'landlord':
            return Response({"detail": "Forbidden"}, status=403)

        bookings = Booking.objects.filter(unit__property__owner=request.user).select_related('unit__property', 'tenant', 'invoice')

        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)

        def row_generator():
            yield writer.writerow(['Property', 'Unit', 'Tenant', 'Start Date', 'End Date', 'Status', 'Amount'])
            for b in bookings:
                yield writer.writerow([
                    b.unit.property.title,
                    b.unit.unit_number,
                    b.tenant.username,
                    str(b.start_date),
                    str(b.end_date),
                    b.status,
                    str(b.total_price or 0.00)
                ])

        response = StreamingHttpResponse(row_generator(), content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="bookings_report.csv"'
        return response
