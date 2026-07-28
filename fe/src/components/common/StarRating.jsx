import React from 'react';
import './StarRating.css';

const StarRating = ({ value = 0, max = 5, onChange = null, size = 'md' }) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className={`star-rating star-rating--${size}`} role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} out of ${max} stars`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star${star <= value ? ' filled' : ''}${onChange ? ' interactive' : ''}`}
          onClick={onChange ? () => onChange(star) : undefined}
          disabled={!onChange}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;
