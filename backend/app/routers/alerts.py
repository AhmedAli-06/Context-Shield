from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.security import get_current_user
from app.models.auth import AuthUser
from app.models.alert import Alert
from app.schemas import AlertResponse

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])


@router.get("/", response_model=list[AlertResponse])
async def list_alerts(
    status: str | None = Query(None),
    limit: int = Query(50, le=200),
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Alert).where(Alert.tenant_id == current_user.tenant_id)
    if status:
        q = q.where(Alert.status == status)
    q = q.order_by(desc(Alert.triggered_at)).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()
