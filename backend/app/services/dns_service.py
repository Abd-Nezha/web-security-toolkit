import dns.resolver
import dns.reversename
import asyncio
import ipaddress
from typing import Dict, Any, List, Optional
import httpx


async def lookup_dns(domain: str) -> Dict[str, Any]:
    """Perform comprehensive DNS lookup."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _lookup_dns_sync, domain)


def _lookup_dns_sync(domain: str) -> Dict[str, Any]:
    resolver = dns.resolver.Resolver()
    resolver.timeout = 5
    resolver.lifetime = 10
    
    result = {
        "success": True,
        "domain": domain,
        "records": {},
        "hosting": {},
        "cdn": None,
        "ip_info": [],
    }
    
    record_types = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"]
    
    for rtype in record_types:
        try:
            answers = resolver.resolve(domain, rtype)
            records = []
            
            if rtype == "A":
                for rdata in answers:
                    ip = str(rdata)
                    records.append(ip)
                    # Get hosting info for each IP
                    hosting_info = _get_ip_info_sync(ip)
                    result["ip_info"].append({"ip": ip, **hosting_info})
                    
                    # Detect CDN
                    cdn = _detect_cdn_from_ip(hosting_info)
                    if cdn:
                        result["cdn"] = cdn
                        
            elif rtype == "AAAA":
                records = [str(rdata) for rdata in answers]
                
            elif rtype == "MX":
                records = [{"priority": rdata.preference, "exchange": str(rdata.exchange)} for rdata in answers]
                result["mail_provider"] = _detect_mail_provider(records)
                
            elif rtype == "NS":
                records = [str(rdata) for rdata in answers]
                result["hosting"]["nameservers"] = records
                result["hosting"]["provider"] = _detect_hosting_from_ns(records)
                
            elif rtype == "TXT":
                records = [str(rdata) for rdata in answers]
                result["txt_analysis"] = _analyze_txt_records(records)
                
            elif rtype == "SOA":
                for rdata in answers:
                    records = [{
                        "mname": str(rdata.mname),
                        "rname": str(rdata.rname),
                        "serial": rdata.serial,
                        "refresh": rdata.refresh,
                        "retry": rdata.retry,
                        "expire": rdata.expire,
                        "minimum": rdata.minimum,
                    }]
                    
            elif rtype == "CNAME":
                records = [str(rdata) for rdata in answers]
            
            result["records"][rtype] = records
            
        except dns.resolver.NXDOMAIN:
            if rtype == "A":
                result["success"] = False
                result["error"] = "Domain does not exist (NXDOMAIN)"
                return result
        except dns.resolver.NoAnswer:
            result["records"][rtype] = []
        except Exception as e:
            result["records"][rtype] = []
    
    return result


def _get_ip_info_sync(ip: str) -> Dict[str, Any]:
    """Get geolocation and ASN info for an IP."""
    try:
        import urllib.request
        import json
        with urllib.request.urlopen(f"https://ipapi.co/{ip}/json/", timeout=5) as resp:
            data = json.loads(resp.read().decode())
            return {
                "city": data.get("city"),
                "region": data.get("region"),
                "country": data.get("country_name"),
                "org": data.get("org"),
                "asn": data.get("asn"),
                "isp": data.get("isp"),
            }
    except Exception:
        return {
            "city": None,
            "region": None,
            "country": None,
            "org": None,
            "asn": None,
            "isp": None,
        }


def _detect_cdn_from_ip(ip_info: Dict) -> Optional[str]:
    org = (ip_info.get("org") or "").lower()
    isp = (ip_info.get("isp") or "").lower()
    combined = f"{org} {isp}"
    
    cdns = {
        "cloudflare": "Cloudflare",
        "fastly": "Fastly",
        "akamai": "Akamai",
        "amazon": "AWS CloudFront",
        "google": "Google Cloud CDN",
        "microsoft azure": "Azure CDN",
        "sucuri": "Sucuri",
    }
    
    for key, name in cdns.items():
        if key in combined:
            return name
    return None


def _detect_hosting_from_ns(nameservers: List[str]) -> str:
    ns_string = " ".join(nameservers).lower()
    
    providers = {
        "cloudflare": "Cloudflare",
        "awsdns": "Amazon Route 53",
        "azure-dns": "Azure DNS",
        "google": "Google Cloud DNS",
        "digitalocean": "DigitalOcean",
        "godaddy": "GoDaddy",
        "namecheap": "Namecheap",
        "bluehost": "Bluehost",
        "siteground": "SiteGround",
    }
    
    for key, name in providers.items():
        if key in ns_string:
            return name
    return "Unknown"


def _detect_mail_provider(mx_records: List[Dict]) -> str:
    mx_string = " ".join(r.get("exchange", "") for r in mx_records).lower()
    
    providers = {
        "google": "Google Workspace",
        "googlemail": "Google Workspace",
        "outlook": "Microsoft 365",
        "microsoft": "Microsoft 365",
        "mailgun": "Mailgun",
        "sendgrid": "SendGrid",
        "amazonses": "Amazon SES",
        "zoho": "Zoho Mail",
        "protonmail": "ProtonMail",
    }
    
    for key, name in providers.items():
        if key in mx_string:
            return name
    return "Unknown"


def _analyze_txt_records(records: List[str]) -> Dict[str, Any]:
    analysis = {
        "spf": None,
        "dmarc_hint": None,
        "google_verification": False,
        "other": [],
    }
    
    for record in records:
        record_lower = record.lower()
        if "v=spf1" in record_lower:
            analysis["spf"] = record
        elif "google-site-verification" in record_lower:
            analysis["google_verification"] = True
        else:
            analysis["other"].append(record[:100])
    
    return analysis