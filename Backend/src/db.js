import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

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

  // 1. Members Table Schema
  const createMembersTable = `
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      surname VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      subscription_status VARCHAR(50) DEFAULT 'pending',
      payfast_token VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;


  // 2. Admin Authentication Credentials Table Schema
  const createAdminTable = `
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin'
    );
  `;

  // 3. Media Gallery Upload Records Table Schema
  const createGalleryTable = `
    CREATE TABLE IF NOT EXISTS gallery_items (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      location VARCHAR(100) NOT NULL,
      event_date DATE NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 4. Newsletter Broadcast Articles Table Schema
  const createNewsletterTable = `
    CREATE TABLE IF NOT EXISTS newsletters (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

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
    await pool.query(createMembersTable);
    await pool.query(createAdminTable);
    await pool.query(createGalleryTable);
    await pool.query(createNewsletterTable);
    await pool.query(createTableQuery);
    console.log("📁 All relational PostgreSQL application data tables verified/created successfully.");
    console.log("📁 PostgreSQL 'members' table verified/created successfully.");
    const checkAdmin = await pool.query('SELECT * FROM admin_users LIMIT 1');
    if (checkAdmin.rows.length === 0) {
      const defaultEmail = 'admin@awe.co.za';
      const hashedPassword = await bcrypt.hash('secure123', 10);
      await pool.query(
        'INSERT INTO admin_users (email, password) VALUES ($1, $2)',
        [defaultEmail, hashedPassword]
      );
      console.log(`👤 Seeding Complete: Default admin account initialized (${defaultEmail})`);
    }
  } catch (err) {
    console.error("❌ Error initializing database table:", err);
  }
};

initDb();

export default pool;