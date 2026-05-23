"""
PriceListing domain model and schemas.

A PriceListing records the price of a single MenuItem on a single delivery
platform. The same menu item typically has multiple price listings — one per
platform — which is exactly what enables price comparison.

The combination of (menu_item_id, platform) is treated as unique: a given
item can only have one price per platform.

Schemas:
- PriceListingCreate: input for creating a price listing (admin)
- PriceListingUpdate: input for updating the price (admin)
- PriceListingPublic: representation returned to clients
"""

from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field


class Platform(str, Enum):
    """The delivery platforms MealDeal compares prices across."""
    UBEREATS = "UberEats"
    DOORDASH = "DoorDash"
    MENULOG = "Menulog"
    DELIVEROO = "Deliveroo"


class PriceListingCreate(BaseModel):
    """Schema for creating a new price listing."""
    menu_item_id: str = Field(min_length=1)
    platform: Platform
    price: float = Field(gt=0, le=1000)
    delivery_fee: float = Field(default=0, ge=0, le=100)


class PriceListingUpdate(BaseModel):
    """Schema for updating a price listing. Price fields only."""
    price: float | None = Field(default=None, gt=0, le=1000)
    delivery_fee: float | None = Field(default=None, ge=0, le=100)


class PriceListingPublic(BaseModel):
    """Schema returned to clients. Maps Mongo's _id to a string id field."""
    id: str
    menu_item_id: str
    platform: Platform
    price: float
    delivery_fee: float
    updated_at: datetime


def price_listing_doc_to_public(doc: dict) -> PriceListingPublic:
    """Convert a raw MongoDB price listing document into a public schema."""
    return PriceListingPublic(
        id=str(doc["_id"]),
        menu_item_id=doc["menu_item_id"],
        platform=doc["platform"],
        price=doc["price"],
        delivery_fee=doc.get("delivery_fee", 0),
        updated_at=doc["updated_at"],
    )
