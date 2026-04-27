from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.validators import sanitize_domain
from app.services.scan_service import run_full_scan
from pydantic import BaseModel

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class ScanRequest(BaseModel):
    domain: str

@router.post("/scan")
@limiter.limit("10/minute")
async def full_scan(request: Request, body: ScanRequest):
    """Run complete security scan on a domain."""
    domain = sanitize_domain(body.domain)
    result = await run_full_scan(domain)
    return result