"""
Application configuration loaded from environment variables.

Uses python-dotenv to read the .env file at import time so that
environment variables are available throughout the application.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Centralized access to environment-driven configuration."""

    # MongoDB
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "mealdeal")

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "insecure-dev-secret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))


settings = Settings()
