import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import BottomSheet from '../common/BottomSheet';
import StarRating from '../common/StarRating';
import '../restaurant/AddRestaurantModal.css';
import './AddDishModal.css';

const AddDishModal = ({ restaurantId, dish = null, initialName = '', onClose, onSuccess }) => {
  const { addDish, updateDish, restaurants } = useApp();
  const isEditing = Boolean(dish);
  const [form, setForm] = useState({
    name: dish?.name || initialName,
    rating: dish?.rating || 0,
    note: dish?.note || '',
  });
  const [selectedResId, setSelectedResId] = useState(restaurantId || dish?.restaurant_id || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Dish name is required';
    if (!form.rating) e.rating = 'Please select a rating';
    if (!restaurantId && !selectedResId) e.restaurantId = 'Please select a restaurant';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const targetRestaurantId = restaurantId || selectedResId;
      const payload = { restaurantId: targetRestaurantId, name: form.name.trim(), rating: form.rating, note: form.note.trim() };
      if (isEditing) {
        const updatedDish = await updateDish(dish.id, payload);
        onSuccess(updatedDish);
        return;
      }
      const newDish = await addDish(payload);
      onSuccess(newDish);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet onClose={onClose} title={isEditing ? 'Edit Dish' : 'Add Dish'}>
      <form className="add-form" onSubmit={handleSubmit} noValidate>
        {!restaurantId && (
          <div className="form-group">
            <label htmlFor="dish-restaurant-input" className="form-label">Restaurant *</label>
            <select
              id="dish-restaurant-input"
              className={`form-input${errors.restaurantId ? ' input-error' : ''}`}
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              disabled={restaurants.length === 0}
            >
              <option value="">{restaurants.length === 0 ? 'No restaurants available' : 'Select a restaurant'}</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
              ))}
            </select>
            {errors.restaurantId && <span className="field-error">{errors.restaurantId}</span>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="dish-name-input" className="form-label">Dish name *</label>
          <input
            id="dish-name-input"
            type="text"
            className={`form-input${errors.name ? ' input-error' : ''}`}
            placeholder="e.g. Bo Ne, Banh Mi…"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Rating *</label>
          <div className={`rating-input-wrapper${errors.rating ? ' rating-error' : ''}`}>
            <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} size="lg" />
            {form.rating > 0 && <span className="rating-label">{form.rating}/5</span>}
          </div>
          {errors.rating && <span className="field-error">{errors.rating}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dish-note-input" className="form-label">Note <span className="label-optional">(optional)</span></label>
          <textarea
            id="dish-note-input"
            className="form-input form-textarea"
            placeholder='"e.g. Delicious, ask for less salty next time"'
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Saving…' : isEditing ? 'Update Dish' : 'Add Dish'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};

export default AddDishModal;
