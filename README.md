# ContextShield — Intent-Aware Physical Asset Security Platform

> **Version:** v0.2.0-alpha
> **Status:** Active Development
> **License:** Proprietary

**ContextShield** is an AI-powered physical asset security platform that adds **intent verification** on top of existing identity-based access control systems. It continuously evaluates *why* someone is accessing an asset — not just *who* they are.

## Features

### Core (v0.2)
- **Trust Score Engine** — 5-dimensional composite scoring (identity, temporal, project, role, anomaly)
- **Real-time Monitoring** — WebSocket-powered live event feed
- **Anomaly Detection** — ML-based behavioral baseline deviation scoring
- **Alert Management** — Acknowledge, resolve, dismiss with audit trail
- **Session Management** — Active session tracking with revocation API
- **RBAC** — Role-based access control (admin, security_officer, supervisor, operator, viewer)
- **Report Export** — CSV and JSON event data export
- **API Key Management** — Programmatic access with scoped keys
- **Audit Logging** — HMAC-signed immutable audit trail
- **Settings UI** — Configurable trust score weights and thresholds

### Planned (v0.3+)
- ERP/HR system integration connectors
- Behavioral ML models (Isolation Forest + LSTM ensemble)
- Automated model retraining pipeline
- SIEM webhook integration
- Mobile app for field security officers

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Start Infrastructure
```bash
docker-compose up -d
```
Starts **PostgreSQL 16** (port 5432) and **Redis 7** (port 6379).

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux:   source venv/bin/activate
pip install -r requirements.txt

# Seed the database with demo data
python -m app.seed

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### 4. Login
- **Email:** `admin@meridian-mfg.com`
- **Password:** `ContextShield2025!`

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| **Auth** | | | |
| POST | `/api/v1/auth/login` | JWT login | — |
| POST | `/api/v1/auth/register` | Register new user | — |
| GET | `/api/v1/auth/me` | Current user info | JWT |
| **Dashboard** | | | |
| GET | `/api/v1/dashboard/stats` | Dashboard statistics | JWT |
| **Assets** | | | |
| GET | `/api/v1/assets/` | List assets | JWT |
| GET | `/api/v1/assets/{id}` | Asset detail | JWT |
| **Events** | | | |
| GET | `/api/v1/events/` | List events | JWT |
| GET | `/api/v1/events/recent` | Recent events (24h) | JWT |
| **Alerts** | | | |
| GET | `/api/v1/alerts/` | List alerts | JWT |
| GET | `/api/v1/alerts/{id}` | Alert detail | JWT |
| PUT | `/api/v1/alerts/{id}/acknowledge` | Acknowledge alert | JWT+Role |
| PUT | `/api/v1/alerts/{id}/resolve` | Resolve alert | JWT+Role |
| PUT | `/api/v1/alerts/{id}/dismiss` | Dismiss alert | JWT+Role |
| **Sessions** | | | |
| GET | `/api/v1/sessions/` | List sessions | JWT |
| GET | `/api/v1/sessions/active` | Active sessions | JWT |
| GET | `/api/v1/sessions/{id}` | Session detail | JWT |
| POST | `/api/v1/sessions/{id}/revoke` | Revoke session | JWT+Role |
| **Settings** | | | |
| GET | `/api/v1/settings/` | Get tenant config | JWT |
| PUT | `/api/v1/settings/` | Update config | JWT+Role |
| **API Keys** | | | |
| GET | `/api/v1/api-keys/` | List API keys | JWT+Role |
| POST | `/api/v1/api-keys/` | Create API key | JWT+Role |
| DELETE | `/api/v1/api-keys/{id}` | Delete API key | JWT+Role |
| **Reports** | | | |
| GET | `/api/v1/reports/events/csv` | Export events CSV | JWT |
| GET | `/api/v1/reports/events/json` | Export events JSON | JWT |
| **Audit** | | | |
| GET | `/api/v1/audit/logs` | Audit log trail | JWT |
| **WebSocket** | | | |
| WS | `/ws/live` | Live event stream | — |
| **Health** | | | |
| GET | `/health` | Health check | — |

**Interactive API docs:** http://localhost:8000/docs

## Testing

```bash
cd backend
python -m pytest tests/ -v
```

Current test coverage: **45 tests** across trust engine (19), API endpoints (26).

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  React UI (Vite/TS) → FastAPI API (Async) → DB/REDIS  │
│                              │                        │
│                      Trust Score Engine               │
│                      WebSocket Live Feed              │
│                      Audit Middleware                 │
└──────────────────────────────────────────────────────┘
```

### Tech Stack
- **Backend:** Python 3.13, FastAPI, SQLAlchemy 2.0, PostgreSQL 16, Redis 7
- **Frontend:** React 19, TypeScript, Vite, Recharts, Axios
- **Auth:** JWT (python-jose), bcrypt, OAuth2
- **Infra:** Docker, Docker Compose, Nginx

## Project Structure

```
Context-Shield/
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic (trust engine)
│   │   ├── middleware/     # Audit middleware
│   │   ├── main.py         # FastAPI app entry
│   │   └── security.py     # Auth & RBAC
│   ├── tests/              # Test suite (45 tests)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/          # Dashboard, Assets, Events, Alerts, Settings
│       ├── context/        # Auth context
│       └── api.ts          # API client
├── docker/
├── docker-compose.yml
├── Dockerfile
└── Makefile
```

## Deployment

### Production (Docker Compose)
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://...` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection string |
| `JWT_SECRET_KEY` | `contextshield-...` | JWT signing key (change in prod!) |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | Token expiry in minutes |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins |

## API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## License

Proprietary. All rights reserved.

---

*ContextShield — "Track · Protect · Connect"*
