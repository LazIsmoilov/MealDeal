/**
 * Login page.
 *
 * Collects email + password, calls the auth context's login(), and on
 * success navigates to the home page. Displays a friendly error on failure
 * (e.g. wrong credentials) rather than letting the rejected promise surface
 * as an uncaught error.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Login failed. Please try again.");
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Log in to compare prices and save on every order.</p>

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
            Password
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          New to MealDeal? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
