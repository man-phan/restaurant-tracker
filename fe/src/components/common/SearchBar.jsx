import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ initialValue = '', placeholder = 'Search restaurants, dishes, locations…', autoFocus = false, onValueChange, id = 'main-search-input' }) => {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onValueChange) {
      onValueChange(val);
      return;
    }
    const trimmed = val.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true });
    } else {
      navigate('/search', { replace: true });
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onValueChange) {
      onValueChange('');
      return;
    }
    navigate('/search', { replace: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onValueChange) return;
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true });
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <span className="sb-icon">🔍</span>
      <input
        id={id}
        ref={inputRef}
        type="search"
        className="sb-input"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-label="Search restaurants, dishes, or locations"
      />
      {query && (
        <button type="button" className="sb-clear" onClick={handleClear} aria-label="Clear search">✕</button>
      )}
      <button type="submit" className="sb-submit" aria-label="Search">Go</button>
    </form>
  );
};

export default SearchBar;
