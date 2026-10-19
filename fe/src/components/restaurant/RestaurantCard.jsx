import React from 'react';
import { Link } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant, dishes = [], district = null }) => (
  <Link to={`/restaurants/${restaurant.id}`} className="restaurant-card" id={`restaurant-card-${restaurant.id}`}>
    <div className="rc-header">
      <div className="rc-icon">{restaurant.isCharity ? '🎗️' : '🍜'}</div>
      <div className="rc-info">
        <h3 className="rc-name">
          {restaurant.name}
          {restaurant.isCharity && (
            <span className="rc-charity" role="img" aria-label="Charity" title="Charity">🎗️</span>
          )}
        </h3>
        {district && <span className="rc-district-badge">{district.name}</span>}
        {(restaurant.fullAddress || restaurant.address) && (
          <p className="rc-address">📍 {restaurant.fullAddress || restaurant.address}</p>
        )}
        {restaurant.openingHours && (
          <p className="rc-hours">🕒 {restaurant.openingHours}</p>
        )}
      </div>
    </div>
    {dishes.length > 0 && (
      <div className="rc-dishes">
        {dishes.slice(0, 3).map((d) => (
          <span key={d.id} className="rc-dish-tag">{d.name}</span>
        ))}
        {dishes.length > 3 && (
          <span className="rc-dish-more">+{dishes.length - 3} more</span>
        )}
      </div>
    )}
    {dishes.length === 0 && (
      <p className="rc-no-dishes">No dishes logged yet</p>
    )}
    <span className="rc-arrow">›</span>
  </Link>
);

export default RestaurantCard;
