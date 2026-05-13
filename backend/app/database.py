"""
MongoDB connection module.

Initializes a single MongoClient on application startup and exposes
a `get_db()` helper for accessing the database from route handlers.
"""

from pymongo import MongoClient
from app.config import settings


client: MongoClient | None = None


def connect_to_mongo() -> None:
    """Establish a connection to MongoDB and verify it is reachable."""
    global client
    client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=3000)
    # ping forces the driver to actually contact the server
    client.admin.command("ping")
    print(f"✅ Connected to MongoDB at {settings.MONGO_URI}")


def close_mongo_connection() -> None:
    """Close the MongoDB connection on application shutdown."""
    global client
    if client is not None:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    """Return the active database handle for use in route dependencies."""
    if client is None:
        raise RuntimeError("MongoDB client not initialized. Did startup run?")
    return client[settings.MONGO_DB_NAME]
