import asyncio
import socket
from typing import Dict, Any

COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 143, 443, 3306, 3389, 5432, 5900, 8080, 8443]

async def scan_ports(domain: str) -> Dict[str, Any]:
    """Async port scanner with risk assessment."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _scan_ports_sync, domain)

def _scan_ports_sync(host: str) -> Dict[str, Any]:
    open_ports = []
    closed = 0
    filtered = 0

    for port in COMMON_PORTS:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.2)
        result = sock.connect_ex((host, port))
        sock.close()

        service = _get_service_name(port)
        risk = _assess_port_risk(port, result == 0)

        if result == 0:
            open_ports.append({
                "port": port,
                "service": service,
                "state": "OPEN",
                "risk": risk
            })
        elif result in [10060, 11001, 11004]:  # timeout / no route
            filtered += 1
        else:
            closed += 1

    overall_risk = "LOW"
    if any(p["risk"] == "CRITICAL" for p in open_ports):
        overall_risk = "CRITICAL"
    elif any(p["risk"] == "HIGH" for p in open_ports):
        overall_risk = "HIGH"
    elif any(p["risk"] == "MEDIUM" for p in open_ports):
        overall_risk = "MEDIUM"

    return {
        "success": True,
        "domain": host,
        "ip": host,
        "ports": open_ports,
        "summary": {
            "total_scanned": len(COMMON_PORTS),
            "open": len(open_ports),
            "closed": closed,
            "filtered": filtered,
        },
        "critical_alerts": [p for p in open_ports if p["risk"] in ["CRITICAL", "HIGH"]],
        "overall_risk": overall_risk
    }

def _get_service_name(port: int) -> str:
    services = {
        21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
        53: "DNS", 80: "HTTP", 110: "POP3", 143: "IMAP",
        443: "HTTPS", 3306: "MySQL", 3389: "RDP",
        5432: "PostgreSQL", 5900: "VNC", 8080: "HTTP-Alt", 8443: "HTTPS-Alt"
    }
    return services.get(port, f"Unknown")

def _assess_port_risk(port: int, is_open: bool) -> str:
    if not is_open:
        return "LOW"
    if port in [21, 23, 25, 3389, 5900]:   # High risk services
        return "HIGH"
    if port in [22, 3306, 5432, 110, 143]:
        return "MEDIUM"
    return "LOW"