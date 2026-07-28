import React from 'react';
import { Link } from 'react-router-dom';
import './DistrictCard.css';

const DistrictCard = ({ district, restaurantCount }) => (
  <Link to={`/districts/${district.id}`} className="district-card" id={`district-card-${district.id}`}>
    <div className="dc-icon">📍</div>
    <div className="dc-content">
      <h3 className="dc-name">{district.name}</h3>
      <p className="dc-count">{restaurantCount} restaurant{restaurantCount !== 1 ? 's' : ''}</p>
    </div>
    <span className="dc-arrow">›</span>
  </Link>
);

export default DistrictCard;
