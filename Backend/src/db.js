import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Helper initialization query to build the table automatically if it doesn't exist
const initDb = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscription_status VARCHAR(50) DEFAULT 'pending', -- 'active', 'pending', or 'cancelled'
    payfast_token VARCHAR(100), -- Keeps track of their unique debit token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
  try {
    await pool.query(createTableQuery);
    console.log("📁 PostgreSQL 'members' table verified/created successfully.");
  } catch (err) {
    console.error("❌ Error initializing database table:", err);
  }
};

initDb();

export default pool;