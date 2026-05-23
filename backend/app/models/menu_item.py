"""
MenuItem domain model and schemas.

A MenuItem is a dish offered by a Restaurant (e.g. "Cheeseburger").
Each MenuItem belongs to exactly one Restaurant via restaurant_id.
PriceListings (next commit) attach to a MenuItem to record what each
delivery platform charges for it.

Schemas:
- MenuItemCreate: input for creating a menu item (admin)
- MenuItemUpdate: input for partial updates (all fields optional)
- MenuItemPublic: representation returned to clients
"""

from datetime import datetime, timezone
from pydantic import BaseModel, Field


class MenuItemCreate(BaseModel):
    """Schema for creating a new menu item."""
    restaurant_id: str = Field(min_length=1)
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(default="", max_length=60)
    description: str = Field(default="", max_length=500)
    image_url: str = Field(default="")


class MenuItemUpdate(BaseModel):
    """Schema for partially updating a menu item. All fields optional."""
    name: str | None = Field(default=None, min_length=1, max_length=120)
    category: str | None = Field(default=None, max_length=60)
    description: str | None = Field(default=None, max_length=500)
    image_url: str | None = None


class MenuItemPublic(BaseModel):
    """Schema returned to clients. Maps Mongo's _id to a string id field."""
    id: str
    restaurant_id: str
    name: str
    category: str
    description: str
    image_url: str
    created_at: datetime


def menu_item_doc_to_public(doc: dict) -> MenuItemPublic:
    """Convert a raw MongoDB menu item document into a MenuItemPublic schema."""
    return MenuItemPublic(
        id=str(doc["_id"]),
        restaurant_id=doc["restaurant_id"],
        name=doc["name"],
        category=doc.get("category", ""),
        description=doc.get("description", ""),
        image_url=doc.get("image_url", ""),
        created_at=doc["created_at"],
    )
