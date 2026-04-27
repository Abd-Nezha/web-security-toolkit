from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.validators import sanitize_domain
from app.services.wayback_service import get_wayback_history

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/history")
@limiter.limit("15/minute")
async def get_wayback_history_endpoint(request: Request, domain: str):
    """Fetch Wayback Machine history for domain."""
    domain = sanitize_domain(domain)
    result = await get_wayback_history(domain)
    return result