from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Web Security Intelligence Toolkit"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-key-change-in-production"

    # Database
    DATABASE_URL: str = ""
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    CACHE_TTL: int = 600

    # API Keys
    VIRUSTOTAL_API_KEY: str = "97f72e94b54287dd1e2b40d07f0b06760a7670f56802a08e2a12734858490f21"
    GOOGLE_SAFE_BROWSING_API_KEY: str = "AIzaSyCZktkpwEILHgBg3gsqo0kI_1Xln80RxQ"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://websecuritytool.vercel.app",           # Vercel Frontend
        "https://web-security-toolkit.onrender.com",    # Render Backend
        "https://websecuritytool.onrender.com",         # Agar alag naam hai toh yeh bhi add kar do
    ]

    # Rate Limiting
    RATE_LIMIT: str = "30/minute"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"   # Extra fields ignore karne ke liye

settings = Settings()