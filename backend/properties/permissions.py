from rest_framework import permissions

class IsLandlordOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow landlords (or admins) to create properties.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to landlords or admins
        return request.user.is_authenticated and (request.user.role == 'landlord' or request.user.is_staff)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # For Property, check owner. For Unit, check property.owner
        # This handles both Property models (obj.owner) and Unit models (obj.property.owner)
        owner = getattr(obj, 'owner', None) 
        if owner is None and hasattr(obj, 'property'):
            owner = obj.property.owner
            
        return owner == request.user