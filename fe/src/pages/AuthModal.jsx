import React, { useState } from 'react';
import './AuthModal.css';

const API = 'https://restaurant-tracker-h5hj.onrender.com/api/auth';

/* ── helpers ── */
const post = (path, body) =>
  fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Request failed');
    return data;
  });

/* ─────────────────────────────────────────────────────────────── */
export default function AuthModal({ onClose, onAuth }) {
  // views: 'login' | 'register' | 'forgot-email' | 'otp' | 'reset'
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // shared state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  function reset() {
    setError(''); setSuccess('');
    setUsername(''); setEmail(''); setPassword('');
    setConfirmPassword(''); setOtp(''); setNewPassword('');
    setOtpVerified(false);
  }

  function switchView(v) { reset(); setView(v); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (view === 'login') {
        const data = await post('/login', { username, password });
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        onAuth(data.user);
        onClose();

      } else if (view === 'register') {
        const data = await post('/register', { username, email, password, confirmPassword });
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        onAuth(data.user);
        onClose();

      } else if (view === 'forgot-email') {
        await post('/forgot-password', { email });
        setSuccess('OTP sent! Check your inbox.');
        setTimeout(() => switchViewKeepEmail('otp'), 1000);

      } else if (view === 'otp') {
        await post('/verify-otp', { email, otp });
        setOtpVerified(true);
        setSuccess('OTP verified!');
        setTimeout(() => setView('reset'), 800);

      } else if (view === 'reset') {
        await post('/reset-password', { email, newPassword });
        setSuccess('Password reset! You can now log in.');
        setTimeout(() => switchView('login'), 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchViewKeepEmail(v) {
    setError(''); setSuccess('');
    setView(v);
  }

  // ── Google Sign-In ──
  function handleGoogleLogin() {
    // Load Google GSI if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else {
      initGoogle();
    }
  }

  function initGoogle() {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id',
      callback: async (response) => {
        setLoading(true); setError('');
        try {
          const data = await post('/google', { credential: response.credential });
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          onAuth(data.user);
          onClose();
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.prompt();
  }

  /* ── UI ── */
  const titles = {
    login: 'Welcome Back',
    register: 'Create Account',
    'forgot-email': 'Forgot Password',
    otp: 'Enter OTP',
    reset: 'New Password',
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        {/* Header */}
        <div className="auth-header">
          <span className="auth-logo">🍜</span>
          <h2 className="auth-title">{titles[view]}</h2>
          <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs for login / register */}
        {(view === 'login' || view === 'register') && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${view === 'login' ? 'active' : ''}`}
              onClick={() => switchView('login')}
            >Login</button>
            <button
              className={`auth-tab ${view === 'register' ? 'active' : ''}`}
              onClick={() => switchView('register')}
            >Register</button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Register: username + email */}
          {view === 'register' && (
            <>
              <div className="auth-field">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required autoFocus
                />
              </div>
              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Login: username */}
          {view === 'login' && (
            <div className="auth-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required autoFocus
              />
            </div>
          )}

          {/* Forgot email */}
          {view === 'forgot-email' && (
            <div className="auth-field">
              <label>Registered Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required autoFocus
              />
            </div>
          )}

          {/* OTP */}
          {view === 'otp' && (
            <>
              <p className="auth-hint">OTP sent to <strong>{email}</strong></p>
              <div className="auth-field">
                <label>6-digit OTP</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required autoFocus
                />
              </div>
            </>
          )}

          {/* Reset password */}
          {view === 'reset' && (
            <div className="auth-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required autoFocus
              />
            </div>
          )}

          {/* Password fields for login / register */}
          {(view === 'login' || view === 'register') && (
            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {/* Confirm password for register */}
          {view === 'register' && (
            <div className="auth-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {/* Forgot password link */}
          {view === 'login' && (
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => switchView('forgot-email')}
            >
              Forgot password?
            </button>
          )}

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : (
              view === 'login' ? 'Login'
              : view === 'register' ? 'Create Account'
              : view === 'forgot-email' ? 'Send OTP'
              : view === 'otp' ? 'Verify OTP'
              : 'Reset Password'
            )}
          </button>

          {/* Google button only on login/register */}
          {(view === 'login' || view === 'register') && (
            <>
              <div className="auth-divider"><span>or</span></div>
              <button type="button" className="auth-btn-google" onClick={handleGoogleLogin} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Back links */}
          {(view === 'forgot-email' || view === 'otp' || view === 'reset') && (
            <button type="button" className="auth-back-link" onClick={() => switchView('login')}>
              ← Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
