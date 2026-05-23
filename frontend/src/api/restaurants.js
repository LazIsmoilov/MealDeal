/**
 * Restaurant and menu-item API calls.
 *
 * Read operations are public; write operations require an admin token
 * (attached automatically by the apiClient interceptor). Components import
 * these named functions rather than constructing URLs themselves.
 */

import apiClient from "./client";

// --- Restaurants ---

export async function getRestaurants() {
  const { data } = await apiClient.get("/restaurants");
  return data;
}

export async function getRestaurant(id) {
  const { data } = await apiClient.get(`/restaurants/${id}`);
  return data;
}

export async function createRestaurant(payload) {
  const { data } = await apiClient.post("/restaurants", payload);
  return data;
}

export async function updateRestaurant(id, payload) {
  const { data } = await apiClient.patch(`/restaurants/${id}`, payload);
  return data;
}

export async function deleteRestaurant(id) {
  await apiClient.delete(`/restaurants/${id}`);
}

// --- Menu items ---

export async function getMenuItems(restaurantId = null) {
  const params = restaurantId ? { restaurant_id: restaurantId } : {};
  const { data } = await apiClient.get("/menu-items", { params });
  return data;
}

export async function getMenuItem(id) {
  const { data } = await apiClient.get(`/menu-items/${id}`);
  return data;
}

export async function createMenuItem(payload) {
  const { data } = await apiClient.post("/menu-items", payload);
  return data;
}

export async function updateMenuItem(id, payload) {
  const { data } = await apiClient.patch(`/menu-items/${id}`, payload);
  return data;
}

export async function deleteMenuItem(id) {
  await apiClient.delete(`/menu-items/${id}`);
}
