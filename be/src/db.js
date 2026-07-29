const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Run auto migration to ensure user_id column exists on all tables
async function runAutoMigrations() {
  try {
    await pool.query(`
      ALTER TABLE locations ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
      ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
      ALTER TABLE dishes ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    `);
    console.log('✅ Auto migrations checked/applied: user_id columns ensured');
  } catch (err) {
    console.error('⚠️ Migration error:', err.message);
  }
}
runAutoMigrations();

module.exports = pool;
