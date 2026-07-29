import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountPage.css';

const API = 'https://restaurant-tracker-h5hj.onrender.com/api/auth';

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

export default function AccountPage() {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(() => readStoredUser());
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const [users, setUsers] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [usersLoading, setUsersLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState(null);

  const clearAuth = () => {
    // Clear both storage keys before any state updates/events to avoid stale cross-tab/session reads.
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setSessionUser(null);
    setUsers([]);
    setRoleDrafts({});
    emitAuthChanged();
  };

  const loadUsers = async (authToken) => {
    setUsersLoading(true);
    try {
      const list = await request('/users', { token: authToken });
      setUsers(list);
      setRoleDrafts(Object.fromEntries(list.map((user) => [user.id, user.role || 'user'])));
    } catch (err) {
      if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
        setError(err.message);
      }
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const syncSession = async () => {
      const currentToken = localStorage.getItem('auth_token');
      const storedUser = readStoredUser();
      if (!currentToken) {
        clearAuth();
        return;
      }

      try {
        const currentUser = await request('/me', { token: currentToken });
        if (storedUser && String(storedUser.id) !== String(currentUser.id)) {
          clearAuth();
          return;
        }

        localStorage.setItem('auth_user', JSON.stringify(currentUser));
        setSessionUser(currentUser);
        emitAuthChanged();

        if (currentUser.role === 'admin') {
          await loadUsers(currentToken);
        }
      } catch (err) {
        if (err?.status === 401 || err?.message === 'Unauthorized') {
          clearAuth();
          return;
        }
        setError(err.message || 'Failed to restore session.');
      }
    };

    syncSession();
  }, []);

  useEffect(() => {
    if (sessionUser?.role === 'admin') {
      loadUsers(localStorage.getItem('auth_token'));
    }
  }, [sessionUser?.role]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await request('/login', {
        method: 'POST',
        body: { username: loginUsername, password: loginPassword },
      });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setSessionUser(data.user);
      emitAuthChanged();
      setMessage('Logged in successfully.');

      if (data.user.role === 'admin') {
        await loadUsers(data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await request('/register', {
        method: 'POST',
        body: {
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
          confirmPassword: registerConfirmPassword,
        },
      });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setSessionUser(data.user);
      emitAuthChanged();
      setMessage('Account created successfully.');

      if (data.user.role === 'admin') {
        await loadUsers(data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setMessage('Logged out.');
    navigate('/profile');
  };

  const handleRoleSave = async (user) => {
    const nextRole = roleDrafts[user.id] || user.role || 'user';
    if (sessionUser?.id === user.id && nextRole !== 'admin') {
      const confirmed = window.confirm('Demoting your own account will remove admin access. Continue?');
      if (!confirmed) {
        return;
      }
    }

    setSavingUserId(user.id);
    setError('');
    try {
      const updatedUser = await request(`/users/${user.id}/role`, {
        method: 'PATCH',
        token: localStorage.getItem('auth_token'),
        body: { role: nextRole },
      });

      setUsers((current) => current.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
      setRoleDrafts((current) => ({ ...current, [updatedUser.id]: updatedUser.role }));

      if (sessionUser?.id === updatedUser.id) {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        setSessionUser(updatedUser);
        emitAuthChanged();
      }

      setMessage('User role updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingUserId(null);
    }
  };

  const isAdmin = sessionUser?.role === 'admin';

  return (
    <main className="account-page">
      <section className="account-shell">
        <section className="account-grid">
          <article className="account-panel account-auth-panel account-surface">
            <div className="account-panel-header">
              <span className="account-panel-kicker">Session</span>
              <div>
                <h2>{sessionUser ? 'Current User' : 'Guest'}</h2>
                <p className="account-panel-subtitle">Touch-friendly sign in and registration.</p>
              </div>
            </div>

            {sessionUser ? (
              <div className="account-session-card">
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

                <button className="account-secondary-btn" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="account-session-card guest">
                <div className="account-avatar-wrap">
                  <div className="account-avatar">?</div>
                </div>

                <div className="account-session-copy">
                  <div className="account-session-title-row">
                    <h3>Guest</h3>
                    <span className="account-role-badge role-user">browse</span>
                  </div>
                  <p>You can browse the app and sign in here when ready.</p>
                </div>
              </div>
            )}

            {!sessionUser && (
              <>
                <div className="account-tabs" role="tablist" aria-label="Authentication mode">
                  <button
                    type="button"
                    className={`account-tab ${mode === 'login' ? 'active' : ''}`}
                    onClick={() => setMode('login')}
                    aria-pressed={mode === 'login'}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`account-tab ${mode === 'register' ? 'active' : ''}`}
                    onClick={() => setMode('register')}
                    aria-pressed={mode === 'register'}
                  >
                    Register
                  </button>
                </div>

                <form className="account-form" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                  {mode === 'login' ? (
                    <>
                      <label>
                        Username
                        <input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} autoComplete="username" required />
                      </label>
                      <label>
                        Password
                        <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="current-password" required />
                      </label>
                    </>
                  ) : (
                    <>
                      <label>
                        Username
                        <input value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} autoComplete="username" required />
                      </label>
                      <label>
                        Email
                        <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} autoComplete="email" required />
                      </label>
                      <label>
                        Password
                        <input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} autoComplete="new-password" required />
                      </label>
                      <label>
                        Confirm Password
                        <input type="password" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} autoComplete="new-password" required />
                      </label>
                    </>
                  )}

                  {error && <div className="account-message error">{error}</div>}
                  {message && <div className="account-message success">{message}</div>}

                  <button className="account-primary-btn" type="submit" disabled={loading}>
                    {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
                  </button>
                </form>
              </>
            )}
          </article>

          {isAdmin && (
            <article className="account-panel account-admin-panel account-surface">
              <div className="account-panel-header">
                <span className="account-panel-kicker">Control</span>
                <div>
                  <h2>Manage Users</h2>
                  <p className="account-panel-subtitle">Responsive role controls with larger tap targets.</p>
                </div>
              </div>

              {sessionUser?.role === 'admin' && (
                <div className="account-warning">
                  Admin access is active. Changing your own role will immediately update this session.
                </div>
              )}

              {usersLoading ? (
                <div className="account-empty-state">Loading users…</div>
              ) : users.length === 0 ? (
                <div className="account-empty-state">No users found.</div>
              ) : (
                <div className="account-user-grid">
                  {users.map((user) => {
                    const draftRole = roleDrafts[user.id] || user.role || 'user';
                    const isSelf = sessionUser?.id === user.id;
                    const selfDemotion = isSelf && draftRole !== 'admin';

                    return (
                      <div className="account-user-card" key={user.id}>
                        <div className="account-user-card-top">
                          <div className="account-user-identity">
                            <div className="account-avatar account-avatar-sm">{getAvatarLabel(user.username)}</div>
                            <div className="account-user-meta">
                              <div className="account-user-title-row">
                                <h3>{user.username}</h3>
                                {isSelf && <span className="account-self-tag">You</span>}
                              </div>
                              <p>{user.email}</p>
                            </div>
                          </div>

                          <span className={`account-role-badge role-${user.role || 'user'}`}>
                            {user.role || 'user'}
                          </span>
                        </div>

                        <div className="account-role-controls">
                          <select
                            value={draftRole}
                            onChange={(e) => setRoleDrafts((current) => ({ ...current, [user.id]: e.target.value }))}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                          <button
                            className="account-secondary-btn"
                            type="button"
                            onClick={() => handleRoleSave(user)}
                            disabled={savingUserId === user.id}
                          >
                            {savingUserId === user.id ? 'Saving…' : 'Save'}
                          </button>
                        </div>

                        {selfDemotion && (
                          <div className="account-warning compact">
                            This will demote your current session.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          )}
        </section>
      </section>
    </main>
  );
}