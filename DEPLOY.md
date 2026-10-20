# Deploying PropManage on Render

Everything is defined as infrastructure-as-code in [`render.yaml`](./render.yaml)
(Render Blueprint) at the repo root.

## Architecture

| Resource | Type | Plan | Region | Purpose |
| --- | --- | --- | --- | --- |
| `propmanage-api` | Web service (Docker) | free | virginia | Django + daphne (HTTP/WS) + Celery worker in one container |
| `propmanage-frontend` | Static site | free | global CDN | React/Vite build, SPA rewrite to `index.html` |
| `propmanage-db` | Postgres 15 | free | virginia | Primary database (`DATABASE_URL` injected automatically) |
| `propmanage-cache` | Key Value (Redis) | free | virginia | Celery broker/results + Django Channels (internal-only) |

There is **no standalone worker service**: Render's free compute plan has no
background-worker instances, so `backend/start_render.sh` runs daphne and a
Celery solo worker together and restarts the worker if it dies.

All cross-service wiring (CORS origins, `ALLOWED_HOSTS`, API base URL,
`DATABASE_URL`, `REDIS_URL`) is done with Blueprint references — nothing is
hardcoded in the repo.

## One-time: create the Blueprint

The Render CLI can validate blueprints but not create them, so this single step
happens in the dashboard:

1. Push the repo to `main` (Render's GitHub app already has access — your
   earlier service was linked to it).
2. Open <https://dashboard.render.com/blueprint> → **New Blueprint** →
   select `farhan-t-dev/PropManage` → branch `main`.
3. Render shows the plan from `render.yaml` (2 services + Postgres + Key Value).
4. You are prompted for three `sync: false` values — the Django admin superuser:
   - `DJANGO_SUPERUSER_USERNAME`
   - `DJANGO_SUPERUSER_EMAIL`
   - `DJANGO_SUPERUSER_PASSWORD`
5. Click **Deploy**.

First deploy order: Postgres/Key Value → API (image build ≈ 3–4 min, runs
`migrate` on start) → frontend build (`npm ci && vite build`).

## Monitor with the CLI

```bash
render services list                 # all services + IDs
render deploys list                  # recent deploys and their status
render logs <serviceID|name>         # live logs (-f style follow: see --help)
render instances <serviceID>         # instance state
```

Expected endpoints after the first green deploy:

- Frontend: `https://propmanage-frontend.onrender.com` (or the slug shown by `render services list`)
- API: `https://propmanage-api.onrender.com/api/v1/`
- Health: `https://propmanage-api.onrender.com/health/`
- Swagger: `https://propmanage-api.onrender.com/api/docs/`
- Admin: `https://propmanage-api.onrender.com/admin/` (superuser from step 4)

## What changed in the code

**Backend**

- `config/settings.py`
  - Parses `DATABASE_URL` (Render) in addition to `SQL_*` (docker-compose), sqlite fallback.
  - `REDIS_URL` drives Django Channels config; Celery still uses `CELERY_BROKER_URL`.
  - `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` from env (frontend origin on Render).
  - `SECURE_PROXY_SSL_HEADER` + `COOKIE_SECURE` → Secure JWT/session/CSRF cookies behind Render's TLS proxy.
  - WhiteNoise (`STORAGES`) serves collected static files through daphne.
  - Email falls back to the console backend unless `EMAIL_HOST` is set
    (also fixes mailpit config in docker-compose, which was ignored before).
- `config/health.py` + `/health/` route — Render health check (503 if the DB is unreachable).
- `config/urls.py` — serves `/media/` in production (DEBUG-gated before → uploads 404'd).
- `entrypoint.sh` — no more `makemigrations` in prod; tasks are flag-gated
  (`RUN_MAKEMIGRATES` / `RUN_MIGRATES` / `RUN_COLLECTSTATIC`, set in
  docker-compose for dev, `RUN_MIGRATES=1` on Render because free tier has no
  `preDeployCommand`). Resolves the DB host from `DATABASE_URL` before waiting.
- `start_render.sh` — production process manager (daphne + Celery, health monitor, SIGTERM trap).
- `Dockerfile` — bakes `collectstatic` into the image; default `CMD` is `start_render.sh`.
- `requirements.txt` — added `whitenoise`.

**Frontend**

- `src/api/index.js` — `baseURL` from `VITE_API_URL` (baked at build time by
  the Blueprint), falls back to `http://localhost:8000/api/v1` in dev; exports `wsUrl()`.
- `src/store/notificationStore.js` — WebSocket URL derived from the API base URL
  (`https→wss` automatically) instead of hardcoded `ws://localhost:8000`.

**Infra**

- `render.yaml` — the Blueprint (validated with `render blueprints validate render.yaml`).
- `docker-compose.yml` — passes the new entrypoint flags + `REDIS_URL` so local
  dev behaves exactly as before.
- `backend/.dockerignore` — small, reproducible build context.

Local development is unchanged: `docker-compose up --build`.

## Free-tier caveats (and how to graduate)

| Caveat | Effect | Upgrade path |
| --- | --- | --- |
| Postgres free expires **30 days** after creation | DB locked, then deleted after a 14-day grace period | Set `plan: 0.1c-256mb` ($6/mo) in `render.yaml` for `propmanage-db` |
| Web service **spins down** after 15 min idle | ~1 min cold start; WebSocket drops while idle | Any paid plan (e.g. `0.5c-512mb`, $7/mo) |
| No worker instances on free | Celery runs inside the web container (`--pool=solo`) | Add a `worker` service (`type: worker`) running `celery -A config worker` |
| Ephemeral filesystem | Uploaded property images vanish on redeploy/spin-down | Persistent disk (paid, disables zero-downtime) or Cloudinary/S3 |
| Key Value free is in-memory | Celery/Channels data lost on restart (harmless for this app) | `plan: 256mb` ($10/mo) for persistence |
| 750 free instance hours/month | Web service suspended if exceeded (~1 always-on = ~720 h) | Paid plan |

## Custom domains & cookies (read before mixing domains)

Auth uses HttpOnly JWT cookies with `SameSite=Lax`. That works across
subdomains of the **same registrable domain** (e.g. `app.example.com` ↔
`api.example.com`, or two `*.onrender.com` hosts). It silently breaks if the
frontend and API end up on *unrelated* domains (e.g. `example.com` ↔
`something.onrender.com`) — in that case set `AUTH_COOKIE_SAMESITE=None`,
`AUTH_COOKIE_SECURE=True` (already on Render) and add both origins to
`CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS`.

## Troubleshooting

```bash
# Service keeps restarting / deploy failed
render logs propmanage-api
render deploys list

# Check env wiring inside the API service (from the dashboard shell is not
# available on free tier, so rely on logs + /health/)
curl -s https://<api-host>/health/

# Blueprint config drift
render blueprints validate render.yaml
```

Common first-deploy failures:

- **Missing superuser prompt values** — `initialDeployHook` skips silently if
  unset; create the admin later by re-syncing the Blueprint with values, or via
  a local `DJANGO_SUPERUSER_* docker-compose exec backend python manage.py createsuperuser`.
- **Frontend can't reach API** — check `CORS_ALLOWED_ORIGINS` on the API service
  equals the frontend origin exactly (Blueprint sets this automatically).
- **Celery tasks not running** — `render logs propmanage-api | grep Celery` to
  confirm the worker started inside the container.
