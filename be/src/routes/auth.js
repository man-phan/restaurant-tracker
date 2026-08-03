const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Email Sender via Brevo (Supports REST API & SMTP Relay) ─────────────────
async function sendBrevoEmail({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER;
  const brevoLogin = process.env.BREVO_LOGIN;

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured in environment variables');
  }

  // Brevo SMTP Key (starts with xsmtpsib-) -> Send via Brevo SMTP Relay
  if (apiKey.startsWith('xsmtpsib-')) {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: brevoLogin || senderEmail,  // Brevo SMTP requires Brevo login, not Gmail
        pass: apiKey,
      },
    });

    return await transporter.sendMail({
      from: `"FoodDiary" <${senderEmail}>`,
      to,
      subject,
      html,
    });
  }

  // Brevo REST API Key (starts with xkeysib-) -> Send via HTTPS API
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'FoodDiary', email: senderEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errorText}`);
  }

  return response.json();
}


function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function makeResetToken(email) {
  return jwt.sign(
    { email, purpose: 'password-reset' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function cleanOldOtps() {
  try {
    await pool.query("DELETE FROM otps WHERE created_at < NOW() - INTERVAL '3 days'");
  } catch (err) {
    console.error('Error cleaning old OTPs:', err);
  }
}

void (async () => {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'");
    await pool.query("UPDATE users SET role='admin' WHERE username=$1", ['jiaaaminn']);
    await cleanOldOtps();
  } catch (err) {
    console.error(err);
  }
})();

setInterval(cleanOldOtps, 60 * 60 * 1000);

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword)
    return res.status(400).json({ error: 'All fields are required' });
  if (password !== confirmPassword)
    return res.status(400).json({ error: 'Passwords do not match' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE username=$1 OR email=$2',
      [username, email]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Username or email already taken' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1,$2,$3) RETURNING id, username, email, role',
      [username, email, hash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: makeToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username=$1',
      [username]
    );
    const user = result.rows[0];
    if (!user || !user.password_hash)
      return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: 'Invalid username or password' });

    res.json({ token: makeToken(user), user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/google ───────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Google credential missing' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let result = await pool.query('SELECT * FROM users WHERE google_id=$1 OR email=$2', [googleId, email]);
    let user = result.rows[0];

    if (!user) {
      // auto-generate username from name
      const baseUsername = (name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase();
      let username = baseUsername;
      let counter = 1;
      while (true) {
        const check = await pool.query('SELECT id FROM users WHERE username=$1', [username]);
        if (check.rows.length === 0) break;
        username = `${baseUsername}${counter++}`;
      }
      result = await pool.query(
        'INSERT INTO users (username, email, google_id) VALUES ($1,$2,$3) RETURNING id, username, email, role',
        [username, email, googleId]
      );
      user = result.rows[0];
    } else if (!user.google_id) {
      await pool.query('UPDATE users SET google_id=$1 WHERE id=$2', [googleId, user.id]);
    }

    res.json({ token: makeToken(user), user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  const { accountInput } = req.body;
  const normalizedInput = typeof accountInput === 'string' ? accountInput.trim() : '';
  const normalizedLookup = normalizedInput.toLowerCase();
  const isEmailInput = normalizedLookup.includes('@');

  if (!normalizedInput) return res.status(400).json({ error: 'Email or username is required' });
  if (isEmailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedLookup)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const userResult = await pool.query(
      isEmailInput
        ? 'SELECT email FROM users WHERE LOWER(email)=LOWER($1)'
        : 'SELECT email FROM users WHERE LOWER(username)=LOWER($1)',
      [normalizedLookup]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Invalid username or email' });
    }

    const deliveryEmail = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
    if (!deliveryEmail) {
      return res.status(400).json({ error: 'No email is linked to this account' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await pool.query("DELETE FROM otps WHERE LOWER(email)=LOWER($1) OR created_at < NOW() - INTERVAL '3 days'", [deliveryEmail]);

    await pool.query(
      'INSERT INTO otps (email, otp_code, expires_at) VALUES ($1,$2,$3)',
      [deliveryEmail, otp, expiresAt]
    );

    await sendBrevoEmail({
      to: deliveryEmail,
      subject: 'Your FoodDiary Password Reset OTP',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:24px;background:#18181b;color:#f4f4f5;border-radius:12px;">
          <h2 style="color:#f97316;margin-bottom:8px;">🍜 FoodDiary</h2>
          <p>Your OTP code for password reset is:</p>
          <div style="font-size:2.5rem;font-weight:700;letter-spacing:0.3em;color:#f97316;margin:16px 0;">${otp}</div>
          <p style="color:#a1a1aa;font-size:0.85rem;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
      `,
    });

    res.json({
      message: 'If this account exists, an OTP has been sent.',
      email: deliveryEmail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedOtp = typeof otp === 'string' ? otp.trim() : '';
  if (!normalizedEmail || !normalizedOtp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const result = await pool.query(
      'SELECT * FROM otps WHERE email=$1 AND otp_code=$2 AND used=FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [normalizedEmail, normalizedOtp]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ error: 'Invalid or expired OTP' });

    await pool.query('UPDATE otps SET used=TRUE WHERE id=$1', [result.rows[0].id]);
    res.json({
      message: 'OTP verified',
      verified: true,
      resetToken: makeResetToken(normalizedEmail),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/reset-password ──────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) return res.status(400).json({ error: 'Reset token and new password are required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    if (decoded.purpose !== 'password-reset' || !decoded.email) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash=$1 WHERE LOWER(email)=LOWER($2) RETURNING id, username, email',
      [hash, decoded.email]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/change-password ────────────────────────────────────────
router.post('/change-password', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7).trim();
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, password_hash FROM users WHERE id=$1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(400).json({ error: 'This account does not have a password set' });
    }

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/auth/users ────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7).trim();
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await pool.query('SELECT id, role FROM users WHERE id=$1', [decoded.id]);
    if (currentUser.rows.length === 0 || currentUser.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/auth/users/:id/role ────────────────────────────────────────
router.patch('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await pool.query('SELECT id, role FROM users WHERE id=$1', [decoded.id]);
    if (currentUser.rows.length === 0 || currentUser.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await pool.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, email, role, created_at',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id=$1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
