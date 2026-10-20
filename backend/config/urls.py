"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve as serve_file
from users.views import CookieTokenObtainPairView, CookieTokenRefreshView, LogoutView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from config.health import health_check

urlpatterns = [
    # Platform health check (Render hits this before marking a deploy live)
    path('health/', health_check, name='health-check'),

    path('admin/', admin.site.urls),
    
    # Auth
    path('api/v1/auth/token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='auth_logout'),
    
    # API v1
    path('api/v1/', include('config.api_router')),
    
    # Schema & Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # Uploaded media is served through Django in production (static files are
    # handled by WhiteNoise). On Render's free tier the filesystem is
    # ephemeral - see DEPLOY.md for storage trade-offs.
    urlpatterns += [
        re_path(
            r'^media/(?P<path>.*)$',
            serve_file,
            {'document_root': settings.MEDIA_ROOT},
        ),
    ]
