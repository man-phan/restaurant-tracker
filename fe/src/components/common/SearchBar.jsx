import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ initialValue = '', placeholder = 'Search restaurants, dishes, districts…', autoFocus = false }) => {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    const trimmed = val.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true });
    } else {
      navigate('/search', { replace: true });
    }
  };

  const handleClear = () => {
    setQuery('');
    navigate('/search', { replace: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true });
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <span className="sb-icon">🔍</span>
      <input
        id="main-search-input"
        type="search"
        className="sb-input"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-label="Search restaurants, dishes, or districts"
      />
      {query && (
        <button type="button" className="sb-clear" onClick={handleClear} aria-label="Clear search">✕</button>
      )}
      <button type="submit" className="sb-submit" aria-label="Search">Go</button>
    </form>
  );
};

export default SearchBar;
