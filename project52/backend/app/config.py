from pydantic import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL = "sqlite:///./data/creator_toolbox.db"
    SECRET_KEY = "your-secret-key-here"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

    class Config:
        env_file = ".env"


settings = Settings()
