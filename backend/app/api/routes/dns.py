from fastapi import APIRouter, HTTPException
import dns.resolver

router = APIRouter()

@router.get("/dns-lookup")
async def dns_lookup(domain: str):
    try:
        result = {}
        # A record lookup
        try:
            a_records = dns.resolver.resolve(domain, 'A')
            result['A'] = [ip.to_text() for ip in a_records]
        except:
            result['A'] = []
            
        # MX record lookup
        try:
            mx_records = dns.resolver.resolve(domain, 'MX')
            result['MX'] = [str(mx.exchange) for mx in mx_records]
        except:
            result['MX'] = []

        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not resolve domain: {str(e)}")