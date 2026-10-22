import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import AddRestaurantModal from '../components/restaurant/AddRestaurantModal';
import EmptyState from '../components/common/EmptyState';
import { getRecentRestaurants } from '../services/restaurantService';
import './HomePage.css';

const HomePage = () => {
  const { restaurants, dishes, districts } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getRecentRestaurants(5).then(setRecent);
  }, [restaurants]);

  // Use loose == to handle numeric DB id vs string URL param
  const getDishesForRestaurant = (rId) => dishes.filter((d) => d.restaurantId == rId);
  const getDistrictForRestaurant = (districtId) => districts.find((d) => d.id == districtId);

  return (
    <div className="home-page">

      {/* Quick nav */}
      <section className="home-quicknav">
        <button className="qnav-card" onClick={() => navigate('/districts')}>
          <span className="qnav-icon">📍</span>
          <span className="qnav-label">Browse by District</span>
        </button>
        <button className="qnav-card" onClick={() => navigate('/search')}>
          <span className="qnav-icon">🔍</span>
          <span className="qnav-label">Search Dishes</span>
        </button>
        <button className="qnav-card" onClick={() => navigate('/restaurants?charity=true')}>
          <span className="qnav-icon">🎗️</span>
          <span className="qnav-label">Charity</span>
        </button>
      </section>

      {/* Stats */}
      <section className="home-stats">
        <button type="button" className="stat-card stat-card--link" onClick={() => navigate('/restaurants')}>
          <span className="stat-num">{restaurants.length}</span>
          <span className="stat-label">Restaurants</span>
        </button>
        <div className="stat-card">
          <span className="stat-num">{dishes.length}</span>
          <span className="stat-label">Dishes Tried</span>
        </div>
        <button type="button" className="stat-card stat-card--link" onClick={() => navigate('/districts')}>
          <span className="stat-num">{districts.length}</span>
          <span className="stat-label">Districts</span>
        </button>
      </section>

      {/* Recent restaurants */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Recently Added</h2>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No restaurants yet"
            description="Start by adding your first restaurant"
            action={{ label: '+ Add Restaurant', onClick: () => setShowAdd(true) }}
          />
        ) : (
          <div className="restaurant-list">
            {recent.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                dishes={getDishesForRestaurant(r.id)}
                district={getDistrictForRestaurant(r.districtId)}
              />
            ))}
          </div>
        )}
      </section>

      {showAdd && (
        <AddRestaurantModal
          onClose={() => setShowAdd(false)}
          onSuccess={(r) => { setShowAdd(false); navigate(`/restaurants/${r.id}`); }}
        />
      )}
    </div>
  );
};

export default HomePage;
