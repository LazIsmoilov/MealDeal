/**
 * Home page — the main landing screen after login.
 *
 * Fetches all restaurants on mount and displays them in a responsive grid.
 * Handles the three async states explicitly: loading, error, and loaded,
 * so the user always sees meaningful feedback rather than a blank screen.
 *
 * Live search (filtering this grid as you type) is layered on in the next
 * commit; this commit establishes the data fetch and grid layout.
 */

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import RestaurantCard from "../components/RestaurantCard";
import { getRestaurants } from "../api/restaurants";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getRestaurants();
        if (!cancelled) setRestaurants(data);
      } catch {
        if (!cancelled) setError("Couldn't load restaurants. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="container home-main">
        <section className="home-hero">
          <h1 className="home-title">
            Find the <span className="home-title-accent">cheapest</span> way to order.
          </h1>
          <p className="home-subtitle">
            Compare prices for your favourite dishes across UberEats, DoorDash,
            Menulog, and Deliveroo — all in one place.
          </p>
        </section>

        {loading && <p className="home-status">Loading restaurants…</p>}
        {error && <p className="home-status error-text">{error}</p>}

        {!loading && !error && (
          <div className="restaurant-grid">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
