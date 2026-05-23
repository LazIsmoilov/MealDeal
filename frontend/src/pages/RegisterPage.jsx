/**
 * Registration page.
 *
 * Collects email, username, password. Calls the auth context's register(),
 * which logs the user in immediately on success (the backend returns a token
 * with the new account). Surfaces backend validation errors (duplicate email,
 * weak password) inline.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ email, username, password });
      navigate("/");
    } catch (err) {
      const detail = err.response?.data?.detail;
      // Pydantic validation errors come back as an array; flatten to a message.
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Registration failed.");
      } else {
        setError(detail || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <div className="auth-brand">
          <UtensilsCrossed size={28} color="var(--color-primary)" />
          <span className="auth-brand-name">MealDeal</span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start finding the cheapest way to order your favourites.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Email
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="auth-label">
            Username
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="foodie123"
              minLength={3}
              required
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
