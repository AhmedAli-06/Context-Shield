from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.security import get_current_user
from app.models.auth import AuthUser
from app.models.audit import AuditLog
from app.schemas import AuditLogResponse
from app.middleware.audit import sign_audit_entry, verify_audit_entry

router = APIRouter(prefix="/api/v1/audit", tags=["Audit"])


@router.get("/logs", response_model=list[AuditLogResponse])
async def list_audit_logs(
    limit: int = 100,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.tenant_id == current_user.tenant_id)
        .order_by(desc(AuditLog.created_at))
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/verify")
async def verify_audit_entry_endpoint(log_id: str, signature: str):
    try:
        entry_data = {"log_id": log_id, "verified": True}
        computed = sign_audit_entry(entry_data)
        is_valid = verify_audit_entry(entry_data, signature)
        return {"valid": is_valid, "computed_signature": computed if not is_valid else None}
    except Exception:
        raise HTTPException(status_code=400, detail="Verification failed")
