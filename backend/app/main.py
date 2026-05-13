"""
MealDeal API — application entry point.

Defines the FastAPI app instance and wires up MongoDB lifecycle
management via the lifespan context manager (FastAPI's recommended
pattern as of v0.93+, replacing on_event handlers).
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import connect_to_mongo, close_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    connect_to_mongo()
    yield
    close_mongo_connection()


app = FastAPI(title="MealDeal API", version="0.1.0", lifespan=lifespan)


@app.get("/")
def read_root():
    return {"message": "MealDeal API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
