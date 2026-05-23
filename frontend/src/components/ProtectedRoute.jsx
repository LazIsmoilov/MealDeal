/**
 * Route guard for pages that require authentication (and optionally admin).
 *
 * Usage:
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>
 *
 * While the session is still being restored we render nothing (avoids a
 * flash of the login redirect). Once known:
 *   - not logged in        -> redirect to /login
 *   - adminOnly + not admin -> redirect to home
 *   - otherwise            -> render the protected children
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return null; // session still restoring; avoid premature redirect
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
