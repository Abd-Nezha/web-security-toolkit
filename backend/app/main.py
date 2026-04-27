from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.routes import ssl, vulnerabilities, headers, dns, reputation, ports, wayback, whois, blacklist, scan
from app.core.config import settings

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Web Security Intelligence Toolkit API",
    description="Production-grade security analysis API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(scan.router, prefix="/api/v1", tags=["Full Scan"])
app.include_router(ssl.router, prefix="/api/v1/ssl", tags=["SSL Inspector"])
app.include_router(vulnerabilities.router, prefix="/api/v1/vulnerabilities", tags=["Vulnerability Scanner"])
app.include_router(headers.router, prefix="/api/v1/headers", tags=["Security Headers"])
app.include_router(dns.router, prefix="/api/v1/dns", tags=["DNS & IP Lookup"])
app.include_router(reputation.router, prefix="/api/v1/reputation", tags=["Domain Reputation"])
app.include_router(ports.router, prefix="/api/v1/ports", tags=["Port Scanner"])
app.include_router(wayback.router, prefix="/api/v1/wayback", tags=["Wayback Machine"])
app.include_router(whois.router, prefix="/api/v1/whois", tags=["WHOIS History"])
app.include_router(blacklist.router, prefix="/api/v1/blacklist", tags=["Blacklist History"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}