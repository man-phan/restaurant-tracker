const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

async function assertLocationOwnership(locationId, userId) {
  if (locationId === null || locationId === undefined || locationId === '' || locationId === 'null') {
    return null;
  }

  const { rows } = await pool.query(
    'SELECT id FROM locations WHERE id = $1 AND user_id = $2',
    [locationId, userId]
  );

  return rows.length > 0;
}

// GET /api/restaurants  (optionally ?locationId=x)
router.get('/', async (req, res) => {
  try {
    const { locationId } = req.query;
    let query = 'SELECT * FROM restaurants WHERE user_id = $1';
    const params = [req.user.id];
    if (locationId !== undefined && locationId !== null && locationId !== '' && locationId !== 'null') {
      query += ' AND location_id = $2';
      params.push(locationId);
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/restaurants/recent?limit=5
router.get('/recent', async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM restaurants WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [req.user.id, limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/restaurants/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/restaurants
router.post('/', async (req, res) => {
  const { name, address, fullAddress, locationId = null } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const ownsLocation = await assertLocationOwnership(locationId, req.user.id);
    if (ownsLocation === false) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { rows } = await pool.query(
      `INSERT INTO restaurants (user_id, name, address, full_address, location_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name.trim(), address || null, fullAddress || null, ownsLocation === null ? null : locationId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/restaurants/:id
router.put('/:id', async (req, res) => {
  const { name, address, fullAddress, locationId = null } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const ownsLocation = await assertLocationOwnership(locationId, req.user.id);
    if (ownsLocation === false) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { rows } = await pool.query(
      `UPDATE restaurants
       SET name = $1, address = $2, full_address = $3, location_id = $4
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [name.trim(), address || null, fullAddress || null, ownsLocation === null ? null : locationId, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/restaurants/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM restaurants WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
