/**
 * Restaurant detail page.
 *
 * Fetches a single restaurant and its menu items. Provides a live search box
 * that filters the menu items in real time as the user types — no submit
 * button, no page reload, results update on every keystroke (debounced via
 * derived filtering on each render, which is cheap for this list size).
 *
 * Clicking a menu item will open its price comparison (wired next commit;
 * for now the callback logs the selection).
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import MenuItemCard from "../components/MenuItemCard";
import ComparisonModal from "../components/ComparisonModal";
import { getRestaurant, getMenuItems } from "../api/restaurants";

export default function RestaurantDetailPage() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [restaurantData, itemsData] = await Promise.all([
          getRestaurant(id),
          getMenuItems(id),
        ]);
        if (!cancelled) {
          setRestaurant(restaurantData);
          setMenuItems(itemsData);
        }
      } catch {
        if (!cancelled) setError("Couldn't load this restaurant.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Live search: filter menu items by name/category as the user types.
  // useMemo avoids re-filtering on unrelated re-renders.
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, menuItems]);

  function handleCompare(item) {
    setSelectedItem(item);
  }

  return (
    <>
      <Navbar />
      <main className="container detail-main">
        <Link to="/" className="detail-back">
          <ArrowLeft size={16} />
          All restaurants
        </Link>

        {loading && <p className="home-status">Loading…</p>}
        {error && <p className="home-status error-text">{error}</p>}

        {!loading && !error && restaurant && (
          <>
            <header className="detail-header">
              <h1 className="detail-name">{restaurant.name}</h1>
              <div className="detail-meta">
                <span className="detail-cuisine">{restaurant.cuisine}</span>
                <span className="detail-suburb">
                  <MapPin size={14} />
                  {restaurant.suburb}
                </span>
              </div>
              {restaurant.description && (
                <p className="detail-desc">{restaurant.description}</p>
              )}
            </header>

            <div className="search-bar">
              <Search size={18} color="var(--color-ink-soft)" />
              <input
                type="text"
                className="search-input"
                placeholder="Search the menu…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {filteredItems.length === 0 ? (
              <p className="home-status">No items match "{query}".</p>
            ) : (
              <div className="menu-list">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onCompare={handleCompare}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {selectedItem && (
        <ComparisonModal
          menuItem={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
