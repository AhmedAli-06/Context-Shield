from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "AuthUserResponse"

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    tenant_id: UUID

class AuthUserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    tenant_id: UUID
    is_active: bool
    is_superuser: bool
    roles: list[str] = []
    model_config = {"from_attributes": True}

# --- Tenant Schemas ---
class TenantResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    industry: str | None
    subscription_tier: str
    is_active: bool
    onboarding_status: str
    created_at: datetime
    model_config = {"from_attributes": True}

class TenantCreate(BaseModel):
    name: str
    slug: str
    industry: str | None = None

# --- Asset Schemas ---
class AssetResponse(BaseModel):
    id: UUID
    name: str
    asset_type: str
    category: str | None
    location: str | None
    criticality: str
    is_monitored: bool
    alert_threshold: float
    created_at: datetime
    model_config = {"from_attributes": True}

# --- Access Event Schemas ---
class AccessEventResponse(BaseModel):
    id: UUID
    user_id: UUID | None
    asset_id: UUID
    event_type: str
    occurred_at: datetime
    trust_score: float | None
    decision: str | None
    decision_reason: str | None
    model_config = {"from_attributes": True}

# --- Alert Schemas ---
class AlertResponse(BaseModel):
    id: UUID
    severity: str
    alert_type: str
    title: str
    status: str
    trust_score_at_trigger: float | None
    triggered_at: datetime
    model_config = {"from_attributes": True}

# --- Dashboard ---
class DashboardStats(BaseModel):
    total_assets: int
    active_sessions: int
    open_alerts: int
    avg_trust_score: float
    events_today: int
