# ContextShield — Intent-Aware Physical Asset Security Platform

> Alpha Prototype (v0.1.0)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Start Infrastructure
```bash
cd Context-Shield
docker-compose up -d
```
This starts **PostgreSQL 16** (port 5432) and **Redis 7** (port 6379).

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
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

## API Documentation
Once the backend is running: **http://localhost:8000/docs**

## Architecture
```
React UI (Vite/TS) --> FastAPI API (Async) --> PostgreSQL + Redis
                            |
                    Trust Score Engine
```

## Seed Data
- 1 Tenant: Meridian Manufacturing
- 20 Physical Users (workers)
- 12 Monitored Assets (CNC machines, robots, etc.)
- 7 days of simulated access events with trust scores
- Alerts generated for low-trust events

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/login | JWT login |
| POST | /api/v1/auth/register | Register new auth user |
| GET | /api/v1/auth/me | Current user info |
| GET | /api/v1/dashboard/stats | Dashboard statistics |
| GET | /api/v1/assets/ | List assets |
| GET | /api/v1/assets/{id} | Get asset detail |
| GET | /api/v1/events/ | List access events |
| GET | /api/v1/events/recent | Recent events (24h) |
| GET | /api/v1/alerts/ | List alerts |
| GET | /health | Health check |
