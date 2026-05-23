/**
 * A single restaurant tile shown in the home page grid.
 *
 * Clicking the card navigates to that restaurant's detail page. Because the
 * seed data has no real images, we render a styled placeholder with the
 * restaurant's initial — keeping the grid visually consistent without
 * depending on external image URLs.
 */

import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function RestaurantCard({ restaurant }) {
  const { id, name, cuisine, suburb, image_url } = restaurant;

  return (
    <Link to={`/restaurants/${id}`} className="restaurant-card card">
      <div className="restaurant-card-media">
        {image_url ? (
          <img src={image_url} alt={name} />
        ) : (
          <span className="restaurant-card-initial">{name.charAt(0)}</span>
        )}
        <span className="restaurant-card-cuisine">{cuisine}</span>
      </div>
      <div className="restaurant-card-body">
        <h3 className="restaurant-card-name">{name}</h3>
        <p className="restaurant-card-suburb">
          <MapPin size={14} />
          {suburb}
        </p>
      </div>
    </Link>
  );
}
