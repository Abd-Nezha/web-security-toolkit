import asyncio
from typing import Dict, Any
from app.services import (
    ssl_service,
    headers_service,
    vulnerability_service,
    dns_service,
    reputation_service,
    ports_service,
    wayback_service,
    whois_service,
    blacklist_service,
)
from app.core.cache import cache_get, cache_set


async def run_full_scan(domain: str) -> Dict[str, Any]:
    """Run all security scans in parallel."""
    
    cache_key = f"full_scan:{domain}"
    cached = await cache_get(cache_key)
    if cached:
        return {**cached, "cached": True}
    
    # Run all scans concurrently
    tasks = {
        "ssl": ssl_service.inspect_ssl(domain),
        "headers": headers_service.audit_headers(domain),
        "vulnerabilities": vulnerability_service.scan_vulnerabilities(domain),
        "dns": dns_service.lookup_dns(domain),
        "reputation": reputation_service.check_reputation(domain),
        "ports": ports_service.scan_ports(domain),
        "wayback": wayback_service.get_wayback_history(domain),
        "whois": whois_service.get_whois_info(domain),
        "blacklist": blacklist_service.check_blacklist_history(domain),
    }
    
    results = await asyncio.gather(
        *tasks.values(),
        return_exceptions=True,
    )
    
    scan_results = {}
    for key, result in zip(tasks.keys(), results):
        if isinstance(result, Exception):
            scan_results[key] = {
                "success": False,
                "error": str(result),
                "domain": domain,
            }
        else:
            scan_results[key] = result
    
    # Compute overall risk score
    overall = _compute_overall_risk(scan_results)
    
    response = {
        "domain": domain,
        "cached": False,
        "overall_risk": overall["risk"],
        "risk_score": overall["score"],
        "summary": overall["summary"],
        **scan_results,
    }
    
    await cache_set(cache_key, response)
    return response


def _compute_overall_risk(results: Dict) -> Dict[str, Any]:
    risk_scores = {
        "CRITICAL": 100,
        "HIGH": 75,
        "MEDIUM": 50,
        "LOW": 25,
        "UNKNOWN": 0,
    }
    
    risk_fields = {
        "ssl": results.get("ssl", {}).get("risk_level", "UNKNOWN"),
        "headers": _map_grade_to_risk(results.get("headers", {}).get("grade")),
        "vulnerabilities": results.get("vulnerabilities", {}).get("overall_risk", "UNKNOWN"),
        "ports": results.get("ports", {}).get("overall_risk", "UNKNOWN"),
        "reputation": results.get("reputation", {}).get("overall_risk", "UNKNOWN"),
        "whois": results.get("whois", {}).get("risk_level", "UNKNOWN"),
        "blacklist": results.get("blacklist", {}).get("overall_risk", "UNKNOWN"),
    }
    
    scores = [risk_scores.get(v, 0) for v in risk_fields.values()]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    if avg_score >= 80:
        overall_risk = "CRITICAL"
    elif avg_score >= 60:
        overall_risk = "HIGH"
    elif avg_score >= 35:
        overall_risk = "MEDIUM"
    else:
        overall_risk = "LOW"
    
    return {
        "risk": overall_risk,
        "score": round(100 - avg_score),  # Higher = safer
        "summary": {
            "ssl": risk_fields["ssl"],
            "headers": risk_fields["headers"],
            "vulnerabilities": risk_fields["vulnerabilities"],
            "ports": risk_fields["ports"],
            "reputation": risk_fields["reputation"],
            "whois": risk_fields["whois"],
            "blacklist": risk_fields["blacklist"],
        }
    }


def _map_grade_to_risk(grade: str) -> str:
    mapping = {
        "A": "LOW",
        "B": "LOW",
        "C": "MEDIUM",
        "D": "HIGH",
        "F": "CRITICAL",
    }
    return mapping.get(grade, "UNKNOWN")