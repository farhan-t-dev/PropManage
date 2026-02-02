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
        # Tenant sees their bookings, Landlord sees bookings for their properties
        return Booking.objects.filter(
            Q(tenant=user) | Q(property__owner=user)
        ).select_related('property', 'tenant') # Optimize queries

    def perform_create(self, serializer):
        try:
            create_booking(
                user=self.request.user,
                property_obj=serializer.validated_data['property'],
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date']
            )
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
            
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_properties_bookings(self, request):
        """
        Returns a list of bookings for properties owned by the authenticated user (landlord).
        """
        if not request.user.is_authenticated or request.user.role != 'landlord':
            return Response({"detail": "You do not have permission to perform this action."},
                            status=403)
        
        bookings = Booking.objects.filter(property__owner=request.user).select_related('property', 'tenant', 'invoice')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def monthly_revenue(self, request):
        """
        Calculates monthly revenue for properties owned by the authenticated user (landlord).
        Revenue is based on confirmed bookings with paid invoices.
        """
        if not request.user.is_authenticated or request.user.role != 'landlord':
            return Response({"detail": "You do not have permission to perform this action."},
                            status=403)

        revenue_data = Booking.objects.filter(
            property__owner=request.user,
            status='confirmed',
            invoice__status='paid' # Only consider paid invoices
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
        if booking.property.owner != request.user:
            return Response({"detail": "You do not have permission to confirm this booking."},
                            status=status.HTTP_403_FORBIDDEN)
        
        if booking.status != 'pending':
            return Response({"detail": f"Booking cannot be confirmed from status: {booking.status}"},
                            status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'confirmed'
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        # Tenant can cancel their own, Landlord can cancel for their property
        if booking.tenant != request.user and booking.property.owner != request.user:
            return Response({"detail": "You do not have permission to cancel this booking."},
                            status=status.HTTP_403_FORBIDDEN)

        if booking.status == 'cancelled':
            return Response({"detail": "Booking is already cancelled."},
                            status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'cancelled'
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def download_bookings_csv(self, request):
        """
        Streams a CSV file of all bookings for the landlord's properties.
        """
        if not request.user.is_authenticated or request.user.role != 'landlord':
            return Response({"detail": "You do not have permission to perform this action."},
                            status=403)

        bookings = Booking.objects.filter(property__owner=request.user).select_related('property', 'tenant', 'invoice')

        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)

        rows = (['Property', 'Tenant', 'Start Date', 'End Date', 'Status', 'Invoice Status', 'Amount'] +
                [
                    booking.property.title,
                    booking.tenant.username,
                    str(booking.start_date),
                    str(booking.end_date),
                    booking.status,
                    booking.invoice.status if hasattr(booking, 'invoice') else 'N/A',
                    str(booking.invoice.amount) if hasattr(booking, 'invoice') else '0.00'
                ] for booking in bookings)

        # Generator to yield header then rows
        def row_generator():
            yield writer.writerow(['Property', 'Tenant', 'Start Date', 'End Date', 'Status', 'Invoice Status', 'Amount'])
            for booking in bookings:
                yield writer.writerow([
                    booking.property.title,
                    booking.tenant.username,
                    str(booking.start_date),
                    str(booking.end_date),
                    booking.status,
                    booking.invoice.status if hasattr(booking, 'invoice') else 'N/A',
                    str(booking.invoice.amount) if hasattr(booking, 'invoice') else '0.00'
                ])

        response = StreamingHttpResponse(row_generator(), content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="bookings_report.csv"'
        return response
