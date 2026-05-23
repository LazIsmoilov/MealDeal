/**
 * Price comparison modal — MealDeal's signature feature.
 *
 * Opens when a menu item is selected. Fetches the item's price comparison
 * from the backend and renders each platform's total cost, sorted
 * cheapest-first. The cheapest option is visually elevated and tagged, and
 * a prominent "Save $X.XX" badge communicates the value at a glance.
 *
 * Handles its own async lifecycle (loading / error / loaded) so the modal
 * is self-contained — the parent only decides which item to show.
 */

import { useCallback, useEffect, useState } from "react";
import { X, TrendingDown, BadgeCheck, ExternalLink, Zap } from "lucide-react";
import { getComparison } from "../api/comparison";
import { getPlatformUrl } from "../utils/platformLinks";
import { usePriceUpdates } from "../hooks/usePriceUpdates";

export default function ComparisonModal({ menuItem, onClose }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveUpdated, setLiveUpdated] = useState(false);

  // Fetch the comparison. Wrapped in useCallback so the live-update handler
  // can reuse it. This silent refresh updates data without flashing the
  // loading state — used when a live price update arrives.
  const loadComparison = useCallback(async () => {
    try {
      const data = await getComparison(menuItem.id);
      setComparison(data);
      setError("");
    } catch {
      setError("Couldn't load price comparison.");
    }
  }, [menuItem.id]);

  // Initial load when the modal opens. Inlined here (rather than calling
  // loadComparison directly) so the loading spinner shows on first open,
  // with a cancelled guard to avoid setting state after unmount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getComparison(menuItem.id);
        if (!cancelled) {
          setComparison(data);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Couldn't load price comparison.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [menuItem.id]);

  // Subscribe to live price updates for this item. When a broadcast arrives,
  // refetch the comparison and briefly flash a "live updated" indicator.
  usePriceUpdates(menuItem.id, () => {
    loadComparison();
    setLiveUpdated(true);
    setTimeout(() => setLiveUpdated(false), 2500);
  });

  // Close when the dark backdrop (not the panel) is clicked.
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-panel" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2 className="modal-title">{menuItem.name}</h2>
        <p className="modal-subtitle">
          Price comparison across platforms
          {liveUpdated && (
            <span className="live-badge">
              <Zap size={13} />
              Updated live
            </span>
          )}
        </p>

        {loading && <p className="home-status">Comparing prices…</p>}
        {error && <p className="home-status error-text">{error}</p>}

        {!loading && !error && comparison && (
          <>
            {comparison.prices.length === 0 ? (
              <p className="home-status">
                No prices available for this item yet.
              </p>
            ) : (
              <>
                {comparison.potential_savings > 0 && (
                  <div className="savings-banner">
                    <TrendingDown size={20} />
                    <span>
                      Save up to{" "}
                      <strong>${comparison.potential_savings.toFixed(2)}</strong>{" "}
                      by choosing the cheapest option
                    </span>
                  </div>
                )}

                <ul className="price-list">
                  {comparison.prices.map((p) => (
                    <li
                      key={p.platform}
                      className={`price-row ${p.is_cheapest ? "price-row-best" : ""}`}
                    >
                      <div className="price-platform">
                        <span className="price-platform-name">{p.platform}</span>
                        {p.is_cheapest && (
                          <span className="best-badge">
                            <BadgeCheck size={14} />
                            Best deal
                          </span>
                        )}
                      </div>
                      <div className="price-figures">
                        <span className="price-total">
                          ${p.total_cost.toFixed(2)}
                        </span>
                        <span className="price-breakdown">
                          ${p.price.toFixed(2)} + ${p.delivery_fee.toFixed(2)} delivery
                        </span>
                        {getPlatformUrl(p.platform) && (
                            <a
                            className={`order-link ${p.is_cheapest ? "order-link-best" : ""}`}
                            href={getPlatformUrl(p.platform)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Order on {p.platform}
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
