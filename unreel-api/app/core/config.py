from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/unreel"
    GEMINI_API_KEY: str = "AIzaSyA8SXQT9IpUHp_iERLvzWIw2bg3At82S3U"
    HOST: str = "127.0.0.1"
    PORT: int = 3000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )


settings = Settings()