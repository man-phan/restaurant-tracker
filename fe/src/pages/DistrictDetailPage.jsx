import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import AddRestaurantModal from '../components/restaurant/AddRestaurantModal';
import EmptyState from '../components/common/EmptyState';
import './DistrictDetailPage.css';

const DistrictDetailPage = () => {
  const { id } = useParams();
  const { districts, restaurants, dishes, updateDistrict, deleteDistrict } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [titleError, setTitleError] = useState('');
  const navigate = useNavigate();

  // Use loose == to handle numeric DB id vs string URL param
  const district = districts.find((d) => d.id == id);
  const districtRestaurants = restaurants.filter((r) => r.districtId == id || r.locationId == id);
  const getDishes = (rId) => dishes.filter((d) => d.restaurantId == rId);

  if (!district) {
    return (
      <div className="district-detail-page">
        <EmptyState icon="😕" title="Location not found" description="This location doesn't exist." action={{ label: '← Back to Locations', onClick: () => navigate('/districts') }} />
      </div>
    );
  }

  const startEditTitle = () => {
    setTitleInput(district.name);
    setTitleError('');
    setIsEditingTitle(true);
  };

  const saveTitle = async () => {
    const nextName = titleInput.trim();
    if (!nextName) {
      setTitleError('Location name is required');
      return;
    }
    await updateDistrict(district.id, nextName);
    setTitleError('');
    setIsEditingTitle(false);
  };

  const removeDistrict = async () => {
    if (!window.confirm(`Delete location "${district.name}"? Restaurants will remain and be unassigned.`)) return;
    await deleteDistrict(district.id);
    navigate('/districts');
  };

  return (
    <div className="district-detail-page">
      <div className="dd-header">
        <Link to="/districts" className="dd-back">← Locations</Link>
        <div className="dd-title-row">
          {isEditingTitle ? (
            <div className="dd-title-edit-wrap">
              <input
                type="text"
                className={`dd-title-input${titleError ? ' dd-title-input-error' : ''}`}
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                aria-label="Edit location name"
              />
              {titleError && <span className="dd-title-error">{titleError}</span>}
            </div>
          ) : (
            <h1 className="dd-title">📍 {district.name}</h1>
          )}
          <span className="dd-count">{districtRestaurants.length} restaurant{districtRestaurants.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="dd-actions-row">
          {isEditingTitle ? (
            <>
              <button type="button" className="dd-action-btn dd-action-btn--primary" onClick={saveTitle}>Save</button>
              <button
                type="button"
                className="dd-action-btn"
                onClick={() => { setIsEditingTitle(false); setTitleError(''); }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" className="dd-action-btn" onClick={startEditTitle}>Edit Location</button>
              <button type="button" className="dd-action-btn dd-action-btn--danger" onClick={removeDistrict}>Delete Location</button>
            </>
          )}
        </div>
      </div>

      {districtRestaurants.length === 0 ? (
        <EmptyState
          icon="🍜"
          title="No restaurants here yet"
          description={`Add your first restaurant in ${district.name}`}
          action={{ label: '+ Add Restaurant', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <>
          <div className="restaurant-list">
            {districtRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} dishes={getDishes(r.id)} />
            ))}
          </div>
          <button className="dd-add-btn" onClick={() => setShowAdd(true)}>+ Add Restaurant</button>
        </>
      )}

      {showAdd && (
        <AddRestaurantModal
          onClose={() => setShowAdd(false)}
          onSuccess={(r) => { setShowAdd(false); navigate(`/restaurants/${r.id}`); }}
        />
      )}
    </div>
  );
};

export default DistrictDetailPage;
