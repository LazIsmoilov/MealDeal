"""
Restaurant domain model and schemas.

A Restaurant is a food vendor whose menu items are listed across one or
more delivery platforms. Restaurants are managed by admins (CRUD), while
regular users only read them.

Schemas:
- RestaurantCreate: input for creating a restaurant (admin)
- RestaurantUpdate: input for partial updates (all fields optional)
- RestaurantPublic: representation returned to clients (includes id as string)
"""

from datetime import datetime, timezone
from pydantic import BaseModel, Field


class RestaurantCreate(BaseModel):
    """Schema for creating a new restaurant."""
    name: str = Field(min_length=1, max_length=120)
    cuisine: str = Field(min_length=1, max_length=60)
    suburb: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=500)
    image_url: str = Field(default="")


class RestaurantUpdate(BaseModel):
    """Schema for partially updating a restaurant. All fields optional."""
    name: str | None = Field(default=None, min_length=1, max_length=120)
    cuisine: str | None = Field(default=None, min_length=1, max_length=60)
    suburb: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = Field(default=None, max_length=500)
    image_url: str | None = None


class RestaurantPublic(BaseModel):
    """Schema returned to clients. Maps Mongo's _id to a string id field."""
    id: str
    name: str
    cuisine: str
    suburb: str
    description: str
    image_url: str
    created_at: datetime


def restaurant_doc_to_public(doc: dict) -> RestaurantPublic:
    """Convert a raw MongoDB document into a RestaurantPublic schema.

    MongoDB stores the primary key as ObjectId under `_id`. Clients expect
    a plain string `id`, so we convert it here at the boundary.
    """
    return RestaurantPublic(
        id=str(doc["_id"]),
        name=doc["name"],
        cuisine=doc["cuisine"],
        suburb=doc["suburb"],
        description=doc.get("description", ""),
        image_url=doc.get("image_url", ""),
        created_at=doc["created_at"],
    )
