/**
 * Admin dashboard.
 *
 * A tabbed management interface for the three core entities (restaurants,
 * menu items, price listings) plus a read-only users view. Only reachable
 * by admins — the route is wrapped in <ProtectedRoute adminOnly /> and every
 * write call hits an admin-guarded backend endpoint.
 *
 * Each tab is a self-contained section component that manages its own data
 * fetching and mutations, keeping this page a thin shell that just switches
 * between them.
 */

import { useState } from "react";
import Navbar from "../components/Navbar";
import AdminRestaurants from "../components/admin/AdminRestaurants";
import AdminMenuItems from "../components/admin/AdminMenuItems";
import AdminPrices from "../components/admin/AdminPrices";
import AdminUsers from "../components/admin/AdminUsers";

const TABS = [
  { key: "restaurants", label: "Restaurants" },
  { key: "menu", label: "Menu Items" },
  { key: "prices", label: "Prices" },
  { key: "users", label: "Users" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("restaurants");

  return (
    <>
      <Navbar />
      <main className="container admin-main">
        <h1 className="admin-title">Admin Dashboard</h1>

        <div className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? "admin-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {activeTab === "restaurants" && <AdminRestaurants />}
          {activeTab === "menu" && <AdminMenuItems />}
          {activeTab === "prices" && <AdminPrices />}
          {activeTab === "users" && <AdminUsers />}
        </div>
      </main>
    </>
  );
}
