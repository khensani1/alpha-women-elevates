import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import multer from 'multer'; // 👈 Import multi-part stream controller
import pool from '../db.js';
import { verifyAdminToken } from './authMiddleware.js';

const router = express.Router();

/* ==========================================
   📦 CONFIGURING LOCAL COMPUTER DISK STORAGE
   ========================================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'public/uploads/';
    // Automatically construct physical folder layout tree if it does not exist yet
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique file namespaces using historical timestamp hash variations
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/* ==========================================
   🔑 1. AUTHENTICATION ROUTE
   ========================================== */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid security credentials.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid security credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    res.json({ token, role: user.role, message: 'Authentication successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during login operation.' });
  }
});

/* ==========================================
   📸 RECONFIGURED ARCHIVE CONTROLLERS 
   ========================================== */

// Public Read Entry
router.get('/gallery', async (req, res) => {
  try {
    const items = await pool.query('SELECT * FROM gallery_items ORDER BY event_date DESC');
    res.json(items.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve media elements.' });
  }
});

// 🔄 PROTECTED UPLOAD ROUTE: Consumes real binary streams from her device!
router.post('/gallery', verifyAdminToken, upload.single('image'), async (req, res) => {
  const { title, location, date } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'File attachment stream missing from payload.' });
  }

  // Generate a relative web asset location URL path mapping pointing to our public uploads engine
  const internalImageUrl = `/uploads/${req.file.filename}`;

  try {
    const newMedia = await pool.query(
      'INSERT INTO gallery_items (title, location, event_date, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, location, date, internalImageUrl]
    );
    res.status(201).json({ message: 'Binary asset saved live successfully!', data: newMedia.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database record indexing breakdown.' });
  }
});

/* ==========================================
   📰 3. NEWSLETTER BROADCAST ROUTES
   ========================================== */

// Public endpoint
router.get('/newsletters', async (req, res) => {
  try {
    const articles = await pool.query('SELECT * FROM newsletters ORDER BY created_at DESC');
    res.json(articles.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve community entries.' });
  }
});

// Protected entry endpoint
router.post('/newsletters', verifyAdminToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newArticle = await pool.query(
      'INSERT INTO newsletters (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    res.status(201).json({ message: 'Newsletter published successfully!', data: newArticle.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Database capture error logging entry.' });
  }
});

export default router;