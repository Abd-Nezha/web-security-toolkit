# 🛡️ Web Security Intelligence Toolkit (WSIT)

Professional-grade website security analysis platform — SSL, DNS, Vulnerabilities, Reputation, Ports, Wayback, WHOIS & Blacklist all in one scan.

---

## 📁 Project Structure

```
web-security-toolkit/
│
├── 📂 backend/                          # FastAPI Python Backend
│   ├── 📂 app/
│   │   ├── 📂 api/
│   │   │   └── 📂 routes/
│   │   │       ├── scan.py              # POST /api/v1/scan (full scan)
│   │   │       ├── ssl.py               # GET /api/v1/ssl/inspect
│   │   │       ├── headers.py           # GET /api/v1/headers/audit
│   │   │       ├── vulnerabilities.py   # GET /api/v1/vulnerabilities/scan
│   │   │       ├── dns.py               # GET /api/v1/dns/lookup
│   │   │       ├── reputation.py        # GET /api/v1/reputation/check
│   │   │       ├── ports.py             # GET /api/v1/ports/scan
│   │   │       ├── wayback.py           # GET /api/v1/wayback/history
│   │   │       ├── whois.py             # GET /api/v1/whois/info
│   │   │       └── blacklist.py         # GET /api/v1/blacklist/history
│   │   │
│   │   ├── 📂 core/
│   │   │   ├── config.py                # App settings & env vars
│   │   │   ├── cache.py                 # Redis cache helpers
│   │   │   └── validators.py            # Input sanitization
│   │   │
│   │   ├── 📂 services/                 # Business logic layer
│   │   │   ├── scan_service.py          # Orchestrates all scans in parallel
│   │   │   ├── ssl_service.py           # SSL/TLS certificate inspection
│   │   │   ├── headers_service.py       # Security header audit
│   │   │   ├── vulnerability_service.py # CVE & misconfiguration detection
│   │   │   ├── dns_service.py           # DNS record resolution
│   │   │   ├── reputation_service.py    # VirusTotal + Google Safe Browsing
│   │   │   ├── ports_service.py         # Async port scanner
│   │   │   ├── wayback_service.py       # Archive.org integration
│   │   │   ├── whois_service.py         # WHOIS data + suspicious pattern detection
│   │   │   └── blacklist_service.py     # Aggregated blacklist history
│   │   │
│   │   └── main.py                      # FastAPI app entry point
│   │
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example                     # ← Copy to .env and fill in values
│
├── 📂 frontend/                         # Next.js 14 App Router Frontend
│   ├── 📂 app/
│   │   ├── layout.tsx                   # Root HTML layout
│   │   ├── page.tsx                     # Main page (scan UI + results)
│   │   └── globals.css                  # Global styles + CSS variables
│   │
│   ├── 📂 components/
│   │   ├── 📂 ui/
│   │   │   ├── BaseCard.tsx             # Reusable card wrapper
│   │   │   └── SkeletonCard.tsx         # Loading skeleton
│   │   │
│   │   └── 📂 sections/                 # Individual result cards
│   │       ├── SSLCard.tsx              # SSL certificate results
│   │       ├── HeadersCard.tsx          # Security headers results
│   │       ├── VulnerabilityCard.tsx    # CVE scan results
│   │       ├── DNSCard.tsx              # DNS records results
│   │       ├── ReputationCard.tsx       # Domain reputation results
│   │       ├── PortsCard.tsx            # Port scan results
│   │       ├── WhoisCard.tsx            # WHOIS data results
│   │       ├── WaybackCard.tsx          # Wayback Machine results
│   │       └── BlacklistCard.tsx        # Blacklist history results
│   │
│   ├── 📂 lib/
│   │   ├── api.ts                       # Axios API client + all endpoints
│   │   └── utils.ts                     # Risk color helpers, date formatters
│   │
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── Dockerfile
│   └── .env.example                     # ← Copy to .env.local
│
├── docker-compose.yml                   # Full stack deployment
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- Redis (running locally or via Docker)
- PostgreSQL (optional — Redis caching works without it)

---

### 1. Clone & Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env and add your API keys (see API Keys section below)

# Start the server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API Docs at: **http://localhost:8000/api/docs**

---

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

### 3. Start Redis (required for caching)

```bash
# Via Docker (easiest)
docker run -d -p 6379:6379 redis:7-alpine

# Or install locally
# Ubuntu: sudo apt install redis-server && redis-server
# Mac: brew install redis && redis-server
```

---

## 🐳 Docker Deployment (Recommended for Production)

```bash
# Copy and fill in all env vars
cp backend/.env.example backend/.env

# Build and start everything
docker-compose up --build -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

All services start automatically:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Redis: localhost:6379
- PostgreSQL: localhost:5432

---

## 🔑 API Keys Setup

Add these to `backend/.env`:

### VirusTotal (Free — 4 requests/minute)
1. Go to https://www.virustotal.com/gui/my-apikey
2. Create a free account
3. Copy API key → `VIRUSTOTAL_API_KEY=your_key_here`

### Google Safe Browsing (Free — 10,000 requests/day)
1. Go to https://console.cloud.google.com
2. Enable "Safe Browsing API"
3. Create credentials → API Key
4. Copy → `GOOGLE_SAFE_BROWSING_API_KEY=your_key_here`

> **Note:** The tool works without API keys — VirusTotal and Google Safe Browsing sections will show a "configure API key" message, but all other 7 modules (SSL, Headers, Vulnerabilities, DNS, Ports, Wayback, WHOIS) work fully without any API keys.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/scan` | Full parallel scan (all modules) |
| GET | `/api/v1/ssl/inspect?domain=` | SSL certificate inspection |
| GET | `/api/v1/headers/audit?domain=` | Security header audit |
| GET | `/api/v1/vulnerabilities/scan?domain=` | Vulnerability & CVE scan |
| GET | `/api/v1/dns/lookup?domain=` | DNS record lookup |
| GET | `/api/v1/reputation/check?domain=` | Domain reputation check |
| GET | `/api/v1/ports/scan?domain=` | Port health scanner |
| GET | `/api/v1/wayback/history?domain=` | Wayback Machine history |
| GET | `/api/v1/whois/info?domain=` | WHOIS data & analysis |
| GET | `/api/v1/blacklist/history?domain=` | Blacklist history |
| GET | `/api/health` | Health check |

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Optional | PostgreSQL connection string |
| `REDIS_URL` | Recommended | Redis connection (default: localhost:6379) |
| `CACHE_TTL` | Optional | Cache duration in seconds (default: 600) |
| `VIRUSTOTAL_API_KEY` | Optional | VirusTotal API key |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Optional | Google Safe Browsing API key |
| `ALLOWED_ORIGINS` | Optional | CORS allowed origins |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (default: http://localhost:8000/api/v1) |

---

## 🔒 Security Features

- **Input Sanitization** — All domain inputs are validated and sanitized
- **Rate Limiting** — 10–30 req/min per IP per endpoint via SlowAPI
- **Redis Caching** — Results cached for 10 minutes to prevent abuse
- **CORS Protection** — Configurable allowed origins
- **API Key Protection** — Keys stored in env vars, never exposed to frontend
- **Error Handling** — Graceful error responses, no stack trace leakage

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Python 3.12, FastAPI, asyncio |
| Cache | Redis 7 |
| Database | PostgreSQL 16 |
| Containerization | Docker + Docker Compose |

---

## 📄 License

For authorized security testing and research only. Do not scan domains you do not own or have explicit permission to test.