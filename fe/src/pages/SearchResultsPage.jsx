import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import AddDishModal from '../components/dish/AddDishModal';
import EmptyState from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';
import { searchAll, groupDishMatchesByDistrict } from '../services/searchService';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { dishes, districts, addDistrict } = useApp();
  const [showAddDish, setShowAddDish] = useState(false);
  const [searchResults, setSearchResults] = useState({ restaurantMatches: [], dishMatches: [], districtMatches: [] });
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadResults = () => {
      searchAll(query).then((results) => {
        if (active) setSearchResults(results);
      });
    };

    const handleAuthChanged = () => {
      loadResults();
    };

    loadResults();
    window.addEventListener('auth-changed', handleAuthChanged);

    return () => {
      active = false;
      window.removeEventListener('auth-changed', handleAuthChanged);
    };
  }, [query, dishes, districts]);

  const { restaurantMatches, dishMatches, districtMatches } = searchResults;
  const groupedDishes = groupDishMatchesByDistrict(dishMatches);

  const getDishesForRestaurant = (rId) => dishes.filter((d) => d.restaurantId == rId);
  const getDistrict = (id) => districts.find((d) => d.id == id);

  const hasResults = restaurantMatches.length > 0 || dishMatches.length > 0 || districtMatches.length > 0;
  const trimmedQuery = query.trim();

  const handleCreateDistrict = async () => {
    if (!trimmedQuery) return;
    await addDistrict(trimmedQuery);
    navigate('/districts');
  };

  return (
    <div className="search-results-page">
      <div className="sr-header">
        <SearchBar initialValue={query} autoFocus={!query} />
        {query && (
          <p className="sr-meta">
            Results for <strong>&ldquo;{query}&rdquo;</strong>
          </p>
        )}
      </div>

      {!query && (
        <EmptyState icon="🔍" title="Start searching" description="Search for restaurants, dishes, or locations" />
      )}

      {query && !hasResults && (
        <>
          <EmptyState
            icon="😕"
            title="No results found"
            description={`Nothing matched "${query}". Try a different keyword.`}
          />
          <div className="sr-empty-actions">
            <button type="button" className="sr-empty-btn" onClick={handleCreateDistrict}>
              Create Location &quot;{query}&quot;
            </button>
            <button type="button" className="sr-empty-btn sr-empty-btn--secondary" onClick={() => { if (trimmedQuery) setShowAddDish(true); }}>
              Create Food &quot;{query}&quot;
            </button>
          </div>
        </>
      )}

      {/* District matches */}
      {districtMatches.length > 0 && (
        <section className="sr-section">
          <h2 className="sr-section-title">
            <span className="sr-badge sr-badge--district">📍 Locations</span>
          </h2>
          <div className="sr-district-list">
            {districtMatches.map((d) => (
              <Link key={d.id} to={`/districts/${d.id}`} className="sr-district-link">
                {d.name} ›
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Restaurant matches */}
      {restaurantMatches.length > 0 && (
        <section className="sr-section">
          <h2 className="sr-section-title">
            <span className="sr-badge sr-badge--restaurant">🍜 Restaurants</span>
            <span className="sr-count">{restaurantMatches.length}</span>
          </h2>
          <div className="restaurant-list">
            {restaurantMatches.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                dishes={getDishesForRestaurant(r.id)}
                district={getDistrict(r.district_id ?? r.districtId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Dish matches grouped by district */}
      {groupedDishes.length > 0 && (
        <section className="sr-section">
          <h2 className="sr-section-title">
            <span className="sr-badge sr-badge--dish">🍽️ Dishes</span>
            <span className="sr-count">{dishMatches.length}</span>
          </h2>
          {groupedDishes.map((group) => (
            <div key={group.districtId} className="sr-district-group">
              <h3 className="sr-district-header">📍 {group.districtName}</h3>
              {group.restaurants.map(({ restaurant, dishes: rDishes }) => (
                <div key={restaurant.id} className="sr-restaurant-group">
                  <Link to={`/restaurants/${restaurant.id}`} className="sr-restaurant-name">
                    {restaurant.name}
                  </Link>
                  <div className="sr-dish-list">
                    {rDishes.map((d) => (
                      <span key={d.id} className="sr-dish-item">
                        {d.name}
                        <span className="sr-dish-rating">{'★'.repeat(d.rating)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {showAddDish && (
        <AddDishModal
          initialName={trimmedQuery}
          onClose={() => setShowAddDish(false)}
          onSuccess={() => setShowAddDish(false)}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
