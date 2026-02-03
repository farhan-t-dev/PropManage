from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.conf import settings

@database_sync_to_async
def get_user(token_key):
    User = get_user_model()
    try:
        token = AccessToken(token_key)
        user_id = token['user_id']
        return User.objects.get(id=user_id)
    except Exception as e:
        return AnonymousUser()

class JwtAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Get the token from cookie
        headers = dict(scope['headers'])
        cookies_str = headers.get(b'cookie', b'').decode()
        
        # Simple cookie parsing
        cookies = {}
        if cookies_str:
            for c in cookies_str.split(';'):
                if '=' in c:
                    k, v = c.split('=', 1)
                    cookies[k.strip()] = v.strip()
        
        token = cookies.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        
        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
            
        return await self.app(scope, receive, send)