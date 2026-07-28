import React from 'react';
import StarRating from '../common/StarRating';
import './DishCard.css';

const DishCard = ({ dish, onEdit, onDelete }) => (
  <div className="dish-card" id={`dish-card-${dish.id}`}>
    <div className="dc2-header">
      <h4 className="dc2-name">{dish.name}</h4>
      <StarRating value={dish.rating} size="sm" />
    </div>
    {dish.note && <p className="dc2-note">&ldquo;{dish.note}&rdquo;</p>}
    {(onEdit || onDelete) && (
      <div className="dc2-actions">
        {onEdit && <button type="button" className="dc2-btn" onClick={() => onEdit(dish)}>Edit</button>}
        {onDelete && <button type="button" className="dc2-btn dc2-btn--danger" onClick={() => onDelete(dish)}>Delete</button>}
      </div>
    )}
  </div>
);

export default DishCard;
