#!/bin/sh

# Wait for the database to be ready
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

# Make migrations (Useful for dev, handle with care in prod)
echo "Making migrations..."
python manage.py makemigrations users
python manage.py makemigrations properties
python manage.py makemigrations bookings
python manage.py makemigrations

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Execute the command passed to the docker container
exec "$@"
