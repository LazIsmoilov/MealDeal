/**
 * Root application component.
 *
 * Defines the client-side routes using react-router-dom. Navigation happens
 * in the browser (no server round-trip), so the app behaves as a single-page
 * application — components swap in place rather than reloading the document.
 *
 * Route map (this commit):
 *   /login              public   login page
 *   /register           public   registration page
 *   /                   private  home page (restaurant grid)
 *   /restaurants/:id    private  restaurant detail + menu live search
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./pages/auth.css";
import "./pages/home.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurants/:id"
          element={
            <ProtectedRoute>
              <RestaurantDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
