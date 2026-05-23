"""
PriceListing CRUD routes.

Read endpoints are public; write endpoints are admin-only.

A price listing belongs to a menu item and records that item's price on
one delivery platform. Two rules are enforced on creation:
1. The referenced menu item must exist (referential integrity).
2. A given (menu_item_id, platform) pair can only have one listing — you
   cannot record two different UberEats prices for the same item.

Endpoints:
- GET    /price-listings                     list all                      (public)
- GET    /price-listings?menu_item_id=...    filter by menu item           (public)
- GET    /price-listings/{id}                get one                       (public)
- POST   /price-listings                     create                        (admin)
- PATCH  /price-listings/{id}                update price/fee              (admin)
- DELETE /price-listings/{id}                delete                        (admin)
"""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.auth.dependencies import get_current_admin
from app.models.price_listing import (
    PriceListingCreate,
    PriceListingUpdate,
    PriceListingPublic,
    price_listing_doc_to_public,
)


router = APIRouter(prefix="/price-listings", tags=["price-listings"])


def _parse_object_id(raw_id: str) -> ObjectId:
    """Convert a string id to an ObjectId, raising 400 on malformed input."""
    try:
        return ObjectId(raw_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid price listing id format",
        )


def _ensure_menu_item_exists(db, menu_item_id: str) -> None:
    """Raise 404 if the referenced menu item does not exist."""
    try:
        object_id = ObjectId(menu_item_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid menu item id format",
        )
    if db["menu_items"].find_one({"_id": object_id}) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referenced menu item does not exist",
        )


@router.get("", response_model=list[PriceListingPublic])
def list_price_listings(menu_item_id: str | None = None):
    """List price listings, optionally filtered by menu_item_id. Public."""
    db = get_db()
    query = {"menu_item_id": menu_item_id} if menu_item_id else {}
    docs = db["price_listings"].find(query)
    return [price_listing_doc_to_public(doc) for doc in docs]


@router.get("/{price_listing_id}", response_model=PriceListingPublic)
def get_price_listing(price_listing_id: str):
    """Get a single price listing by id. Public."""
    db = get_db()
    doc = db["price_listings"].find_one({"_id": _parse_object_id(price_listing_id)})
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Price listing not found",
        )
    return price_listing_doc_to_public(doc)


@router.post("", response_model=PriceListingPublic, status_code=status.HTTP_201_CREATED)
def create_price_listing(
    payload: PriceListingCreate,
    current_admin: dict = Depends(get_current_admin),
):
    """Create a price listing. Admin only.

    Validates the menu item exists and enforces one-price-per-platform.
    """
    db = get_db()
    _ensure_menu_item_exists(db, payload.menu_item_id)

    # Enforce (menu_item_id, platform) uniqueness at the application layer.
    existing = db["price_listings"].find_one({
        "menu_item_id": payload.menu_item_id,
        "platform": payload.platform.value,
    })
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A {payload.platform.value} price already exists for this item",
        )

    doc = payload.model_dump()
    doc["platform"] = payload.platform.value  # store the enum's string value
    doc["updated_at"] = datetime.now(timezone.utc)
    result = db["price_listings"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return price_listing_doc_to_public(doc)


@router.patch("/{price_listing_id}", response_model=PriceListingPublic)
def update_price_listing(
    price_listing_id: str,
    payload: PriceListingUpdate,
    current_admin: dict = Depends(get_current_admin),
):
    """Update a price listing's price and/or delivery fee. Admin only.

    Refreshes updated_at so the change timestamp is accurate — this powers
    the 'price updated recently' signal in the UI later.
    """
    db = get_db()
    object_id = _parse_object_id(price_listing_id)

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update",
        )
    updates["updated_at"] = datetime.now(timezone.utc)

    result = db["price_listings"].find_one_and_update(
        {"_id": object_id},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Price listing not found",
        )
    return price_listing_doc_to_public(result)


@router.delete("/{price_listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_price_listing(
    price_listing_id: str,
    current_admin: dict = Depends(get_current_admin),
):
    """Delete a price listing. Admin only."""
    db = get_db()
    result = db["price_listings"].delete_one({"_id": _parse_object_id(price_listing_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Price listing not found",
        )
    return None
