import httpx
import asyncio
from typing import Dict, Any, List
from datetime import datetime


async def get_wayback_history(domain: str) -> Dict[str, Any]:
    """Fetch website history from Wayback Machine."""
    
    cdx_task = _get_cdx_snapshots(domain)
    availability_task = _check_availability(domain)
    
    cdx_result, availability = await asyncio.gather(cdx_task, availability_task, return_exceptions=True)
    
    if isinstance(cdx_result, Exception):
        cdx_result = []
    if isinstance(availability, Exception):
        availability = None
    
    # Process timeline
    timeline = _build_timeline(cdx_result)
    
    return {
        "success": True,
        "domain": domain,
        "availability": availability,
        "total_snapshots": len(cdx_result),
        "timeline": timeline,
        "snapshots": cdx_result[:20],  # Last 20 snapshots
        "first_seen": cdx_result[-1].get("timestamp") if cdx_result else None,
        "last_seen": cdx_result[0].get("timestamp") if cdx_result else None,
        "years_active": _calculate_years_active(cdx_result),
        "archive_url": f"https://web.archive.org/web/*/{domain}",
    }


async def _get_cdx_snapshots(domain: str) -> List[Dict]:
    """Fetch CDX snapshots from Wayback Machine API."""
    url = "https://web.archive.org/cdx/search/cdx"
    params = {
        "url": domain,
        "output": "json",
        "limit": 100,
        "from": "20000101",
        "collapse": "timestamp:6",  # Collapse by month
        "fl": "timestamp,statuscode,mimetype,length",
        "filter": "statuscode:200",
    }
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            resp = await client.get(url, params=params)
            data = resp.json()
            
            if not data or len(data) < 2:
                return []
            
            headers = data[0]
            rows = data[1:]
            
            snapshots = []
            for row in rows:
                if len(row) >= 4:
                    ts = row[0]
                    try:
                        dt = datetime.strptime(ts, "%Y%m%d%H%M%S")
                        snapshot = {
                            "timestamp": ts,
                            "date": dt.strftime("%Y-%m-%d %H:%M:%S"),
                            "year": dt.year,
                            "month": dt.month,
                            "status_code": row[1],
                            "mime_type": row[2],
                            "length": row[3],
                            "url": f"https://web.archive.org/web/{ts}/{domain}",
                        }
                        snapshots.append(snapshot)
                    except ValueError:
                        continue
            
            return sorted(snapshots, key=lambda x: x["timestamp"], reverse=True)
        
        except Exception:
            return []


async def _check_availability(domain: str) -> Dict[str, Any]:
    """Check current availability of domain on Wayback Machine."""
    url = f"https://archive.org/wayback/available?url={domain}"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url)
            data = resp.json()
            
            archived = data.get("archived_snapshots", {}).get("closest", {})
            if archived:
                return {
                    "available": archived.get("available", False),
                    "url": archived.get("url"),
                    "timestamp": archived.get("timestamp"),
                    "status": archived.get("status"),
                }
            return {"available": False}
        
        except Exception:
            return {"available": False}


def _build_timeline(snapshots: List[Dict]) -> List[Dict]:
    """Build yearly timeline from snapshots."""
    if not snapshots:
        return []
    
    year_counts: Dict[int, int] = {}
    for snap in snapshots:
        year = snap.get("year")
        if year:
            year_counts[year] = year_counts.get(year, 0) + 1
    
    return sorted([
        {"year": year, "count": count}
        for year, count in year_counts.items()
    ], key=lambda x: x["year"])


def _calculate_years_active(snapshots: List[Dict]) -> int:
    if not snapshots:
        return 0
    
    years = set(s.get("year") for s in snapshots if s.get("year"))
    if not years:
        return 0
    
    return max(years) - min(years) + 1