import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        # In production, use a custom middleware for JWT in WebSocket headers/query params
        # For now, we assume the session or standard auth works, or we'll need a JWT middleware.
        # Given the "CookieJWTAuthentication", standard AuthMiddlewareStack might not pick it up 
        # unless we bridge it. For this MVP, we will accept connection but check user.
        # If user is Anonymous, we might reject or allow for public (but here we want private).
        
        if self.user.is_anonymous:
            # Try to get user from simplejwt (advanced) or just close for now.
            # Real-world: Implement JWTAuthMiddleware
            await self.close()
        else:
            self.group_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event['message']))