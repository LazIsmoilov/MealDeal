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

    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "mealdeal")


settings = Settings()
