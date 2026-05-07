import csv
import io
import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.security import get_current_user
from app.models.auth import AuthUser
from app.models.access import AccessEvent

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])


def _parse_date(value: str | None, default_days: int = 7):
    if value:
        return datetime.fromisoformat(value)
    return datetime.now(timezone.utc) - timedelta(days=default_days)


@router.get("/events/csv")
async def export_events_csv(
    hours: int = Query(24, le=168),
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    result = await db.execute(
        select(AccessEvent)
        .where(AccessEvent.tenant_id == current_user.tenant_id, AccessEvent.occurred_at >= cutoff)
        .limit(10000)
    )
    events = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "event_type", "occurred_at", "trust_score", "decision", "decision_reason"])
    for e in events:
        writer.writerow([str(e.id), e.event_type, e.occurred_at.isoformat(), e.trust_score, e.decision, e.decision_reason])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=access_events_{cutoff.date().isoformat()}.csv"},
    )


@router.get("/events/json")
async def export_events_json(
    hours: int = Query(24, le=168),
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    result = await db.execute(
        select(AccessEvent)
        .where(AccessEvent.tenant_id == current_user.tenant_id, AccessEvent.occurred_at >= cutoff)
        .limit(10000)
    )
    events = result.scalars().all()

    data = [
        {
            "id": str(e.id),
            "event_type": e.event_type,
            "occurred_at": e.occurred_at.isoformat(),
            "trust_score": e.trust_score,
            "decision": e.decision,
            "decision_reason": e.decision_reason,
        }
        for e in events
    ]

    return StreamingResponse(
        iter([json.dumps(data, indent=2, default=str)]),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=access_events.json"},
    )
