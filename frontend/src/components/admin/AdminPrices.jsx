/**
 * Admin → Prices tab.
 *
 * Manages price listings. Each listing ties a menu item to a platform with a
 * price and delivery fee. The form uses dropdowns for the menu item and
 * platform (the platform enum mirrors the backend's allowed values), and
 * numeric inputs for price and fee.
 *
 * An admin selects a menu item to view and manage its prices across
 * platforms — the same data the public comparison view consumes.
 */

import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import { getMenuItems } from "../../api/restaurants";
import {
  getPriceListings,
  createPriceListing,
  updatePriceListing,
  deletePriceListing,
} from "../../api/prices";

const PLATFORMS = ["UberEats", "DoorDash", "Menulog", "Deliveroo"];
const EMPTY_FORM = { menu_item_id: "", platform: "", price: "", delivery_fee: "" };

export default function AdminPrices() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load all menu items once for the dropdowns.
  useEffect(() => {
    getMenuItems().then(setMenuItems).catch(() => setError("Couldn't load menu items."));
  }, []);

  // When a menu item is selected for viewing, load its prices.
  async function loadPrices(menuItemId) {
    if (!menuItemId) {
      setPrices([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getPriceListings(menuItemId);
      setPrices(data);
      setError("");
    } catch {
      setError("Couldn't load prices.");
    } finally {
      setLoading(false);
    }
  }

  function handleViewItemChange(id) {
    setSelectedItem(id);
    setForm({ ...EMPTY_FORM, menu_item_id: id });
    setEditingId(null);
    loadPrices(id);
  }

  function itemName(id) {
    return menuItems.find((m) => m.id === id)?.name || "Unknown";
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      menu_item_id: p.menu_item_id,
      platform: p.platform,
      price: String(p.price),
      delivery_fee: String(p.delivery_fee),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, menu_item_id: selectedItem });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        menu_item_id: form.menu_item_id,
        platform: form.platform,
        price: parseFloat(form.price),
        delivery_fee: parseFloat(form.delivery_fee || "0"),
      };
      if (editingId) {
        await updatePriceListing(editingId, {
          price: payload.price,
          delivery_fee: payload.delivery_fee,
        });
      } else {
        await createPriceListing(payload);
      }
      cancelEdit();
      await loadPrices(selectedItem);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this price?")) return;
    try {
      await deletePriceListing(id);
      await loadPrices(selectedItem);
    } catch {
      setError("Delete failed.");
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-filter">
        <label>Manage prices for:</label>
        <select
          className="input-field"
          value={selectedItem}
          onChange={(e) => handleViewItemChange(e.target.value)}
        >
          <option value="">Select a menu item…</option>
          {menuItems.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {selectedItem && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3 className="admin-form-title">
            {editingId ? "Edit price" : `Add price for ${itemName(selectedItem)}`}
          </h3>
          <div className="admin-form-grid">
            <select
              className="input-field"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              required
              disabled={!!editingId}
            >
              <option value="">Select platform…</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              className="input-field"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <input
              className="input-field"
              type="number"
              step="0.01"
              min="0"
              placeholder="Delivery fee"
              value={form.delivery_fee}
              onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })}
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
              {saving ? "Saving…" : editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="home-status">Loading…</p>
      ) : (
        selectedItem && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Price</th>
                <th>Delivery</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => (
                <tr key={p.id}>
                  <td>{p.platform}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>${p.delivery_fee.toFixed(2)}</td>
                  <td className="admin-row-actions">
                    <button className="icon-btn" onClick={() => startEdit(p)} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(p.id)} aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
