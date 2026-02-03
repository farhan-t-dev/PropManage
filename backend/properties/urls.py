from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, DocumentViewSet, UnitViewSet

router = DefaultRouter()
router.register(r'units', UnitViewSet, basename='unit') # Adding UnitViewSet explicitly as it might be needed and was missing in previous file read but exists in views
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'', PropertyViewSet, basename='property')

urlpatterns = [
    path('', include(router.urls)),
]
