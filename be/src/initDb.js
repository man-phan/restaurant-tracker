const fs = require('fs/promises');
const path = require('path');
const pool = require('./db');

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const seedPath = path.join(__dirname, 'seed.sql');

  try {
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    const seedSql = await fs.readFile(seedPath, 'utf8');

    await pool.query(schemaSql);
    await pool.query(seedSql);

    console.log('Database initialized successfully.');
  } finally {
    await pool.end();
  }
}

initDb().catch((error) => {
  console.error('Database initialization failed:', error.message);
  process.exitCode = 1;
});