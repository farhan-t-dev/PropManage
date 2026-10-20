from django.db import connection
from django.http import JsonResponse


def health_check(request):
    """
    Liveness/readiness endpoint used by Render's health checks.
    Returns 503 when the database is unreachable so the platform can react.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
    except Exception:
        return JsonResponse({'status': 'error', 'database': 'unreachable'}, status=503)
    return JsonResponse({'status': 'ok', 'database': 'reachable'})
