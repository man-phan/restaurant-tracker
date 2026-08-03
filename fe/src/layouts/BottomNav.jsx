import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AddRestaurantModal from '../components/restaurant/AddRestaurantModal';
import './BottomNav.css';

const BottomNav = () => {
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

  React.useEffect(() => {
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
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        <NavLink to="/" end className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <span className="bnav-icon">🏠</span>
          <span className="bnav-label">Home</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <span className="bnav-icon">🔍</span>
          <span className="bnav-label">Search</span>
        </NavLink>

        <button
          id="btn-add-restaurant-mobile"
          className="bottom-nav-fab"
          onClick={handleAddClick}
          aria-label="Add restaurant"
        >
          <span className="fab-icon">+</span>
        </button>

        <NavLink to="/districts" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <span className="bnav-icon">📍</span>
          <span className="bnav-label">Districts</span>
        </NavLink>

        {/* User / Login */}
        <button
          className={`bottom-nav-item bnav-user-btn${user ? ' bnav-logged-in' : ''}`}
          onClick={() => navigate('/profile')}
          aria-label={user ? 'Account' : 'Profile'}
          title={user ? `Account: ${user.username}` : 'Profile'}
        >
          {user ? (
            <span className="bnav-avatar">{user.username.charAt(0).toUpperCase()}</span>
          ) : (
            <span className="bnav-icon">👤</span>
          )}
          <span className="bnav-label">{user ? user.username : 'Profile'}</span>
        </button>
      </nav>

      {showAdd && (
        <AddRestaurantModal
          onClose={() => setShowAdd(false)}
          onSuccess={(r) => { setShowAdd(false); navigate(`/restaurants/${r.id}`); }}
        />
      )}
    </>
  );
};

export default BottomNav;
