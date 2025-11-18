from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os


class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="")
    GEMINI_API_KEY: str = Field(default="")
    HOST: str = Field(default="")
    PORT: int = Field(default=3000)
    DEBUG: bool = Field(default=False)
    SECRET_KEY: str = Field(default="")
    LOG_LEVEL: str = Field(default="INFO")
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }


settings = Settings()