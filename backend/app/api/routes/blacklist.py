from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.validators import sanitize_domain
from app.services.blacklist_service import check_blacklist_history

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/history")
@limiter.limit("15/minute")
async def check_blacklist_history_endpoint(request: Request, domain: str):
    """Check domain against blacklists (VirusTotal + Google Safe Browsing)."""
    domain = sanitize_domain(domain)
    result = await check_blacklist_history(domain)
    return result