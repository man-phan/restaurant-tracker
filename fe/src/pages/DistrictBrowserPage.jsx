import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DistrictCard from '../components/district/DistrictCard';
import EmptyState from '../components/common/EmptyState';
import './DistrictBrowserPage.css';

const DistrictBrowserPage = () => {
  const { districts, restaurants } = useApp();
  const navigate = useNavigate();

  const getCount = (dId) => restaurants.filter((r) => r.districtId == dId || r.locationId == dId).length;

  return (
    <div className="district-browser-page">
      <div className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">Locations</h1>
        <button type="button" className="icon-search-btn" onClick={() => navigate('/', { state: { autoFocus: true } })} aria-label="Search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></button>
        </div>
        <p className="page-subtitle">{districts.length} location{districts.length !== 1 ? 's' : ''} tracked</p>
      </div>

      {districts.length === 0 ? (
        <EmptyState
          icon="📍"
          title="No locations yet"
          description="Add a restaurant to start tracking locations"
        />
      ) : (
        <div className="district-list">
          {districts.map((d) => (
            <DistrictCard key={d.id} district={d} restaurantCount={getCount(d.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DistrictBrowserPage;
