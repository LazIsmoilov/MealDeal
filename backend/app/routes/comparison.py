"""
Price comparison route — the core feature of MealDeal.

Given a menu item, this endpoint returns all its platform prices enriched
with computed fields: total cost (price + delivery fee), a flag marking the
single cheapest option, and the potential savings between the most and least
expensive platforms.

This is a read-only, public endpoint — anyone can compare prices without
logging in, which is the whole value proposition of the app.

Endpoint:
- GET /menu-items/{menu_item_id}/compare    (public)
"""

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, status

from app.database import get_db
from app.models.comparison import MenuItemComparison, PlatformPrice


router = APIRouter(tags=["comparison"])


@router.get("/menu-items/{menu_item_id}/compare", response_model=MenuItemComparison)
def compare_menu_item_prices(menu_item_id: str):
    """Compare a menu item's prices across all delivery platforms.

    Returns the item with its platform prices sorted cheapest-first by total
    cost, the cheapest option flagged, and the potential savings highlighted.
    """
    db = get_db()

    # Validate and fetch the menu item itself.
    try:
        item_oid = ObjectId(menu_item_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid menu item id format",
        )

    item = db["menu_items"].find_one({"_id": item_oid})
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )

    # Gather all price listings for this item.
    listings = list(db["price_listings"].find({"menu_item_id": menu_item_id}))

    # Compute total cost for each listing and sort cheapest-first.
    enriched = []
    for listing in listings:
        total = listing["price"] + listing.get("delivery_fee", 0)
        enriched.append({
            "platform": listing["platform"],
            "price": listing["price"],
            "delivery_fee": listing.get("delivery_fee", 0),
            "total_cost": round(total, 2),
            "updated_at": listing["updated_at"],
        })
    enriched.sort(key=lambda e: e["total_cost"])

    # Determine cheapest total and potential savings.
    cheapest_total = enriched[0]["total_cost"] if enriched else None
    most_expensive = enriched[-1]["total_cost"] if enriched else None
    potential_savings = (
        round(most_expensive - cheapest_total, 2)
        if cheapest_total is not None and most_expensive is not None
        else None
    )

    # Build the response, flagging the cheapest option.
    prices = [
        PlatformPrice(
            platform=e["platform"],
            price=e["price"],
            delivery_fee=e["delivery_fee"],
            total_cost=e["total_cost"],
            is_cheapest=(e["total_cost"] == cheapest_total),
            updated_at=e["updated_at"],
        )
        for e in enriched
    ]

    return MenuItemComparison(
        menu_item_id=str(item["_id"]),
        name=item["name"],
        restaurant_id=item["restaurant_id"],
        category=item.get("category", ""),
        image_url=item.get("image_url", ""),
        prices=prices,
        cheapest_total=cheapest_total,
        potential_savings=potential_savings,
    )
