from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet
from properties.views import PropertyViewSet, UnitViewSet
from bookings.views import BookingViewSet
from billing.views import InvoiceViewSet
from maintenance.views import MaintenanceRequestViewSet
from properties.views import GlobalSearchView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'billing/invoices', InvoiceViewSet, basename='invoice')
router.register(r'maintenance/requests', MaintenanceRequestViewSet, basename='maintenance-request')

app_name = 'api_v1'
urlpatterns = [
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('', include(router.urls)),
]
