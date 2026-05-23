/**
 * Admin → Menu Items tab.
 *
 * Full CRUD for menu items. Since a menu item belongs to a restaurant, the
 * form includes a restaurant dropdown (populated from the restaurants list).
 * A restaurant filter at the top lets the admin narrow the table to one
 * restaurant's items — reusing the same backend query-param filter the
 * detail page uses.
 */

import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import { getRestaurants } from "../../api/restaurants";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../api/restaurants";

const EMPTY_FORM = { restaurant_id: "", name: "", category: "", description: "" };

export default function AdminMenuItems() {
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);
  const [filterRestaurant, setFilterRestaurant] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [restaurantData, itemData] = await Promise.all([
        getRestaurants(),
        getMenuItems(filterRestaurant || null),
      ]);
      setRestaurants(restaurantData);
      setItems(itemData);
      setError("");
    } catch {
      setError("Couldn't load menu items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [restaurantData, itemData] = await Promise.all([
          getRestaurants(),
          getMenuItems(filterRestaurant || null),
        ]);
        if (!cancelled) {
          setRestaurants(restaurantData);
          setItems(itemData);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Couldn't load menu items.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filterRestaurant]);

  function restaurantName(id) {
    return restaurants.find((r) => r.id === id)?.name || "Unknown";
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      restaurant_id: item.restaurant_id,
      name: item.name,
      category: item.category || "",
      description: item.description || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        // restaurant_id can't be changed on update; send only editable fields.
        const { name, category, description } = form;
        await updateMenuItem(editingId, { name, category, description });
      } else {
        await createMenuItem(form);
      }
      cancelEdit();
      await refresh();
    } catch {
      setError("Save failed. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await deleteMenuItem(id);
      await refresh();
    } catch {
      setError("Delete failed.");
    }
  }

  return (
    <div className="admin-section">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3 className="admin-form-title">
          {editingId ? "Edit menu item" : "Add menu item"}
        </h3>
        <div className="admin-form-grid">
          <select
            className="input-field"
            value={form.restaurant_id}
            onChange={(e) => setForm({ ...form, restaurant_id: e.target.value })}
            required
            disabled={!!editingId}
          >
            <option value="">Select restaurant…</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <input
            className="input-field"
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input-field"
            placeholder="Category (optional)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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

      <div className="admin-filter">
        <label>Filter by restaurant:</label>
        <select
          className="input-field"
          value={filterRestaurant}
          onChange={(e) => setFilterRestaurant(e.target.value)}
        >
          <option value="">All restaurants</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="home-status">Loading…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Restaurant</th>
              <th>Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{restaurantName(item.restaurant_id)}</td>
                <td>{item.category || "—"}</td>
                <td className="admin-row-actions">
                  <button className="icon-btn" onClick={() => startEdit(item)} aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(item.id)} aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
