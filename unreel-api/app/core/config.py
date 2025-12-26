from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/unreel"
    GEMINI_API_KEY: str = "AIzaSyA8SXQT9IpUHp_iERLvzWIw2bg3At82S3U"
    HOST: str = "0.0.0.0"  # Changed from 127.0.0.1 to 0.0.0.0 to accept external connections
    PORT: int = 3000
    # Additional settings from .env.sample
    DEBUG: bool = True
    SECRET_KEY: str = "your_secret_key_here"
    LOG_LEVEL: str = "INFO"
    # Instagram cookie file path
    INSTAGRAM_COOKIE_FILE: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

settings = Settings()