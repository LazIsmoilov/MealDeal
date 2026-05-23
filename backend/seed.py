"""
Database seed script for MealDeal.

Populates the database with realistic Sydney-style restaurants, their menu
items, and price listings across all four delivery platforms. Designed to be
idempotent: running it wipes the restaurants, menu_items, and price_listings
collections first, then repopulates — so you always get a known clean state.

The users collection is NOT touched, so existing accounts (including the
admin) survive a reseed.

Usage (from the backend/ directory with venv active):
    python seed.py
"""

import random
from datetime import datetime, timezone

from app.database import connect_to_mongo, get_db, close_mongo_connection
from app.auth.password import hash_password


# --- Seed data definitions -------------------------------------------------

# Each restaurant has a list of menu items. Each menu item will get prices
# on a random subset of platforms so the comparison feature has variety.
PLATFORMS = ["UberEats", "DoorDash", "Menulog", "Deliveroo"]

RESTAURANTS = [
    {
        "name": "Mary's Newtown",
        "cuisine": "Burgers",
        "suburb": "Newtown",
        "description": "Cult burger joint with rock and roll vibes.",
        "items": [
            ("Classic Cheeseburger", "Burgers"),
            ("Bacon Double", "Burgers"),
            ("Fried Chicken Burger", "Burgers"),
            ("Loaded Fries", "Sides"),
        ],
    },
    {
        "name": "Gelato Messina",
        "cuisine": "Dessert",
        "suburb": "Darlinghurst",
        "description": "Sydney's most famous gelato.",
        "items": [
            ("Salted Caramel Scoop", "Gelato"),
            ("Pistachio Scoop", "Gelato"),
            ("Tiramisu Slice", "Cakes"),
        ],
    },
    {
        "name": "Chat Thai",
        "cuisine": "Thai",
        "suburb": "Haymarket",
        "description": "Bustling authentic Thai institution.",
        "items": [
            ("Pad Thai", "Noodles"),
            ("Green Curry", "Curries"),
            ("Boat Noodle Soup", "Soups"),
            ("Thai Milk Tea", "Drinks"),
        ],
    },
    {
        "name": "Three Williams",
        "cuisine": "Cafe",
        "suburb": "Redfern",
        "description": "Beloved brunch spot.",
        "items": [
            ("The Bowl of Nourishment", "Brunch"),
            ("Smashed Avo", "Brunch"),
            ("Flat White", "Coffee"),
        ],
    },
    {
        "name": "Hartsyard",
        "cuisine": "American",
        "suburb": "Newtown",
        "description": "Southern-inspired comfort food.",
        "items": [
            ("Fried Chicken Plate", "Mains"),
            ("Mac and Cheese", "Sides"),
            ("Cornbread", "Sides"),
        ],
    },
    {
        "name": "Devon Cafe",
        "cuisine": "Cafe",
        "suburb": "Surry Hills",
        "description": "Modern brunch with an Asian twist.",
        "items": [
            ("Breakfast With The Sakumas", "Brunch"),
            ("Devon Benedict", "Brunch"),
            ("Cold Brew", "Coffee"),
        ],
    },
    {
        "name": "Spice Alley",
        "cuisine": "Asian",
        "suburb": "Chippendale",
        "description": "Hawker-style Asian street food.",
        "items": [
            ("Hainanese Chicken Rice", "Mains"),
            ("Char Kway Teow", "Noodles"),
            ("Roti Canai", "Sides"),
        ],
    },
    {
        "name": "Bilas Indian",
        "cuisine": "Indian",
        "suburb": "Glebe",
        "description": "Home-style North Indian cooking.",
        "items": [
            ("Butter Chicken", "Curries"),
            ("Lamb Rogan Josh", "Curries"),
            ("Garlic Naan", "Breads"),
            ("Mango Lassi", "Drinks"),
        ],
    },
]


def seed():
    connect_to_mongo()
    db = get_db()

    # Wipe entity collections (leave users intact).
    db["restaurants"].delete_many({})
    db["menu_items"].delete_many({})
    db["price_listings"].delete_many({})
    print("🧹 Cleared restaurants, menu_items, price_listings")

    # Ensure an admin account exists for the demo.
    if db["users"].find_one({"email": "admin@mealdeal.com"}) is None:
        db["users"].insert_one({
            "email": "admin@mealdeal.com",
            "username": "admin",
            "hashed_password": hash_password("admin12345"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })
        print("👤 Created admin user (admin@mealdeal.com / admin12345)")

    total_items = 0
    total_prices = 0

    for r in RESTAURANTS:
        restaurant_doc = {
            "name": r["name"],
            "cuisine": r["cuisine"],
            "suburb": r["suburb"],
            "description": r["description"],
            "image_url": "",
            "created_at": datetime.now(timezone.utc),
        }
        restaurant_id = db["restaurants"].insert_one(restaurant_doc).inserted_id

        for item_name, category in r["items"]:
            item_doc = {
                "restaurant_id": str(restaurant_id),
                "name": item_name,
                "category": category,
                "description": "",
                "image_url": "",
                "created_at": datetime.now(timezone.utc),
            }
            menu_item_id = db["menu_items"].insert_one(item_doc).inserted_id
            total_items += 1

            # Give each item a price on a random 2-4 platforms.
            base_price = round(random.uniform(8, 28), 2)
            chosen_platforms = random.sample(PLATFORMS, random.randint(2, 4))
            for platform in chosen_platforms:
                # Vary price and fee slightly per platform.
                price = round(base_price + random.uniform(-2, 2), 2)
                price = max(price, 1.0)  # never below $1
                delivery_fee = round(random.uniform(0, 6), 2)
                db["price_listings"].insert_one({
                    "menu_item_id": str(menu_item_id),
                    "platform": platform,
                    "price": price,
                    "delivery_fee": delivery_fee,
                    "updated_at": datetime.now(timezone.utc),
                })
                total_prices += 1

    print(f"🍔 Seeded {len(RESTAURANTS)} restaurants")
    print(f"📋 Seeded {total_items} menu items")
    print(f"💲 Seeded {total_prices} price listings")
    print("✅ Seed complete")

    close_mongo_connection()


if __name__ == "__main__":
    seed()
