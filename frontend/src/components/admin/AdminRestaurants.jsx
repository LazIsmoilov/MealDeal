/**
 * Admin → Restaurants tab.
 *
 * Full CRUD for restaurants: lists all, creates new ones via an inline form,
 * edits existing ones, and deletes with confirmation. After any mutation it
 * refetches the list so the UI always reflects the database — simple and
 * correct, avoiding manual local-state juggling that can drift out of sync.
 */

import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../../api/restaurants";

const EMPTY_FORM = { name: "", cuisine: "", suburb: "", description: "" };

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await getRestaurants();
      setRestaurants(data);
      setError("");
    } catch {
      setError("Couldn't load restaurants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getRestaurants();
        if (!cancelled) {
          setRestaurants(data);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Couldn't load restaurants.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
      name: r.name,
      cuisine: r.cuisine,
      suburb: r.suburb,
      description: r.description || "",
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
        await updateRestaurant(editingId, form);
      } else {
        await createRestaurant(form);
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
    if (!window.confirm("Delete this restaurant? This cannot be undone.")) return;
    try {
      await deleteRestaurant(id);
      await refresh();
    } catch {
      setError("Delete failed.");
    }
  }

  return (
    <div className="admin-section">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3 className="admin-form-title">
          {editingId ? "Edit restaurant" : "Add restaurant"}
        </h3>
        <div className="admin-form-grid">
          <input
            className="input-field"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input-field"
            placeholder="Cuisine"
            value={form.cuisine}
            onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
            required
          />
          <input
            className="input-field"
            placeholder="Suburb"
            value={form.suburb}
            onChange={(e) => setForm({ ...form, suburb: e.target.value })}
            required
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

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="home-status">Loading…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cuisine</th>
              <th>Suburb</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.cuisine}</td>
                <td>{r.suburb}</td>
                <td className="admin-row-actions">
                  <button className="icon-btn" onClick={() => startEdit(r)} aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(r.id)} aria-label="Delete">
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
