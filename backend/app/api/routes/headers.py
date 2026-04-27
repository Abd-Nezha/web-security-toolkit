from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.validators import sanitize_domain
from app.services.headers_service import audit_headers

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/audit")
@limiter.limit("20/minute")
async def audit_headers_endpoint(request: Request, domain: str):
    domain = sanitize_domain(domain)
    result = await audit_headers(domain)
    return result