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
    VIRUSTOTAL_API_KEY: str = ""
    GOOGLE_SAFE_BROWSING_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Rate Limiting
    RATE_LIMIT: str = "30/minute"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"   # Extra fields ignore karne ke liye

settings = Settings()