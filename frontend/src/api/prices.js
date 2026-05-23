/**
 * Price listing API calls.
 *
 * Read operations are public; create/update/delete require an admin token
 * (attached automatically by the apiClient interceptor).
 */

import apiClient from "./client";

export async function getPriceListings(menuItemId = null) {
  const params = menuItemId ? { menu_item_id: menuItemId } : {};
  const { data } = await apiClient.get("/price-listings", { params });
  return data;
}

export async function createPriceListing(payload) {
  const { data } = await apiClient.post("/price-listings", payload);
  return data;
}

export async function updatePriceListing(id, payload) {
  const { data } = await apiClient.patch(`/price-listings/${id}`, payload);
  return data;
}

export async function deletePriceListing(id) {
  await apiClient.delete(`/price-listings/${id}`);
}
