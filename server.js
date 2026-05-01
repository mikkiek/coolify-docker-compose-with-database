const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY,
      count INTEGER NOT NULL
    )
  `);

  await pool.query(`
    INSERT INTO stats (id, count)
    VALUES (1, 0)
    ON CONFLICT (id) DO NOTHING
  `);
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/favicon.ico') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const result = await pool.query(`
      UPDATE stats
      SET count = count + 1
      WHERE id = 1
      RETURNING count
    `);

    const count = result.rows[0].count;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(`<h1>Total Visits: ${count}</h1><p>Persistent Data stored in Postgres. Hello Pal!</p>`);
  } catch (err) {
    console.error('Database error:', err);

    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Internal Server Error');
  }
});

initDb()
  .then(() => {
    server.listen(3000, '0.0.0.0', () => {
      console.log('Server running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
