from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import UserSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        access = response.data.get('access')
        refresh = response.data.get('refresh')
        
        if access:
            response.set_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE'],
                access,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=True, samesite='Lax', secure=False,
            )
        if refresh:
            response.set_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                refresh,
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                httponly=True, samesite='Lax', secure=False,
            )
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # If refresh token not in body, try to get it from cookie
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if refresh_token and 'refresh' not in request.data:
            request.data['refresh'] = refresh_token
            
        response = super().post(request, *args, **kwargs)
        access = response.data.get('access')
        
        if access:
            response.set_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE'],
                access,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=True, samesite='Lax', secure=False,
            )
        return response

class LogoutView(views.APIView):
    # AllowAny is critical to break the 401 -> Logout -> 401 loop
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        response = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        return response