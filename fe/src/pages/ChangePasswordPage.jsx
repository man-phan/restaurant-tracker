import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountPage.css';

const BASE_URL = import.meta.env.VITE_USE_LOCAL === 'true' ? import.meta.env.VITE_LOCAL_API_URL : import.meta.env.VITE_PROD_API_URL;
const API = `${BASE_URL.replace(/\/$/, '')}/auth`;

async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('auth_user'));
  } catch {
    return null;
  }
}

function emitAuthChanged() {
  window.dispatchEvent(new Event('auth-changed'));
}

function getAvatarLabel(value) {
  return value?.trim()?.charAt(0)?.toUpperCase() || '?';
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(() => readStoredUser());
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const redirectToProfile = (warning) => {
      navigate('/profile', {
        replace: true,
        state: warning ? { warning } : undefined,
      });
    };

    const syncSession = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = readStoredUser();

      if (!token) {
        redirectToProfile('Please sign in to change your password.');
        return;
      }

      try {
        const response = await request('/me', { token });

        if (storedUser && String(storedUser.id) !== String(response.id)) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          emitAuthChanged();
          redirectToProfile('Please sign in to change your password.');
          return;
        }

        localStorage.setItem('auth_user', JSON.stringify(response));
        setSessionUser(response);
        emitAuthChanged();
      } catch (err) {
        if (err?.status === 401 || err?.message === 'Unauthorized') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          emitAuthChanged();
          redirectToProfile('Please sign in to change your password.');
          return;
        }

        setError(err.message || 'Failed to restore session.');
      } finally {
        setSessionLoading(false);
      }
    };

    syncSession();
  }, [navigate]);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    setMessage('');
    setError('');
  };

  const handleBack = () => {
    resetForm();
    navigate('/profile');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await request('/change-password', {
        method: 'POST',
        token: localStorage.getItem('auth_token'),
        body: {
          currentPassword,
          newPassword,
        },
      });

      setMessage(data.message || 'Password updated successfully.');
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <main className="account-page">
        <section className="account-shell">
          <article className="account-panel account-surface">
            <span className="account-panel-kicker">Security</span>
            <h2>Change Password</h2>
            <div className="account-empty-state">Checking your session...</div>
          </article>
        </section>
      </main>
    );
  }

  if (!sessionUser) {
    return null;
  }

  return (
    <main className="account-page">
      <section className="account-shell">
        <article className="account-panel account-surface">
          <span className="account-panel-kicker">Security</span>
          <h2>Change Password</h2>
          <p className="account-panel-subtitle">Update your password here, then return to your profile when finished.</p>

          <div className="account-session-card change-password-summary">
            <div className="account-avatar-wrap">
              <div className="account-avatar">{getAvatarLabel(sessionUser.username)}</div>
            </div>

            <div className="account-session-copy">
              <div className="account-session-title-row">
                <h3>{sessionUser.username}</h3>
                <span className={`account-role-badge role-${sessionUser.role || 'user'}`}>
                  {sessionUser.role || 'user'}
                </span>
              </div>
              <p>{sessionUser.email}</p>
            </div>

            <button className="account-secondary-btn" type="button" onClick={handleBack}>
              Back to profile
            </button>
          </div>

          <form className="account-password-form" onSubmit={handleSubmit}>
            {error && <div className="account-message error">{error}</div>}
            {message && <div className="account-message success">{message}</div>}

            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            <div className="account-password-actions">
              <button className="account-secondary-btn" type="button" onClick={resetForm} disabled={loading}>
                Reset form
              </button>
              <button className="account-primary-btn" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}
