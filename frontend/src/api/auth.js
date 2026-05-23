/**
 * Authentication API calls.
 *
 * Thin wrappers around the central apiClient for the auth endpoints.
 * Keeping these in one place means components import named functions
 * (login, register, fetchCurrentUser) rather than scattering raw URL
 * strings throughout the codebase.
 */

import apiClient, { setToken, clearToken } from "./client";

/**
 * Register a new account. On success the backend returns an access token
 * and the user object; we persist the token immediately so the user is
 * logged in right after registering.
 */
export async function register({ email, username, password }) {
  const { data } = await apiClient.post("/auth/register", {
    email,
    username,
    password,
  });
  setToken(data.access_token);
  return data.user;
}

/**
 * Log in with email + password. Persists the returned token and returns
 * the user object.
 */
export async function login({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  setToken(data.access_token);
  return data.user;
}

/**
 * Fetch the currently authenticated user's profile. Relies on the JWT
 * being attached automatically by the request interceptor. Used on app
 * load to restore the session from a stored token.
 */
export async function fetchCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

/**
 * Log out by clearing the stored token. No backend call needed since JWTs
 * are stateless — the token simply stops being sent.
 */
export function logout() {
  clearToken();
}
