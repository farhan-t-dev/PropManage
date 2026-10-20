#!/bin/sh
# Production start command (Render).
#
# Runs the ASGI server (daphne) and the Celery worker together in one
# container, because Render's free compute plan has no standalone
# background-worker instances. Each process is monitored: if either dies,
# the container exits (daphne) or the worker is restarted.
set -e

: "${PORT:=10000}"

celery_cmd="celery -A config worker --pool=solo -l info"

echo "Starting Celery worker..."
$celery_cmd &
CELERY_PID=$!

echo "Starting daphne on 0.0.0.0:$PORT..."
daphne -b 0.0.0.0 -p "$PORT" config.asgi:application &
WEB_PID=$!

shutdown() {
    echo "Received stop signal, shutting down..."
    kill "$WEB_PID" "$CELERY_PID" 2>/dev/null || true
    exit 0
}
trap shutdown TERM INT

while :; do
    if ! kill -0 "$WEB_PID" 2>/dev/null; then
        echo "daphne exited unexpectedly, stopping container."
        kill "$CELERY_PID" 2>/dev/null || true
        exit 1
    fi
    if ! kill -0 "$CELERY_PID" 2>/dev/null; then
        echo "Celery worker exited, restarting it..."
        $celery_cmd &
        CELERY_PID=$!
    fi
    sleep 5
done
