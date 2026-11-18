import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { releaseSearchProxy } from '../../utils/openSearchWithKeyboard';
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
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      };
      focusInput();
      // Keep the proxy until the real input really owns focus, so the keyboard never closes
      const timer = setTimeout(() => {
        focusInput();
        if (document.activeElement === inputRef.current) releaseSearchProxy();
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus]);

  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const emit = (val) => {
    if (onValueChange) {
      onValueChange(val);
      return;
    }
    const trimmed = val.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search', { replace: true });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) {
      emit('');
      return;
    }
    timerRef.current = setTimeout(() => emit(val), 300);
  };

  const handleClear = () => {
    clearTimeout(timerRef.current);
    setQuery('');
    emit('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(timerRef.current);
    emit(query);
    inputRef.current?.blur();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <svg className="sb-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        id={id}
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        className="sb-input"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoComplete="off"
        aria-label="Search restaurants, dishes, or locations"
      />
      {query && (
        <button type="button" className="sb-clear" onClick={handleClear} aria-label="Clear search">&times;</button>
      )}
    </form>
  );
};

export default SearchBar;