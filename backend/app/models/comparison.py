"""
Comparison response schemas.

The comparison endpoint returns a menu item alongside all its platform
prices, enriched with computed fields that the raw PriceListing data
doesn't have:

- total_cost: price + delivery_fee (the figure a user actually cares about)
- is_cheapest: flags the single best total-cost option for instant scanning

These computed fields live in the response layer, not the database — they
are derived on read rather than stored, so they can never go stale.
"""

from datetime import datetime
from pydantic import BaseModel

from app.models.price_listing import Platform


class PlatformPrice(BaseModel):
    """One platform's pricing for a menu item, with computed total cost."""
    platform: Platform
    price: float
    delivery_fee: float
    total_cost: float
    is_cheapest: bool
    updated_at: datetime


class MenuItemComparison(BaseModel):
    """A menu item with all its platform prices, sorted cheapest-first."""
    menu_item_id: str
    name: str
    restaurant_id: str
    category: str
    image_url: str
    prices: list[PlatformPrice]
    cheapest_total: float | None
    potential_savings: float | None
