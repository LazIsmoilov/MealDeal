"""
MenuItem CRUD routes.

Read endpoints are public; write endpoints are admin-only.

A menu item belongs to a restaurant. On creation we validate that the
referenced restaurant exists, preventing orphaned menu items.

Endpoints:
- GET    /menu-items                       list all menu items          (public)
- GET    /menu-items?restaurant_id=...     filter by restaurant         (public)
- GET    /menu-items/{id}                  get a single menu item       (public)
- POST   /menu-items                       create a menu item           (admin)
- PATCH  /menu-items/{id}                  partially update a menu item (admin)
- DELETE /menu-items/{id}                  delete a menu item           (admin)
"""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.auth.dependencies import get_current_admin
from app.models.menu_item import (
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemPublic,
    menu_item_doc_to_public,
)


router = APIRouter(prefix="/menu-items", tags=["menu-items"])


def _parse_object_id(raw_id: str) -> ObjectId:
    """Convert a string id to an ObjectId, raising 400 on malformed input."""
    try:
        return ObjectId(raw_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid menu item id format",
        )


def _ensure_restaurant_exists(db, restaurant_id: str) -> None:
    """Raise 404 if the referenced restaurant does not exist.

    Guards against creating menu items that point at a non-existent
    restaurant, which would produce orphaned records.
    """
    try:
        object_id = ObjectId(restaurant_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid restaurant id format",
        )
    if db["restaurants"].find_one({"_id": object_id}) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referenced restaurant does not exist",
        )


@router.get("", response_model=list[MenuItemPublic])
def list_menu_items(restaurant_id: str | None = None):
    """List menu items, optionally filtered by restaurant_id. Public."""
    db = get_db()
    query = {"restaurant_id": restaurant_id} if restaurant_id else {}
    docs = db["menu_items"].find(query)
    return [menu_item_doc_to_public(doc) for doc in docs]


@router.get("/{menu_item_id}", response_model=MenuItemPublic)
def get_menu_item(menu_item_id: str):
    """Get a single menu item by id. Public."""
    db = get_db()
    doc = db["menu_items"].find_one({"_id": _parse_object_id(menu_item_id)})
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )
    return menu_item_doc_to_public(doc)


@router.post("", response_model=MenuItemPublic, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    payload: MenuItemCreate,
    current_admin: dict = Depends(get_current_admin),
):
    """Create a new menu item. Admin only. Validates the restaurant exists."""
    db = get_db()
    _ensure_restaurant_exists(db, payload.restaurant_id)

    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    result = db["menu_items"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return menu_item_doc_to_public(doc)


@router.patch("/{menu_item_id}", response_model=MenuItemPublic)
def update_menu_item(
    menu_item_id: str,
    payload: MenuItemUpdate,
    current_admin: dict = Depends(get_current_admin),
):
    """Partially update a menu item. Admin only."""
    db = get_db()
    object_id = _parse_object_id(menu_item_id)

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update",
        )

    result = db["menu_items"].find_one_and_update(
        {"_id": object_id},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )
    return menu_item_doc_to_public(result)


@router.delete("/{menu_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    menu_item_id: str,
    current_admin: dict = Depends(get_current_admin),
):
    """Delete a menu item. Admin only."""
    db = get_db()
    result = db["menu_items"].delete_one({"_id": _parse_object_id(menu_item_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )
    return None
