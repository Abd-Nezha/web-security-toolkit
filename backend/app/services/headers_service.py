import httpx
import asyncio
from typing import Dict, Any, List

SECURITY_HEADERS = {
    "strict-transport-security": {
        "name": "Strict-Transport-Security (HSTS)",
        "description": "Forces browsers to use HTTPS for all future requests",
        "risk_if_missing": "HIGH",
        "recommendation": "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
        "docs": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security"
    },
    "content-security-policy": {
        "name": "Content-Security-Policy (CSP)",
        "description": "Prevents XSS, data injection, and clickjacking attacks",
        "risk_if_missing": "HIGH",
        "recommendation": "Add: Content-Security-Policy: default-src 'self'; script-src 'self'",
        "docs": "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"
    },
    "x-frame-options": {
        "name": "X-Frame-Options",
        "description": "Prevents clickjacking by disabling iframe embedding",
        "risk_if_missing": "MEDIUM",
        "recommendation": "Add: X-Frame-Options: DENY or SAMEORIGIN",
        "docs": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options"
    },
    "x-content-type-options": {
        "name": "X-Content-Type-Options",
        "description": "Prevents MIME type sniffing attacks",
        "risk_if_missing": "MEDIUM",
        "recommendation": "Add: X-Content-Type-Options: nosniff",
        "docs": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options"
    },
    "x-xss-protection": {
        "name": "X-XSS-Protection",
        "description": "Enables browser XSS filtering (legacy but still useful)",
        "risk_if_missing": "LOW",
        "recommendation": "Add: X-XSS-Protection: 1; mode=block",
        "docs": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection"
    },
    "referrer-policy": {
        "name": "Referrer-Policy",
        "description": "Controls how much referrer information is included with requests",
        "risk_if_missing": "LOW",
        "recommendation": "Add: Referrer-Policy: strict-origin-when-cross-origin",
        "docs": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
    },
    "permissions-policy": {
        "name": "Permissions-Policy",
        "description": "Controls browser features and APIs available to the page",
        "risk_if_missing": "MEDIUM",
        "recommendation": "Add: Permissions-Policy: geolocation=(), microphone=(), camera=()",
        "docs": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy"
    },
    "cross-origin-embedder-policy": {
        "name": "Cross-Origin-Embedder-Policy (COEP)",
        "description": "Prevents loading cross-origin resources without permission",
        "risk_if_missing": "LOW",
        "recommendation": "Add: Cross-Origin-Embedder-Policy: require-corp",
        "docs": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy"
    },
}

async def audit_headers(domain: str) -> Dict[str, Any]:
    """Improved security headers audit with better reliability."""
    urls = [f"https://{domain}", f"http://{domain}"]
    
    headers_data = {}
    used_url = None
    status_code = None
    final_response = None

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=httpx.Timeout(15.0),
        verify=False,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; WebSecurityToolkit/1.0)"
        }
    ) as client:
        for url in urls:
            try:
                resp = await client.get(url, follow_redirects=True)
                status_code = resp.status_code
                used_url = str(resp.url)                    # ← Important: str() use karo
                headers_data = {k.lower(): v for k, v in resp.headers.items()}
                final_response = resp
                break
            except httpx.RequestError as e:
                continue
            except Exception:
                continue

    if not headers_data:
        return {
            "success": False,
            "domain": domain,
            "error": "Could not retrieve headers from the domain",
            "url_tested": used_url,
        }

    # Process security headers
    results = []
    for header_key, meta in SECURITY_HEADERS.items():
        present = header_key in headers_data
        value = headers_data.get(header_key)

        results.append({
            "header": header_key,
            "name": meta["name"],
            "description": meta["description"],
            "present": present,
            "value": value,
            "risk_if_missing": meta["risk_if_missing"],
            "recommendation": meta.get("recommendation") if not present else None,
            "docs": meta.get("docs"),
        })

    # Additional risky headers
    server_header = headers_data.get("server")
    x_powered_by = headers_data.get("x-powered-by")

    grade = _grade_headers(results)
    score = round(sum(1 for r in results if r["present"]) / len(results) * 100)

    return {
        "success": True,
        "domain": domain,
        "url_tested": used_url,
        "status_code": status_code,
        "grade": grade,
        "score": score,
        "headers": results,
        "info_leakage": {
            "server": server_header,
            "x_powered_by": x_powered_by,
            "risk": "MEDIUM" if (server_header or x_powered_by) else "LOW",
            "note": "Server header reveals technology stack" if (server_header or x_powered_by) else None,
        },
        "summary": {
            "total": len(results),
            "present": sum(1 for r in results if r["present"]),
            "missing": sum(1 for r in results if not r["present"]),
            "high_risk_missing": sum(1 for r in results if not r["present"] and r["risk_if_missing"] == "HIGH"),
        }
    }


def _grade_headers(results: List[Dict]) -> str:
    total = len(results)
    present = sum(1 for r in results if r["present"])
    high_risk_missing = sum(1 for r in results if not r["present"] and r["risk_if_missing"] == "HIGH")
    
    if high_risk_missing >= 2:
        return "F"
    elif high_risk_missing == 1:
        return "D"
    elif present >= total * 0.9:
        return "A"
    elif present >= total * 0.75:
        return "B"
    elif present >= total * 0.5:
        return "C"
    else:
        return "D"