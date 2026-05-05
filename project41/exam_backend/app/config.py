import os


class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY", "exam-system-secret-key-dev-2024")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
    DATABASE_URL = os.getenv("DATABASE_URL", "exam.db")


settings = Settings()
