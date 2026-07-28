import React from 'react';
import { useApp } from '../context/AppContext';
import DistrictCard from '../components/district/DistrictCard';
import EmptyState from '../components/common/EmptyState';
import './DistrictBrowserPage.css';

const DistrictBrowserPage = () => {
  const { districts, restaurants } = useApp();

  const getCount = (dId) => restaurants.filter((r) => r.districtId == dId || r.locationId == dId).length;

  return (
    <div className="district-browser-page">
      <div className="page-header">
        <h1 className="page-title">Locations</h1>
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
