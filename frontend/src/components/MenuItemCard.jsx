/**
 * A single menu item shown on a restaurant's detail page.
 *
 * Displays the item name, category, and description. Clicking it triggers
 * the onCompare callback (the parent opens the price comparison). Kept as a
 * controlled, callback-driven component so the parent owns the comparison
 * state — this component just renders and reports clicks.
 */

import { ChevronRight } from "lucide-react";

export default function MenuItemCard({ item, onCompare }) {
  return (
    <button className="menu-item-card card" onClick={() => onCompare(item)}>
      <div className="menu-item-info">
        <h3 className="menu-item-name">{item.name}</h3>
        {item.category && (
          <span className="menu-item-category">{item.category}</span>
        )}
        {item.description && (
          <p className="menu-item-desc">{item.description}</p>
        )}
      </div>
      <div className="menu-item-cta">
        <span>Compare prices</span>
        <ChevronRight size={18} />
      </div>
    </button>
  );
}
