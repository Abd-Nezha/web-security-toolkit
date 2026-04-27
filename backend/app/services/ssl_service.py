import ssl
import socket
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import OpenSSL.crypto as crypto


async def inspect_ssl(domain: str) -> Dict[str, Any]:
    """Perform deep SSL certificate inspection."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _inspect_ssl_sync, domain)


def _inspect_ssl_sync(domain: str) -> Dict[str, Any]:
    try:
        context = ssl.create_default_context()
        
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert_der = ssock.getpeercert(binary_form=True)
                cert_info = ssock.getpeercert()
                cipher = ssock.cipher()
                protocol = ssock.version()
        
        # Parse with OpenSSL for more detail
        x509 = crypto.load_certificate(crypto.FILETYPE_ASN1, cert_der)
        
        subject = dict(x509.get_subject().get_components())
        issuer = dict(x509.get_issuer().get_components())
        
        # Decode bytes
        subject = {k.decode(): v.decode() for k, v in subject.items()}
        issuer = {k.decode(): v.decode() for k, v in issuer.items()}
        
        not_before = datetime.strptime(x509.get_notBefore().decode(), "%Y%m%d%H%M%SZ").replace(tzinfo=timezone.utc)
        not_after = datetime.strptime(x509.get_notAfter().decode(), "%Y%m%d%H%M%SZ").replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        
        days_remaining = (not_after - now).days
        
        # Risk level
        if days_remaining < 0:
            risk_level = "CRITICAL"
            risk_label = "Expired"
        elif days_remaining <= 14:
            risk_level = "HIGH"
            risk_label = "Expiring Soon"
        elif days_remaining <= 30:
            risk_level = "MEDIUM"
            risk_label = "Expiring Within 30 Days"
        else:
            risk_level = "LOW"
            risk_label = "Valid"
        
        # SANs
        sans = []
        for i in range(x509.get_extension_count()):
            ext = x509.get_extension(i)
            if ext.get_short_name() == b'subjectAltName':
                sans = [s.strip() for s in str(ext).split(",")]
        
        # Chain info
        chain = []
        if cert_info.get("caIssuers"):
            chain = list(cert_info.get("caIssuers", []))
        
        return {
            "success": True,
            "domain": domain,
            "subject": subject,
            "issuer": {
                "organization": issuer.get("O", "Unknown"),
                "common_name": issuer.get("CN", "Unknown"),
                "country": issuer.get("C", "Unknown"),
            },
            "valid_from": not_before.isoformat(),
            "valid_until": not_after.isoformat(),
            "days_remaining": days_remaining,
            "risk_level": risk_level,
            "risk_label": risk_label,
            "serial_number": str(x509.get_serial_number()),
            "signature_algorithm": x509.get_signature_algorithm().decode(),
            "version": x509.get_version(),
            "sans": sans[:10],  # Limit to 10
            "cipher": {
                "name": cipher[0] if cipher else "Unknown",
                "protocol": cipher[1] if cipher else "Unknown",
                "bits": cipher[2] if cipher else 0,
            },
            "tls_version": protocol,
            "chain": chain,
        }
    
    except ssl.SSLCertVerificationError as e:
        return {
            "success": False,
            "domain": domain,
            "error": "SSL Certificate Verification Failed",
            "details": str(e),
            "risk_level": "CRITICAL",
            "risk_label": "Invalid Certificate",
        }
    except socket.timeout:
        return {
            "success": False,
            "domain": domain,
            "error": "Connection Timeout",
            "details": "Could not connect to port 443",
            "risk_level": "HIGH",
            "risk_label": "Connection Failed",
        }
    except ConnectionRefusedError:
        return {
            "success": False,
            "domain": domain,
            "error": "Connection Refused",
            "details": "Port 443 is not open or HTTPS is not available",
            "risk_level": "HIGH",
            "risk_label": "No HTTPS",
        }
    except Exception as e:
        return {
            "success": False,
            "domain": domain,
            "error": "SSL Inspection Failed",
            "details": str(e),
            "risk_level": "UNKNOWN",
            "risk_label": "Unknown",
        }