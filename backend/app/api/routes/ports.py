from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.validators import sanitize_domain
from app.services.ports_service import scan_ports

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/scan")
@limiter.limit("10/minute")
async def scan_ports_endpoint(request: Request, domain: str):
    domain = sanitize_domain(domain)
    result = await scan_ports(domain)
    return result