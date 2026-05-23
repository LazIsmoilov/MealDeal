/**
 * Top navigation bar, shown on content pages.
 *
 * Displays the MealDeal brand (links home) and, on the right, either the
 * logged-in user's name with a logout button, or a login link. Admins get
 * an extra link to the admin dashboard.
 *
 * Reads auth state from context, so it always reflects the current session
 * without any props being passed in.
 */

import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <UtensilsCrossed size={24} color="var(--color-primary)" />
          <span>MealDeal</span>
        </Link>

        <nav className="navbar-actions">
          {isAdmin && (
            <Link to="/admin" className="navbar-link">
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <span className="navbar-user">Hi, {user.username}</span>
              <button className="btn btn-ghost navbar-logout" onClick={handleLogout}>
                <LogOut size={16} />
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
