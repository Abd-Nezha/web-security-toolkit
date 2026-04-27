import httpx
import asyncio
from typing import Dict, Any, List
from app.core.config import settings
from datetime import datetime


async def check_blacklist_history(domain: str) -> Dict[str, Any]:
    """Check domain against multiple blacklists and compile history."""
    
    vt_task = _get_vt_history(domain)
    gsb_task = _get_gsb_status(domain)
    
    vt_result, gsb_result = await asyncio.gather(vt_task, gsb_task, return_exceptions=True)
    
    if isinstance(vt_result, Exception):
        vt_result = {"available": False, "error": str(vt_result)}
    if isinstance(gsb_result, Exception):
        gsb_result = {"available": False, "error": str(gsb_result)}
    
    # Compile risk timeline
    risk_events = []
    
    if vt_result.get("analysis_results"):
        for engine, result in vt_result["analysis_results"].items():
            if result.get("category") in ["malicious", "phishing", "malware", "spam"]:
                risk_events.append({
                    "source": f"VirusTotal ({engine})",
                    "type": result.get("category", "malicious").upper(),
                    "severity": "HIGH",
                    "date": vt_result.get("last_analysis_date"),
                })
    
    if gsb_result.get("threats"):
        for threat in gsb_result["threats"]:
            risk_events.append({
                "source": "Google Safe Browsing",
                "type": threat.get("threatType", "UNKNOWN"),
                "severity": "CRITICAL",
                "date": datetime.utcnow().isoformat(),
            })
    
    overall_risk = "LOW"
    if risk_events:
        critical = any(e["severity"] == "CRITICAL" for e in risk_events)
        overall_risk = "CRITICAL" if critical else "HIGH"
    
    return {
        "success": True,
        "domain": domain,
        "overall_risk": overall_risk,
        "total_flags": len(risk_events),
        "risk_events": risk_events,
        "virustotal_history": vt_result,
        "google_safe_browsing": gsb_result,
        "clean": len(risk_events) == 0,
        "verdict": "Clean - No blacklist entries found" if len(risk_events) == 0 else f"Found on {len(risk_events)} blacklist(s)",
    }


async def _get_vt_history(domain: str) -> Dict[str, Any]:
    if not settings.VIRUSTOTAL_API_KEY:
        return {
            "available": False,
            "note": "VirusTotal API key not configured",
        }
    
    headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            # Get domain analysis
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/domains/{domain}",
                headers=headers,
            )
            
            if resp.status_code != 200:
                return {"available": True, "found": False}
            
            data = resp.json()
            attrs = data.get("data", {}).get("attributes", {})
            analysis_results = attrs.get("last_analysis_results", {})
            stats = attrs.get("last_analysis_stats", {})
            
            # Filter only detecting engines
            flagging_engines = {
                k: v for k, v in analysis_results.items()
                if v.get("category") in ["malicious", "phishing", "malware", "spam"]
            }
            
            return {
                "available": True,
                "found": True,
                "stats": stats,
                "flagging_engines": flagging_engines,
                "analysis_results": analysis_results,
                "last_analysis_date": attrs.get("last_analysis_date"),
                "reputation": attrs.get("reputation", 0),
                "total_votes": attrs.get("total_votes", {}),
            }
        
        except Exception as e:
            return {"available": False, "error": str(e)}


async def _get_gsb_status(domain: str) -> Dict[str, Any]:
    if not settings.GOOGLE_SAFE_BROWSING_API_KEY:
        return {
            "available": False,
            "note": "Google Safe Browsing API key not configured",
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
                {"url": f"https://www.{domain}"},
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
                "is_safe": len(threats) == 0,
                "threats": threats,
                "threat_types": list(set(t.get("threatType") for t in threats)),
            }
        except Exception as e:
            return {"available": False, "error": str(e)}