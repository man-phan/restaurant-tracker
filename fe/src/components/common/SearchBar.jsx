import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ initialValue = '', placeholder = 'Search restaurants, dishes, districts…', autoFocus = false }) => {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <span className="sb-icon">🔍</span>
      <input
        id="main-search-input"
        type="search"
        className="sb-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-label="Search restaurants, dishes, or districts"
      />
      {query && (
        <button type="button" className="sb-clear" onClick={() => setQuery('')} aria-label="Clear search">✕</button>
      )}
      <button type="submit" className="sb-submit" aria-label="Search">Go</button>
    </form>
  );
};

export default SearchBar;
