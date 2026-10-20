#!/bin/sh
set -e

# On Render the database host comes from DATABASE_URL; in docker-compose it
# comes from SQL_HOST. Resolve it from either source before waiting.
if [ -z "$SQL_HOST" ] && [ -n "$DATABASE_URL" ]; then
    SQL_HOST=$(python -c "from urllib.parse import urlparse; import os; print(urlparse(os.environ['DATABASE_URL']).hostname or '')")
    SQL_PORT=$(python -c "from urllib.parse import urlparse; import os; u = urlparse(os.environ['DATABASE_URL']); print(u.port or 5432)")
fi
SQL_PORT=${SQL_PORT:-5432}

# Wait for the database to be ready
if [ -n "$SQL_HOST" ]; then
    echo "Waiting for postgres at $SQL_HOST:$SQL_PORT..."
    while ! nc -z "$SQL_HOST" "$SQL_PORT"; do
        sleep 0.1
    done
    echo "PostgreSQL started"
fi

# Dev-only: auto-generate migrations on container start (docker-compose sets
# RUN_MAKEMIGRATIONS=1). Render never runs this - migrations are committed and
# applied through the service's pre-deploy command instead.
if [ "$RUN_MAKEMIGRATIONS" = "1" ]; then
    echo "Making migrations..."
    python manage.py makemigrations
fi

if [ "$RUN_MIGRATES" = "1" ]; then
    echo "Applying database migrations..."
    python manage.py migrate --noinput
fi

if [ "$RUN_COLLECTSTATIC" = "1" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
fi

# Execute the command passed to the container (daphne, celery, ...)
exec "$@"
