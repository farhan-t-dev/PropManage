from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Invoice, Transaction
from .serializers import InvoiceSerializer
from django.db import transaction
from django.db.models import Sum

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related('booking__unit__property', 'booking__tenant')
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Invoice.objects.all()
        return Invoice.objects.filter(
            Q(booking__tenant=user) | Q(booking__unit__property__owner=user)
        ).distinct()

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def pay(self, request, pk=None):
        invoice = self.get_object()
        if invoice.booking.tenant != request.user:
            return Response({"detail": "Forbidden"}, status=403)
        
        if invoice.status == 'paid':
            return Response({"detail": "Already paid"}, status=400)

        invoice.status = 'paid'
        invoice.save()

        # Enterprise: Create Ledger Entry
        Transaction.objects.create(
            invoice=invoice,
            user=request.user,
            amount=invoice.amount,
            transaction_type='payment',
            description=f"Payment for {invoice.booking.unit.title}",
            is_verified=True
        )
        
        return Response(InvoiceSerializer(invoice).data)

    @action(detail=False, methods=['get'])
    def landlord_ledger(self, request):
        """Returns the landlord's total earnings and verified transactions."""
        if request.user.role != 'landlord':
            return Response({"detail": "Landlords only"}, status=403)
            
        transactions = Transaction.objects.filter(user=request.user, is_verified=True)
        total_payouts = transactions.filter(transaction_type='payout').aggregate(Sum('amount'))['amount__sum'] or 0
        
        return Response({
            'balance': total_payouts,
            'recent_transactions': transactions.order_by('-created_at')[:10].values()
        })