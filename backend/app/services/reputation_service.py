import httpx
import asyncio
import base64
from typing import Dict, Any, Optional
from app.core.config import settings


async def check_reputation(domain: str) -> Dict[str, Any]:
    """Check domain reputation via VirusTotal and Google Safe Browsing."""
    vt_task = _check_virustotal(domain)
    gsb_task = _check_google_safe_browsing(domain)
    
    vt_result, gsb_result = await asyncio.gather(vt_task, gsb_task, return_exceptions=True)
    
    if isinstance(vt_result, Exception):
        vt_result = {"error": str(vt_result), "available": False}
    if isinstance(gsb_result, Exception):
        gsb_result = {"error": str(gsb_result), "available": False}
    
    # Aggregate risk
    overall_risk = "LOW"
    is_malicious = False
    
    if vt_result.get("malicious_count", 0) > 5:
        overall_risk = "CRITICAL"
        is_malicious = True
    elif vt_result.get("malicious_count", 0) > 0:
        overall_risk = "HIGH"
        is_malicious = True
    elif gsb_result.get("threats"):
        overall_risk = "CRITICAL"
        is_malicious = True
    elif vt_result.get("suspicious_count", 0) > 0:
        overall_risk = "MEDIUM"
    
    return {
        "success": True,
        "domain": domain,
        "overall_risk": overall_risk,
        "is_malicious": is_malicious,
        "virustotal": vt_result,
        "google_safe_browsing": gsb_result,
        "verdict": _get_verdict(overall_risk, is_malicious),
    }


async def _check_virustotal(domain: str) -> Dict[str, Any]:
    if not settings.VIRUSTOTAL_API_KEY:
        return {
            "available": False,
            "note": "VirusTotal API key not configured. Add VIRUSTOTAL_API_KEY to .env",
        }
    
    headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
    url = f"https://www.virustotal.com/api/v3/domains/{domain}"
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(url, headers=headers)
            
            if resp.status_code == 404:
                return {"available": True, "found": False, "note": "Domain not found in VirusTotal database"}
            
            if resp.status_code == 401:
                return {"available": False, "error": "Invalid VirusTotal API key"}
            
            data = resp.json()
            attrs = data.get("data", {}).get("attributes", {})
            stats = attrs.get("last_analysis_stats", {})
            
            categories = attrs.get("categories", {})
            
            return {
                "available": True,
                "found": True,
                "malicious_count": stats.get("malicious", 0),
                "suspicious_count": stats.get("suspicious", 0),
                "harmless_count": stats.get("harmless", 0),
                "undetected_count": stats.get("undetected", 0),
                "total_engines": sum(stats.values()),
                "categories": categories,
                "reputation": attrs.get("reputation", 0),
                "last_analysis_date": attrs.get("last_analysis_date"),
                "creation_date": attrs.get("creation_date"),
                "whois": attrs.get("whois", "")[:500] if attrs.get("whois") else None,
            }
        
        except httpx.TimeoutException:
            return {"available": False, "error": "VirusTotal request timed out"}
        except Exception as e:
            return {"available": False, "error": str(e)}


async def _check_google_safe_browsing(domain: str) -> Dict[str, Any]:
    if not settings.GOOGLE_SAFE_BROWSING_API_KEY:
        return {
            "available": False,
            "note": "Google Safe Browsing API key not configured. Add GOOGLE_SAFE_BROWSING_API_KEY to .env",
        }
    
    url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={settings.GOOGLE_SAFE_BROWSING_API_KEY}"
    
    payload = {
        "client": {"clientId": "web-security-toolkit", "clientVersion": "1.0.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [
                {"url": f"https://{domain}"},
                {"url": f"http://{domain}"},
            ],
        },
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(url, json=payload)
            data = resp.json()
            
            threats = data.get("matches", [])
            
            return {
                "available": True,
                "threats": threats,
                "is_safe": len(threats) == 0,
                "threat_types": list(set(t.get("threatType") for t in threats)),
                "platforms": list(set(t.get("platformType") for t in threats)),
            }
        
        except Exception as e:
            return {"available": False, "error": str(e)}


def _get_verdict(risk: str, is_malicious: bool) -> str:
    if is_malicious:
        return "⚠️ This domain has been flagged as malicious by security vendors."
    elif risk == "MEDIUM":
        return "⚡ This domain has some suspicious indicators. Proceed with caution."
    elif risk == "LOW":
        return "✅ No threats detected. Domain appears safe."
    return "Unknown reputation status."