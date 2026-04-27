from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.validators import sanitize_domain
from app.services.reputation_service import check_reputation

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/check")
@limiter.limit("15/minute")
async def check_reputation_endpoint(request: Request, domain: str):
    """Check domain reputation via VirusTotal and Google Safe Browsing."""
    domain = sanitize_domain(domain)
    result = await check_reputation(domain)
    return result