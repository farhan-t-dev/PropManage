from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet
from properties.views import PropertyViewSet
from bookings.views import BookingViewSet
from billing.views import InvoiceViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'billing/invoices', InvoiceViewSet, basename='invoice')

app_name = 'api_v1'
urlpatterns = [
    path('', include(router.urls)),
]
