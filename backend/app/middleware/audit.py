import hashlib
import hmac
import json
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.database import AsyncSessionLocal
from app.models.audit import AuditLog


HMAC_SECRET = b"contextshield-hmac-secret-change-in-production"


def sign_audit_entry(entry: dict) -> str:
    message = json.dumps(entry, sort_keys=True, default=str).encode()
    return hmac.new(HMAC_SECRET, message, hashlib.sha256).hexdigest()


def verify_audit_entry(entry: dict, signature: str) -> bool:
    expected = sign_audit_entry(entry)
    return hmac.compare_digest(expected, signature)


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        if request.method in ("GET", "HEAD", "OPTIONS"):
            return response

        if "/api/v1/" not in request.url.path:
            return response

        try:
            async with AsyncSessionLocal() as db:
                entry = AuditLog(
                    action=f"{request.method} {request.url.path}",
                    resource_type=request.url.path.split("/")[-1],
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent"),
                    details={
                        "status_code": response.status_code,
                        "method": request.method,
                        "path": request.url.path,
                        "timestamp": time.time(),
                    },
                )
                db.add(entry)
                await db.commit()
        except Exception:
            pass

        return response
