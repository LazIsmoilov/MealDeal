/**
 * Root application component.
 *
 * Defines the client-side routes using react-router-dom. Because routing
 * happens in the browser (no server round-trip per navigation), the app
 * behaves as a single-page application: navigating between pages swaps
 * components in place rather than reloading the document.
 *
 * Route map (this commit):
 *   /login      public   login page
 *   /register   public   registration page
 *   /           private  placeholder home (built out next commit)
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import "./pages/auth.css";

// Temporary home placeholder — replaced with the real home page next commit.
function HomePlaceholder() {
  const { user, logout } = useAuth();
  return (
    <div className="container" style={{ paddingTop: "48px" }}>
      <h1>MealDeal</h1>
      <p style={{ color: "var(--color-ink-soft)", marginTop: "8px" }}>
        Logged in as <strong>{user?.username}</strong> ({user?.role})
      </p>
      <button
        className="btn btn-ghost"
        style={{ marginTop: "24px" }}
        onClick={logout}
      >
        Log out
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePlaceholder />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
