/**
 * Central Axios HTTP client for the MealDeal API.
 *
 * This module is the single point through which the frontend talks to the
 * backend. Configuring it once here means:
 *  - The backend base URL lives in one place (driven by VITE_API_BASE_URL).
 *  - A request interceptor automatically attaches the JWT to every request,
 *    so individual components never have to think about auth headers.
 *  - A response interceptor centralizes handling of expired/invalid tokens.
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Key under which the JWT is stored. Centralized so it is never mistyped.
const TOKEN_KEY = "mealdeal_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Request interceptor: attach the JWT (if present) to the Authorization header.
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: if the API returns 401, the token is missing/expired.
// Clear it so the app falls back to a logged-out state cleanly.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
