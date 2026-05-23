/**
 * User management API calls (admin only).
 *
 * Currently exposes the admin-only endpoint to list all users. The JWT is
 * attached automatically by the apiClient interceptor; a non-admin token
 * will receive a 403 from the backend.
 */

import apiClient from "./client";

export async function getAllUsers() {
  const { data } = await apiClient.get("/auth/users");
  return data;
}
