import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import BottomSheet from '../common/BottomSheet';
import DistrictSelector from '../district/DistrictSelector';
import './AddRestaurantModal.css';

const AddRestaurantModal = ({ restaurant = null, onClose, onSuccess }) => {
  const { addRestaurant, updateRestaurant, districts } = useApp();
  const isEditing = Boolean(restaurant);
  
  const initialLocation = restaurant?.districtId || restaurant?.locationId
    ? districts.find((d) => d.id == (restaurant.districtId || restaurant.locationId)) || null
    : null;

  const [form, setForm] = useState({
    name: restaurant?.name || '',
    address: restaurant?.address || '',
    location: initialLocation,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Restaurant name is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.location) e.location = 'Location is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const locationName = form.location?.name;
      const fullAddress = locationName
        ? `${form.address.trim()}, ${locationName}, Ho Chi Minh City`
        : form.address.trim();
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        fullAddress,
        locationId: form.location?.id ?? null,
      };

      if (isEditing) {
        const updatedR = await updateRestaurant(restaurant.id, payload);
        onSuccess(updatedR);
        return;
      }

      const newR = await addRestaurant(payload);
      onSuccess(newR);
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  return (
    <BottomSheet onClose={onClose} title={isEditing ? 'Edit Restaurant' : 'Add Restaurant'}>
      <form className="add-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="restaurant-name-input" className="form-label">Restaurant name *</label>
          <input
            id="restaurant-name-input"
            type="text"
            className={`form-input${errors.name ? ' input-error' : ''}`}
            placeholder="e.g. Quan Bo Ne Co Hai"
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="restaurant-address-input" className="form-label">Detailed address *</label>
          <input
            id="restaurant-address-input"
            type="text"
            className={`form-input${errors.address ? ' input-error' : ''}`}
            placeholder="e.g. 123 Nguyen Trai, Ward 2"
            value={form.address}
            onChange={(e) => set('address')(e.target.value)}
          />
          {errors.address && <span className="field-error">{errors.address}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Location *</label>
          <DistrictSelector value={form.location} onChange={set('location')} />
          {errors.location && <span className="field-error">{errors.location}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Saving…' : isEditing ? 'Update Restaurant' : 'Add Restaurant'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};

export default AddRestaurantModal;
