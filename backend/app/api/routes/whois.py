from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.validators import sanitize_domain
from app.services.whois_service import get_whois_info

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/info")
@limiter.limit("20/minute")
async def get_whois_info_endpoint(request: Request, domain: str):
    """Get WHOIS information and risk analysis."""
    domain = sanitize_domain(domain)
    result = await get_whois_info(domain)
    return result