/**
 * Global authentication state via React Context.
 *
 * Provides the entire component tree with:
 *  - user:        the current user object (or null if logged out)
 *  - loading:     true while restoring the session on initial load
 *  - login/register/logout: actions that update both the backend and state
 *  - isAdmin:     convenience flag for role-based UI
 *
 * Wrapping <App> in <AuthProvider> means any component can call useAuth()
 * to read login state, instead of threading props through every level.
 */

import { createContext, useContext, useEffect, useState } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  fetchCurrentUser,
} from "../api/auth";
import { getToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists, try to restore the session.
  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        // Token invalid/expired — interceptor already cleared it.
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(credentials) {
    const loggedInUser = await apiLogin(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(details) {
    const newUser = await apiRegister(details);
    setUser(newUser);
    return newUser;
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: user !== null,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook for consuming auth state. Throws if used outside AuthProvider,
 * which catches a common wiring mistake early with a clear error.
 *
 * Co-located with the provider intentionally: the hook and the context
 * it consumes are a single cohesive unit. The lint rule below only
 * affects Fast Refresh granularity in dev, not correctness.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
