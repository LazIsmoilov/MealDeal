/**
 * Maps each delivery platform to its public website.
 *
 * MealDeal is a comparison tool, not an ordering app — once a user sees the
 * cheapest option, this link sends them to that platform to complete the
 * order there. The delivery apps don't expose public deep-links to a specific
 * item's order page, so we link to each platform's homepage. In production
 * this would use platform-specific deep links via partner integrations.
 */

const PLATFORM_URLS = {
  UberEats: "https://www.ubereats.com",
  DoorDash: "https://www.doordash.com",
  Menulog: "https://www.menulog.com.au",
  Deliveroo: "https://deliveroo.com.au",
};

export function getPlatformUrl(platform) {
  return PLATFORM_URLS[platform] || null;
}
