from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Invoice
from .serializers import InvoiceSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Invoice.objects.all()
        # Tenant sees their own invoices, Landlord sees invoices for their properties
        return Invoice.objects.filter(
            booking__tenant=user
        ) | Invoice.objects.filter(
            booking__property__owner=user
        )

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """
        Simulates paying an invoice.
        """
        invoice = self.get_object()
        if invoice.booking.tenant != request.user:
            return Response({"detail": "You do not have permission to pay this invoice."},
                            status=status.HTTP_403_FORBIDDEN)
        
        if invoice.status == 'paid':
            return Response({"detail": "Invoice is already paid."},
                            status=status.HTTP_400_BAD_REQUEST)
        
        if invoice.status == 'cancelled':
            return Response({"detail": "Cannot pay a cancelled invoice."},
                            status=status.HTTP_400_BAD_REQUEST)

        invoice.status = 'paid'
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)