from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "GreatScout"
    TAGLINE: str = "Scout Smart, Build Better."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development", description="development | production | test")
    DEBUG: bool = True

    # Database
    # Defaults to SQLite async for zero-dependency local dev/testing;
    # in Docker/Production: postgresql+asyncpg://postgres:postgres@postgres:5432/greatscout
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./greatscout.db",
        description="SQLAlchemy async connection string"
    )

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    # AI Configuration
    AI_PROVIDER: str = Field(
        default="heuristic",
        description="heuristic | openai | gemini | anthropic"
    )
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Upstream APIs
    PRODUCT_HUNT_API_TOKEN: Optional[str] = None
    REDDIT_CLIENT_ID: Optional[str] = None
    REDDIT_CLIENT_SECRET: Optional[str] = None
    REDDIT_USER_AGENT: str = "GreatScoutMarketIntel/1.0"

    # Demo Mode Default
    ENABLE_DEMO_SEED: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
