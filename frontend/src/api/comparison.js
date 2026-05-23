/**
 * Comparison API call.
 *
 * Fetches the price comparison for a single menu item — all platform prices
 * sorted cheapest-first, with the cheapest flagged and potential savings
 * computed by the backend.
 */

import apiClient from "./client";

export async function getComparison(menuItemId) {
  const { data } = await apiClient.get(`/menu-items/${menuItemId}/compare`);
  return data;
}
