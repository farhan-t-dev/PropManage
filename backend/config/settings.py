"""
Django settings for config project.
"""

import os
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-bh#98-faf^%h_te4mhrla--4q8coqrly4)=kwet(&*hnlb^nf(')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = int(os.environ.get('DEBUG', 1))

ALLOWED_HOSTS = [host.strip() for host in os.environ.get('ALLOWED_HOSTS', 'localhost').split(',') if host.strip()]

# Trust X-Forwarded-Proto from Render's TLS-terminating proxy so
# request.is_secure() reflects the real scheme behind HTTPS.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Comma-separated origins allowed to call this API from a browser.
# On Render this is set to the frontend's origin, e.g.
# https://propmanage-frontend.onrender.com
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
    if origin.strip()
] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Origins allowed to POST forms over HTTPS (Django admin, etc.)
CSRF_TRUSTED_ORIGINS = list(CORS_ALLOWED_ORIGINS)


# Application definition

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',
    'django_celery_results',
    'django_filters',
    'drf_spectacular',
    
    # Local apps
    'users',
    'properties',
    'bookings',
    'billing',
    'maintenance',
    'notifications',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Added CORS middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

def _database_from_env():
    """
    Resolve database settings from, in order of precedence:
      1. DATABASE_URL   - Render Postgres connection string (postgresql://...)
      2. SQL_* variables - docker-compose / manual Postgres setup
      3. sqlite fallback - bare local development
    """
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        url = urlparse(database_url)
        options = {}
        query = parse_qs(url.query)
        if 'sslmode' in query:
            options['sslmode'] = query['sslmode'][0]
        return {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': unquote(url.path.lstrip('/')),
                'USER': unquote(url.username or ''),
                'PASSWORD': unquote(url.password or ''),
                'HOST': url.hostname or '',
                'PORT': str(url.port or 5432),
                'OPTIONS': options,
            }
        }

    if os.environ.get('DATABASE') == 'postgres':
        return {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.environ.get('SQL_DATABASE'),
                'USER': os.environ.get('SQL_USER'),
                'PASSWORD': os.environ.get('SQL_PASSWORD'),
                'HOST': os.environ.get('SQL_HOST'),
                'PORT': os.environ.get('SQL_PORT'),
            }
        }

    return {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


DATABASES = _database_from_env()


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# WhiteNoise serves collected static files (admin, API docs) directly from
# the ASGI process in production — no separate web server required.
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/6.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'users.authentication.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

from datetime import timedelta

# Mark cookies Secure when serving over HTTPS (COOKIE_SECURE=1 on Render).
_cookie_secure = bool(int(os.environ.get('COOKIE_SECURE', '0')))

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_COOKIE': 'access_token',
    'AUTH_COOKIE_REFRESH': 'refresh_token',
    'AUTH_COOKIE_DOMAIN': None,
    'AUTH_COOKIE_SECURE': _cookie_secure,
    'AUTH_COOKIE_HTTP_ONLY' : True,
    'AUTH_COOKIE_PATH': '/',
    'AUTH_COOKIE_SAMESITE': 'Lax',
}

# CORS Config (CORS_ALLOWED_ORIGINS is resolved from the environment near the
# top of this file so it can be pointed at the Render frontend origin).
CORS_ALLOW_CREDENTIALS = True

SESSION_COOKIE_SECURE = _cookie_secure
CSRF_COOKIE_SECURE = _cookie_secure

# Email - console backend unless an SMTP host is configured (Mailpit in
# docker-compose, a real email provider on Render).
if os.environ.get('EMAIL_HOST'):
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.environ.get('EMAIL_HOST')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '1025'))
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
    EMAIL_USE_TLS = bool(int(os.environ.get('EMAIL_USE_TLS', '0')))
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Celery Config
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://redis:6379/0")


def _redis_channel_hosts():
    """Parse REDIS_URL (Render Key Value / docker-compose) for channels_redis."""
    redis_url = os.environ.get('REDIS_URL')
    if not redis_url:
        return None
    url = urlparse(redis_url)
    hosts = [{
        'host': url.hostname,
        'port': url.port or 6379,
        'db': int(url.path.strip('/') or '0'),
    }]
    if url.username:
        hosts[0]['username'] = unquote(url.username)
    if url.password:
        hosts[0]['password'] = unquote(url.password)
    return hosts


_redis_hosts = _redis_channel_hosts()
if _redis_hosts:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {'hosts': _redis_hosts},
        },
    }
else:
    # Single-process fallback for local development without Redis.
    CHANNEL_LAYERS = {
        'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'},
    }