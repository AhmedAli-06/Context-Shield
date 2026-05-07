.PHONY: dev-backend dev-frontend test test-backend db-reset db-seed docker-up docker-down lint

# Development
dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

# Testing
test:
	cd backend && python -m pytest tests/ -v

test-backend:
	cd backend && python -m pytest tests/ -v --tb=short

# Database
db-reset:
	cd backend && python -m app.reset_db

db-seed:
	cd backend && python -m app.seed

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-prod:
	docker-compose -f docker-compose.prod.yml up -d --build

# Lint
lint:
	cd backend && ruff check app/ tests/
	cd frontend && npx tsc --noEmit
