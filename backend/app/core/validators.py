import re
from urllib.parse import urlparse
from fastapi import HTTPException

def sanitize_domain(domain: str) -> str:
    """Sanitize and validate domain input."""
    domain = domain.strip().lower()
    
    # Remove protocol if present
    if domain.startswith(("http://", "https://")):
        parsed = urlparse(domain)
        domain = parsed.netloc or parsed.path
    
    # Remove trailing slash and path
    domain = domain.split("/")[0]
    domain = domain.split("?")[0]
    domain = domain.split("#")[0]
    
    # Validate domain format
    domain_pattern = re.compile(
        r'^(?:[a-zA-Z0-9]'
        r'(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)'
        r'+[a-zA-Z]{2,}$'
    )
    
    if not domain_pattern.match(domain):
        raise HTTPException(status_code=400, detail=f"Invalid domain format: {domain}")
    
    if len(domain) > 253:
        raise HTTPException(status_code=400, detail="Domain name too long")
    
    return domain

def validate_port(port: int) -> bool:
    return 1 <= port <= 65535