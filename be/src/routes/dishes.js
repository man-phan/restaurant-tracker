const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

async function assertRestaurantOwnership(restaurantId, userId) {
  const { rows } = await pool.query(
    'SELECT id FROM restaurants WHERE id = $1 AND user_id = $2',
    [restaurantId, userId]
  );

  return rows.length > 0;
}

// GET /api/dishes?restaurantId=x
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let query = 'SELECT d.* FROM dishes d WHERE d.user_id = $1';
    const params = [req.user.id];
    if (restaurantId) {
      query += ' AND d.restaurant_id = $2';
      params.push(restaurantId);
    }
    query += ' ORDER BY d.created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dishes/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT d.* FROM dishes d WHERE d.id = $1 AND d.user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Dish not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dishes
router.post('/', async (req, res) => {
  const { restaurantId, name, rating, note } = req.body;
  if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' });
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (rating == null || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  try {
    const ownsRestaurant = await assertRestaurantOwnership(restaurantId, req.user.id);
    if (!ownsRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { rows } = await pool.query(
      `INSERT INTO dishes (user_id, restaurant_id, name, rating, note)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, restaurantId, name.trim(), rating, note ? note.trim() : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/dishes/:id
router.put('/:id', async (req, res) => {
  const { name, rating, note } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (rating == null || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  try {
    const { rows } = await pool.query(
      `UPDATE dishes SET name = $1, rating = $2, note = $3
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [name.trim(), rating, note ? note.trim() : null, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Dish not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/dishes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM dishes WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Dish not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
