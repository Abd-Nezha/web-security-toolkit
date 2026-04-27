from fastapi import APIRouter, Request, Query
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.validators import sanitize_domain
from app.core.cache import cache_get, cache_set
from app.services.ssl_service import inspect_ssl

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/inspect")
@limiter.limit("20/minute")
async def inspect_ssl_endpoint(request: Request, domain: str = Query(..., description="Domain to inspect")):
    domain = sanitize_domain(domain)
    cached = await cache_get(f"ssl:{domain}")
    if cached:
        return {**cached, "cached": True}
    result = await inspect_ssl(domain)
    await cache_set(f"ssl:{domain}", result)
    return result