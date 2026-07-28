import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getRestaurantById } from '../services/restaurantService';
import DishCard from '../components/dish/DishCard';
import AddDishModal from '../components/dish/AddDishModal';
import AddRestaurantModal from '../components/restaurant/AddRestaurantModal';
import EmptyState from '../components/common/EmptyState';
import './RestaurantDetailPage.css';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const { restaurants, dishes, districts, deleteDish, deleteRestaurant, loading, refreshDishes } = useApp();
  const [showAddDish, setShowAddDish] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [showEditRestaurant, setShowEditRestaurant] = useState(false);
  const [singleRestaurant, setSingleRestaurant] = useState(null);
  const [fetchingSingle, setFetchingSingle] = useState(false);
  const navigate = useNavigate();

  const contextRestaurant = restaurants.find((r) => r.id == id);
  const restaurant = contextRestaurant || singleRestaurant;

  useEffect(() => {
    if (!contextRestaurant && id && !loading) {
      setFetchingSingle(true);
      getRestaurantById(id)
        .then((res) => setSingleRestaurant(res))
        .catch(() => setSingleRestaurant(null))
        .finally(() => setFetchingSingle(false));
    }
  }, [contextRestaurant, id, loading]);

  if (loading || fetchingSingle) return null;

  const district = restaurant ? districts.find((d) => d.id == (restaurant.districtId || restaurant.locationId)) : null;
  const restaurantDishes = dishes.filter((d) => String(d.restaurantId || d.restaurant_id) === String(id));

  if (!restaurant) {
    return (
      <div className="restaurant-detail-page">
        <EmptyState icon="😕" title="Restaurant not found" action={{ label: '← Go Home', onClick: () => navigate('/') }} />
      </div>
    );
  }

  const avgRating = restaurantDishes.length
    ? (restaurantDishes.reduce((sum, d) => sum + d.rating, 0) / restaurantDishes.length).toFixed(1)
    : null;

  const handleDeleteRestaurant = async () => {
    if (!window.confirm(`Delete restaurant "${restaurant.name}"? This will also delete associated dishes.`)) return;
    const targetDistrictId = restaurant.districtId || restaurant.locationId;
    await deleteRestaurant(restaurant.id);
    if (targetDistrictId) {
      navigate(`/districts/${targetDistrictId}`);
    } else {
      navigate('/districts');
    }
  };

  const handleDeleteDish = async (dish) => {
    if (!window.confirm(`Delete dish "${dish.name}"?`)) return;
    await deleteDish(dish.id);
    await refreshDishes();
  };

  return (
    <div className="restaurant-detail-page">
      {/* Header */}
      <div className="rd-hero">
        <div className="rd-back-row">
          {district ? (
            <Link to={`/districts/${district.id}`} className="rd-back">
              ← {district.name}
            </Link>
          ) : (
            <Link to="/" className="rd-back">
              ← Home
            </Link>
          )}
          <div className="rd-actions">
            <button type="button" className="dc2-btn" onClick={() => setShowEditRestaurant(true)}>Edit</button>
            <button type="button" className="dc2-btn dc2-btn--danger" onClick={handleDeleteRestaurant}>Delete</button>
          </div>
        </div>
        <div className="rd-icon">🍜</div>
        <h1 className="rd-name">{restaurant.name}</h1>
        <p className="rd-address">📍 {restaurant.fullAddress || restaurant.address}</p>
        {district && <span className="rd-district-badge">{district.name}</span>}
        {avgRating && (
          <div className="rd-avg-rating">
            <span className="rd-avg-star">★</span>
            <span className="rd-avg-num">{avgRating}</span>
            <span className="rd-avg-label">avg rating</span>
          </div>
        )}
      </div>

      {/* Dishes */}
      <div className="rd-dishes-section">
        <div className="rd-dishes-header">
          <h2 className="rd-dishes-title">Dishes Tried</h2>
          <span className="rd-dishes-count">{restaurantDishes.length}</span>
        </div>

        {restaurantDishes.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No dishes logged yet"
            description="Tap + Add Dish to record what you tried"
            action={{ label: '+ Add Dish', onClick: () => setShowAddDish(true) }}
          />
        ) : (
          <>
            <div className="dish-list">
              {restaurantDishes.map((d) => (
                <DishCard
                  key={d.id}
                  dish={d}
                  onEdit={(target) => setEditingDish(target)}
                  onDelete={handleDeleteDish}
                />
              ))}
            </div>
            <button className="rd-add-dish-btn" onClick={() => setShowAddDish(true)}>
              + Add Dish
            </button>
          </>
        )}
      </div>

      {showEditRestaurant && (
        <AddRestaurantModal
          restaurant={restaurant}
          onClose={() => setShowEditRestaurant(false)}
          onSuccess={() => setShowEditRestaurant(false)}
        />
      )}

      {(showAddDish || editingDish) && (
        <AddDishModal
          restaurantId={id}
          dish={editingDish}
          onClose={() => { setShowAddDish(false); setEditingDish(null); }}
          onSuccess={() => { setShowAddDish(false); setEditingDish(null); refreshDishes(); }}
        />
      )}
    </div>
  );
};

export default RestaurantDetailPage;
