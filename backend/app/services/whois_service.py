import asyncio
import whois
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List


async def get_whois_info(domain: str) -> Dict[str, Any]:
    """Fetch and analyze WHOIS information."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _get_whois_sync, domain)


def _get_whois_sync(domain: str) -> Dict[str, Any]:
    try:
        w = whois.whois(domain)
        
        if not w or not w.domain_name:
            return {
                "success": False,
                "domain": domain,
                "error": "No WHOIS data found",
            }
        
        # Parse dates
        creation_date = _normalize_date(w.creation_date)
        expiration_date = _normalize_date(w.expiration_date)
        updated_date = _normalize_date(w.updated_date)
        
        now = datetime.now(timezone.utc)
        
        # Domain age
        domain_age_days = None
        if creation_date:
            try:
                created_dt = datetime.fromisoformat(creation_date.replace("Z", "+00:00"))
                domain_age_days = (now - created_dt).days
            except Exception:
                pass
        
        # Days until expiry
        days_until_expiry = None
        if expiration_date:
            try:
                exp_dt = datetime.fromisoformat(expiration_date.replace("Z", "+00:00"))
                days_until_expiry = (exp_dt - now).days
            except Exception:
                pass
        
        # Suspicious pattern detection
        flags = _detect_suspicious_patterns(
            domain_age_days=domain_age_days,
            days_until_expiry=days_until_expiry,
            w=w,
        )
        
        risk_level = "LOW"
        if any(f["severity"] == "HIGH" for f in flags):
            risk_level = "HIGH"
        elif any(f["severity"] == "MEDIUM" for f in flags):
            risk_level = "MEDIUM"
        
        return {
            "success": True,
            "domain": domain,
            "risk_level": risk_level,
            "registrar": w.registrar,
            "registrar_url": w.registrar_url if hasattr(w, 'registrar_url') else None,
            "creation_date": creation_date,
            "expiration_date": expiration_date,
            "updated_date": updated_date,
            "domain_age_days": domain_age_days,
            "domain_age_years": round(domain_age_days / 365.25, 1) if domain_age_days else None,
            "days_until_expiry": days_until_expiry,
            "registrant": {
                "name": _safe_get(w, "name"),
                "org": _safe_get(w, "org"),
                "country": _safe_get(w, "country"),
                "email": _safe_get(w, "emails"),
                "privacy_protected": _is_privacy_protected(w),
            },
            "name_servers": _normalize_list(w.name_servers),
            "status": _normalize_list(w.status),
            "dnssec": _safe_get(w, "dnssec"),
            "suspicious_flags": flags,
        }
    
    except whois.parser.PywhoisError as e:
        return {
            "success": False,
            "domain": domain,
            "error": "WHOIS lookup failed",
            "details": str(e),
        }
    except Exception as e:
        return {
            "success": False,
            "domain": domain,
            "error": "WHOIS lookup error",
            "details": str(e),
        }


def _normalize_date(date_value) -> Optional[str]:
    if date_value is None:
        return None
    if isinstance(date_value, list):
        date_value = date_value[0]
    if isinstance(date_value, datetime):
        if date_value.tzinfo is None:
            date_value = date_value.replace(tzinfo=timezone.utc)
        return date_value.isoformat()
    return str(date_value)


def _normalize_list(value) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v).lower() for v in value if v]
    return [str(value).lower()]


def _safe_get(w, attr: str):
    val = getattr(w, attr, None)
    if isinstance(val, list):
        return val[0] if val else None
    return val


def _is_privacy_protected(w) -> bool:
    indicators = ["privacy", "protect", "proxy", "redacted", "withheld", "not disclosed"]
    fields = [
        str(getattr(w, "name", "") or ""),
        str(getattr(w, "org", "") or ""),
        str(getattr(w, "emails", "") or ""),
    ]
    combined = " ".join(fields).lower()
    return any(ind in combined for ind in indicators)


def _detect_suspicious_patterns(domain_age_days, days_until_expiry, w) -> List[Dict]:
    flags = []
    
    if domain_age_days is not None and domain_age_days < 30:
        flags.append({
            "type": "Newly Registered Domain",
            "severity": "HIGH",
            "description": f"Domain registered only {domain_age_days} days ago",
            "reason": "Recently registered domains are frequently used in phishing campaigns",
        })
    elif domain_age_days is not None and domain_age_days < 180:
        flags.append({
            "type": "New Domain",
            "severity": "MEDIUM",
            "description": f"Domain is less than 6 months old ({domain_age_days} days)",
            "reason": "Young domains have less established reputation",
        })
    
    if days_until_expiry is not None and days_until_expiry < 30:
        flags.append({
            "type": "Expiring Soon",
            "severity": "MEDIUM",
            "description": f"Domain expires in {days_until_expiry} days",
            "reason": "Domain may be abandoned or face service disruption",
        })
    
    country = str(getattr(w, "country", "") or "").upper()
    high_risk_countries = ["KP", "IR", "SY", "CU"]  # OFAC sanctioned
    if country in high_risk_countries:
        flags.append({
            "type": "High Risk Registrant Country",
            "severity": "HIGH",
            "description": f"Domain registered from: {country}",
            "reason": "Registrant country is on sanction lists",
        })
    
    return flags