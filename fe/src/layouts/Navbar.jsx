import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddRestaurantModal from '../components/restaurant/AddRestaurantModal';
import './Navbar.css';

const Navbar = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
  });
  const navigate = useNavigate();
  const guestWarning = 'Please sign in to add a restaurant.';

  const handleAddClick = () => {
    if (!user) {
      navigate('/profile', { state: { warning: guestWarning } });
      return;
    }

    setShowAdd(true);
  };

  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('auth_user')));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('auth-changed', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth-changed', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  return (
    <>
      <header className="navbar">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🍜</span>
          <span className="navbar-logo-text">FoodDiary</span>
        </Link>
        <nav className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/search" className="nav-link">Search</Link>
          <Link to="/districts" className="nav-link">Districts</Link>
        </nav>
        <button className="btn-add-primary" onClick={handleAddClick}>
          + Add Restaurant
        </button>

        {/* User / Login icon */}
        <button
          className="btn-login-icon"
          onClick={() => navigate('/profile')}
          aria-label={user ? 'Account' : 'Profile'}
          title={user ? `Account: ${user.username}` : 'Profile'}
        >
          {user ? (
            <span className="user-avatar-letter">
              {user.username.charAt(0).toUpperCase()}
            </span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )}
        </button>
      </header>

      {showAdd && (
        <AddRestaurantModal
          onClose={() => setShowAdd(false)}
          onSuccess={(r) => { setShowAdd(false); navigate(`/restaurants/${r.id}`); }}
        />
      )}
    </>
  );
};

export default Navbar;
