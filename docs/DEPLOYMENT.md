# GreatScout — Production Deployment Guide

**Tagline:** Scout Smart, Build Better.

---

## 1. Production Architecture Overview

GreatScout is designed for seamless containerized deployment via Docker Compose, Kubernetes, or managed cloud services (AWS ECS, Google Cloud Run, Railway, DigitalOcean).

```
┌────────────────────────────────────────────────────────┐
│                   INCOMING TRAFFIC                     │
│               (HTTPS / Cloudflare / Nginx)             │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       port 80  ▼                        ▼  port 8000
┌───────────────────────┐        ┌───────────────────────┐
│   FRONTEND CONTAINER  │        │   BACKEND CONTAINER   │
│   • Nginx Web Server  │        │   • FastAPI + Uvicorn │
│   • Compiled React SPA│───────▶│   • Background Runner │
│   • Gzip compression  │        │   • Async SQLAlchemy  │
└───────────────────────┘        └───────────┬───────────┘
                                             │ port 5432
                                             ▼
                                 ┌───────────────────────┐
                                 │   POSTGRESQL CONTAINER│
                                 │   • PostgreSQL 16     │
                                 │   • pgvector Extension│
                                 │   • Persistent Volume │
                                 └───────────────────────┘
```

---

## 2. Docker Compose Deployment

The repository includes a ready-to-run multi-stage `docker-compose.yml` orchestrating all services:

### Quick Deployment Commands
```bash
# 1. Clone repository on production host
git clone https://github.com/your-org/greatscout.git
cd greatscout

# 2. Configure production environment
cp .env.example .env
# Edit .env with secure production passwords and secrets

# 3. Build and launch all containers in detached mode
docker compose up -d --build

# 4. View service health and status
docker compose ps

# 5. Tail application logs
docker compose logs -f backend
```

---

## 3. Production Configuration & Environment Variables

| Variable | Description | Example / Default |
|---|---|---|
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://postgres:secret@postgres:5432/greatscout` |
| `POSTGRES_USER` | Database superuser | `postgres` |
| `POSTGRES_PASSWORD` | Secure database password | `<generate-strong-password>` |
| `POSTGRES_DB` | Production database name | `greatscout` |
| `ENVIRONMENT` | Runtime environment mode | `production` |
| `DEBUG` | FastAPI debug mode flag | `false` |
| `CORS_ORIGINS` | Permitted origins for frontend API calls | `["https://greatscout.io"]` |
| `PRODUCT_HUNT_API_TOKEN` | Product Hunt developer API token | `<your-token>` |
| `REDDIT_USER_AGENT` | Custom User-Agent for Reddit API compliance | `GreatScoutMarketIntel/1.0` |

---

## 4. Production Database Migrations

When running in production, database migrations execute automatically on backend container startup, or can be triggered manually:

```bash
docker compose exec backend python -m alembic upgrade head
```

To seed initial baseline market intelligence opportunities:
```bash
docker compose exec backend python backend/scripts/seed.py
```

---

## 5. Health Monitoring & Verification

GreatScout exposes standardized health endpoints for load balancers and container orchestrators:

- **Endpoint**: `GET /api/v1/health`
- **Sample Production Response**:
```json
{
  "status": "healthy",
  "app_name": "GreatScout",
  "tagline": "Scout Smart, Build Better.",
  "version": "1.0.0",
  "environment": "production",
  "database": "postgresql+asyncpg",
  "vector_support": true,
  "ai_provider": "heuristic",
  "timestamp": "2026-10-18T16:00:00Z"
}
```

---

## 6. Security & Hardening Checklist

- [x] Passwords and API tokens managed via `.env` (never committed to Git).
- [x] Ingestion text sanitization strips malicious script tags and HTML entities.
- [x] URL tracking parameter normalization eliminates user-tracking cookies and session IDs.
- [x] Bounded input validation on all API endpoints via Pydantic schemas.
- [x] CORS strictly configured in production to disallow unverified origins.
- [x] Static assets served via Nginx with cache headers and gzip compression.
