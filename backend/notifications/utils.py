from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification(user_id, message, msg_type='info'):
    channel_layer = get_channel_layer()
    group_name = f"user_{user_id}"
    
    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'send_notification',
                'message': {
                    'message': message,
                    'type': msg_type
                }
            }
        )
    except Exception as e:
        print(f"Failed to send notification: {e}")