import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import EmptyState from '../components/common/EmptyState';
import './RestaurantsPage.css';

const RestaurantsPage = () => {
  const { restaurants, dishes, districts } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const charityOnly = searchParams.get('charity') === 'true';
  const districtFilter = searchParams.get('district') || '';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const getDistrict = (id) => districts.find((d) => d.id == id);
  const getDishes = (rId) => dishes.filter((d) => d.restaurantId == rId);

  const filtered = restaurants.filter((r) => {
    if (charityOnly && !r.isCharity) return false;
    if (districtFilter === 'none') return !(r.districtId || r.locationId);
    if (districtFilter && r.districtId != districtFilter && r.locationId != districtFilter) return false;
    return true;
  });

  return (
    <div className="restaurants-page">
      <div className="rp-header">
        <Link to="/" className="rp-back">← Home</Link>
        <h1 className="rp-title">{charityOnly ? '🎗️ Charity Restaurants' : 'All Restaurants'}</h1>
        <p className="rp-subtitle">
          {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="rp-filters">
        <label className="rp-filter">
          <span className="rp-filter-label">District</span>
          <select
            id="restaurants-district-filter"
            className="rp-select"
            value={districtFilter}
            onChange={(e) => updateParam('district', e.target.value)}
          >
            <option value="">All districts</option>
            <option value="none">No district</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        <button
          id="restaurants-charity-toggle"
          type="button"
          className={`rp-chip${charityOnly ? ' rp-chip--active' : ''}`}
          aria-pressed={charityOnly}
          onClick={() => updateParam('charity', charityOnly ? '' : 'true')}
        >
          🎗️ Charity
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🍜"
          title="No restaurants found"
          description="Try changing the district or charity filter"
        />
      ) : (
        <div className="rp-list">
          {filtered.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              dishes={getDishes(r.id)}
              district={getDistrict(r.districtId || r.locationId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
