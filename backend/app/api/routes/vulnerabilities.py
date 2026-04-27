from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.validators import sanitize_domain
from app.services.vulnerability_service import scan_vulnerabilities

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/scan")
@limiter.limit("10/minute")
async def scan_vulnerabilities_endpoint(request: Request, domain: str):
    """Scan for known vulnerabilities and misconfigurations."""
    domain = sanitize_domain(domain)
    result = await scan_vulnerabilities(domain)
    return result