"""
Restaurant CRUD routes.

Read endpoints (list, get-by-id) are public — anyone can browse restaurants.
Write endpoints (create, update, delete) are admin-only, enforced via the
get_current_admin dependency.

Endpoints:
- GET    /restaurants        list all restaurants            (public)
- GET    /restaurants/{id}   get a single restaurant         (public)
- POST   /restaurants        create a restaurant             (admin)
- PATCH  /restaurants/{id}   partially update a restaurant   (admin)
- DELETE /restaurants/{id}   delete a restaurant             (admin)
"""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.auth.dependencies import get_current_admin
from app.models.restaurant import (
    RestaurantCreate,
    RestaurantUpdate,
    RestaurantPublic,
    restaurant_doc_to_public,
)


router = APIRouter(prefix="/restaurants", tags=["restaurants"])


def _parse_object_id(raw_id: str) -> ObjectId:
    """Convert a string id to an ObjectId, raising 400 on malformed input.

    Without this guard, passing a non-hex id like 'abc' would raise an
    unhandled InvalidId error and surface as a 500. We translate it into
    a clean 400 Bad Request instead.
    """
    try:
        return ObjectId(raw_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid restaurant id format",
        )


@router.get("", response_model=list[RestaurantPublic])
def list_restaurants():
    """List all restaurants. Public endpoint."""
    db = get_db()
    docs = db["restaurants"].find()
    return [restaurant_doc_to_public(doc) for doc in docs]


@router.get("/{restaurant_id}", response_model=RestaurantPublic)
def get_restaurant(restaurant_id: str):
    """Get a single restaurant by id. Public endpoint."""
    db = get_db()
    doc = db["restaurants"].find_one({"_id": _parse_object_id(restaurant_id)})
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )
    return restaurant_doc_to_public(doc)


@router.post("", response_model=RestaurantPublic, status_code=status.HTTP_201_CREATED)
def create_restaurant(
    payload: RestaurantCreate,
    current_admin: dict = Depends(get_current_admin),
):
    """Create a new restaurant. Admin only."""
    db = get_db()
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    result = db["restaurants"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return restaurant_doc_to_public(doc)


@router.patch("/{restaurant_id}", response_model=RestaurantPublic)
def update_restaurant(
    restaurant_id: str,
    payload: RestaurantUpdate,
    current_admin: dict = Depends(get_current_admin),
):
    """Partially update a restaurant. Admin only."""
    db = get_db()
    object_id = _parse_object_id(restaurant_id)

    # Only include fields the client actually sent (exclude_unset).
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update",
        )

    result = db["restaurants"].find_one_and_update(
        {"_id": object_id},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )
    return restaurant_doc_to_public(result)


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restaurant(
    restaurant_id: str,
    current_admin: dict = Depends(get_current_admin),
):
    """Delete a restaurant. Admin only. Returns 204 No Content on success."""
    db = get_db()
    result = db["restaurants"].delete_one({"_id": _parse_object_id(restaurant_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )
    return None
