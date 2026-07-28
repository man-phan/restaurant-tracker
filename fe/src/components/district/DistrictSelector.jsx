import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { searchDistricts } from '../../services/districtService';
import './DistrictSelector.css';

const DistrictSelector = ({ value, onChange, placeholder = 'Search location...' }) => {
  const { addDistrict, districts } = useApp();
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    searchDistricts(query).then(setResults);
  }, [query, districts]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (district) => {
    onChange(district);
    setQuery(district.name);
    setOpen(false);
  };

  const handleAddNew = async () => {
    const newD = await addDistrict(query.trim());
    handleSelect(newD);
  };

  const noExactMatch = query.trim() && !results.some(
    (d) => d.name.toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <div className="district-selector" ref={containerRef}>
      <div className="ds-input-wrapper">
        <span className="ds-icon">📍</span>
        <input
          ref={inputRef}
          id="district-selector-input"
          type="text"
          className="ds-input"
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {value && (
          <button type="button" className="ds-clear" onClick={() => { setQuery(''); onChange(null); inputRef.current?.focus(); }} aria-label="Clear">✕</button>
        )}
      </div>

      {open && (
        <div className="ds-dropdown">
          {results.length > 0 ? (
            results.map((d) => (
              <button type="button" key={d.id} className="ds-option" onClick={() => handleSelect(d)}>
                <span>📍</span> {d.name}
              </button>
            ))
          ) : (
            <div className="ds-no-results">No location found</div>
          )}

          {noExactMatch && (
            <button type="button" className="ds-add-option" onClick={handleAddNew}>
              <span className="ds-add-icon">+</span>
              Add &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DistrictSelector;
