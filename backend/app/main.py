"""
MealDeal API — application entry point.

Defines the FastAPI app instance, wires up MongoDB lifecycle management
via the lifespan context manager, and registers route modules.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth as auth_routes
from app.routes import restaurants as restaurant_routes
from app.routes import menu_items as menu_item_routes
from app.routes import price_listings as price_listing_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    connect_to_mongo()
    yield
    close_mongo_connection()


app = FastAPI(title="MealDeal API", version="0.1.0", lifespan=lifespan)

# Route registration — each feature lives in its own module under app/routes/
app.include_router(auth_routes.router)
app.include_router(restaurant_routes.router)
app.include_router(menu_item_routes.router)
app.include_router(price_listing_routes.router)


@app.get("/")
def read_root():
    return {"message": "MealDeal API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
