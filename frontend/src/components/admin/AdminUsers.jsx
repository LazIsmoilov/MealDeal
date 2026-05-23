/**
 * Admin → Users tab.
 *
 * Read-only list of all registered users, fetched from the admin-only
 * /auth/users endpoint. Demonstrates role-based access: a non-admin hitting
 * this endpoint would get a 403 from the backend.
 */

import { useEffect, useState } from "react";
import { getAllUsers } from "../../api/users";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getAllUsers();
        if (!cancelled) setUsers(data);
      } catch {
        if (!cancelled) setError("Couldn't load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="home-status">Loading users…</p>;
  if (error) return <p className="home-status error-text">{error}</p>;

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Joined</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.email}>
            <td>{u.username}</td>
            <td>{u.email}</td>
            <td>
              <span className={`role-pill role-${u.role}`}>{u.role}</span>
            </td>
            <td>{new Date(u.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
