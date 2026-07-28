const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

// GET /api/search?q=query
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ restaurantMatches: [], dishMatches: [], districtMatches: [], locationMatches: [] });

  try {
    const pattern = `%${q}%`;

    // Location matches
    const { rows: locationMatches } = await pool.query(
      'SELECT * FROM locations WHERE user_id = $2 AND LOWER(name) LIKE LOWER($1) ORDER BY name',
      [pattern, req.user.id]
    );

    const matchedLocationIds = locationMatches.map((location) => location.id);

    // Restaurant matches: by name OR by matched location
    let restaurantMatches = [];
    if (matchedLocationIds.length > 0) {
      const { rows } = await pool.query(
        `SELECT * FROM restaurants
         WHERE user_id = $3 AND (LOWER(name) LIKE LOWER($1) OR location_id = ANY($2::int[]))
         ORDER BY created_at DESC`,
        [pattern, matchedLocationIds, req.user.id]
      );
      restaurantMatches = rows;
    } else {
      const { rows } = await pool.query(
        'SELECT * FROM restaurants WHERE user_id = $2 AND LOWER(name) LIKE LOWER($1) ORDER BY created_at DESC',
        [pattern, req.user.id]
      );
      restaurantMatches = rows;
    }

    // Dish matches with joined restaurant + location info
    const { rows: dishRows } = await pool.query(
      `SELECT d.*, r.name AS restaurant_name, r.location_id,
              loc.name AS location_name
       FROM dishes d
       JOIN restaurants r ON r.id = d.restaurant_id
       LEFT JOIN locations loc ON loc.id = r.location_id
       WHERE d.user_id = $2 AND LOWER(d.name) LIKE LOWER($1)
       ORDER BY d.created_at DESC`,
      [pattern, req.user.id]
    );

    const dishMatches = dishRows.map((row) => ({
      id: row.id,
      restaurant_id: row.restaurant_id,
      name: row.name,
      rating: row.rating,
      note: row.note,
      created_at: row.created_at,
      restaurant: {
        id: row.restaurant_id,
        name: row.restaurant_name,
        location_id: row.location_id,
      },
      district: row.location_id
        ? { id: row.location_id, name: row.location_name }
        : null,
    }));

    res.json({ restaurantMatches, dishMatches, districtMatches: locationMatches, locationMatches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
