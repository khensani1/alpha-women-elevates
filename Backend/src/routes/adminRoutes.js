import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import pool from '../db.js';
import { verifyAdminToken } from './authMiddleware.js';
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key');

/* ==========================================
   📦 CONFIGURING LOCAL COMPUTER DISK STORAGE
   ========================================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'public/uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
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
   📸 2. GALLERY ARCHIVE CONTROLLERS 
   ========================================== */

// Public Fetch Route
router.get('/gallery', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, location, event_date, image_url FROM gallery_items ORDER BY event_date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database error fetching gallery:", err);
    res.status(500).json({ error: "Database capture error fetching archive records." });
  }
});

// Protected Upload Route
router.post('/gallery', verifyAdminToken, upload.single('image'), async (req, res) => {
  const { title, location, date } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'File attachment stream missing from payload.' });
  }

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

// Public Fetch Route
router.get('/newsletters', async (req, res) => {
  try {
    const articles = await pool.query('SELECT * FROM newsletters ORDER BY created_at DESC');
    res.json(articles.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve community entries.' });
  }
});

// Protected Publish Route
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

/* ==========================================
   📅 4. UPCOMING ENGAGEMENTS / EVENTS ROUTES
   ========================================== */

// Public Fetch Route (Matches Frontend Community Component)
router.get('/events', async (req, res) => {
  try {
    const events = await pool.query('SELECT * FROM events ORDER BY date ASC');
    res.json(events.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve scheduled events.' });
  }
});

// Protected Publish Route (Matches Admin Panel Event Submission form)
router.post('/events', verifyAdminToken, async (req, res) => {
  const { title, date, location, price, event_type } = req.body;
  
  try {
    const derivedType = event_type || (Number(price) > 0 ? 'paid' : 'free');

    const newEvent = await pool.query(
      'INSERT INTO events (title, date, location, price, event_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, date, location, price !== undefined ? price : 0, derivedType]
    );
    res.status(201).json({ message: 'Upcoming Event posted live!', data: newEvent.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database capture error logging scheduled event.' });
  }
});

/* ==========================================
   🛒 5. ORDER MANAGEMENT & OPERATIONS
   ========================================== */

router.get('/orders', verifyAdminToken, async (req, res) => {
  try {
    const ordersResult = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const itemsResult = await pool.query('SELECT * FROM order_items');

    const structuredOrders = ordersResult.rows.map(order => ({
      ...order,
      items: itemsResult.rows.filter(item => item.order_id === order.id)
    }));

    res.json({ orders: structuredOrders });
  } catch (error) {
    console.error('Admin Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch customer orders.' });
  }
});

router.patch('/orders/:id/status', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order record not found.' });
    }

    const updatedOrder = result.rows[0];

    if (status === 'Delivered') {
      try {
        await resend.emails.send({
          from: 'AWE System <onboarding@resend.dev>',
          to: updatedOrder.customer_email,
          subject: `✨ Your Alpha Women Elevates Order Has Been Delivered! (Ref: AWE-${updatedOrder.id})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
              <h2 style="color: #4A154B; text-align: center;">Your Package Has Arrived! 🎉</h2>
              <p>Hi there,</p>
              <p>We are excited to let you know that your order <strong>Ref: AWE-${updatedOrder.id}</strong> has been officially delivered by our team.</p>
              <p>Thank you so much for supporting Alpha Women Elevates. We hope you love your new items!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 11px; color: #888; text-align: center;">If you have any questions about your delivery, please reach out to us directly.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Failed to dispatch customer milestone email:', emailErr);
      }
    }

    res.json({ message: 'Order status updated successfully.', order: updatedOrder });
  } catch (error) {
    console.error('Status Update Error:', error);
    res.status(500).json({ error: 'Failed to modify database record state.' });
  }
});

/* ==========================================
   👕 6. INVENTORY & PRODUCT MANAGEMENT
   ========================================== */

router.get('/products', async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(products.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shop inventory lists.' });
  }
});

router.post('/products', verifyAdminToken, upload.single('image'), async (req, res) => {
  const { name, description, price, sizes, colors, is_available } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const newProduct = await pool.query(
      `INSERT INTO products (name, description, price, sizes, colors, image_url, is_available) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, price, sizes, colors, imageUrl, is_available === 'true' || is_available === true]
    );
    res.status(201).json({ message: 'Product published to shop successfully!', data: newProduct.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create new product catalog entry.' });
  }
});

router.put('/products/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, sizes, colors, is_available } = req.body;

  try {
    const updatedProduct = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, sizes = $4, colors = $5, is_available = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, description, price, sizes, colors, is_available, id]
    );

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product item not found.' });
    }

    res.json({ message: 'Product stock updated successfully.', data: updatedProduct.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal database failure updating product features.' });
  }
});

/* ==========================================
   🎟️ 7. SCANNER & ATTENDANCE OPERATIONS
   ========================================== */

// Verify QR Token & Record Attendance
router.post('/scan-ticket', verifyAdminToken, async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'QR scan token is required.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Fetch ticket details & associated event classification
    const ticketRes = await client.query(
      `SELECT t.*, COALESCE(e.event_type, CASE WHEN e.price > 0 THEN 'paid' ELSE 'free' END) AS event_type, e.title AS event_title
       FROM event_tickets t 
       JOIN events e ON t.event_id = e.id 
       WHERE t.ticket_token = $1`,
      [token]
    );

    if (ticketRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Invalid ticket or ticket not found.' });
    }

    const ticket = ticketRes.rows[0];

    if (ticket.status === 'used') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: '⚠️ Alert: Ticket has already been scanned!' });
    }

    // Check member database table to verify current membership status
    const memberCheck = await client.query(
      `SELECT id FROM members WHERE LOWER(email) = LOWER($1)`,
      [ticket.customer_email]
    );
    const isMember = memberCheck.rows.length > 0;

    // Mark ticket status as used
    await client.query(
      `UPDATE event_tickets SET status = 'used' WHERE id = $1`,
      [ticket.id]
    );

    // Record verified entry into attendance log
    await client.query(
      `INSERT INTO event_attendance (ticket_id, event_id, customer_email, is_member, event_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [ticket.id, ticket.event_id, ticket.customer_email, isMember, ticket.event_type || 'paid']
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: '✅ Ticket verified! Attendance registered.',
      attendee: {
        email: ticket.customer_email,
        eventTitle: ticket.event_title,
        isMember: isMember,
        eventType: ticket.event_type || 'paid'
      }
    });

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Scan Ticket Processing Error:', err);
    res.status(500).json({ success: false, error: 'Database transaction error scanning ticket.' });
  } finally {
    if (client) client.release();
  }
});

// Member vs Non-Member Attendance Leaderboard for Gifting
router.get('/attendance-metrics', verifyAdminToken, async (req, res) => {
  try {
    const reportQuery = `
      SELECT 
        customer_email,
        is_member,
        COUNT(CASE WHEN event_type = 'paid' THEN 1 END) AS paid_events_attended,
        COUNT(CASE WHEN event_type = 'free' THEN 1 END) AS free_events_attended,
        COUNT(*) AS total_events_attended
      FROM event_attendance
      GROUP BY customer_email, is_member
      ORDER BY total_events_attended DESC, paid_events_attended DESC;
    `;

    const result = await pool.query(reportQuery);
    res.status(200).json({ success: true, leaderboard: result.rows });
  } catch (err) {
    console.error('Attendance Metrics Error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate attendance leaderboard.' });
  }
});

export default router;
