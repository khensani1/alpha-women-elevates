import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import trackingRoutes from './routes/tracking.js';
import eventsRouter from './routes/events.js';
import { createPayPalOrder } from './utils/paypal.js';
import { sendUnsubscribeRequestToAdmin } from './utils/mailer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const backendUrl = () => process.env.BACKEND_URL || 'http://localhost:5000';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/gallery', adminRoutes);
app.use('/api/events', eventsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'API Running smoothly 🚀' });
});

app.get('/api/community-link', (req, res) => {
  res.json({ url: process.env.WHATSAPP_COMMUNITY_URL });
});

/* ==========================================
   💳 PAYPAL MEMBERSHIP SUBSCRIPTION CHECKOUT
   ========================================== */
app.post('/api/initialize-subscription', async (req, res) => {
  const { name, surname, email } = req.body;

  if (!name || !surname || !email) {
    return res.status(400).json({ error: 'Profile details are required to initialize subscription.' });
  }

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error('Missing PayPal credentials (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET).');
    return res.status(500).json({ error: 'Server payment configuration is incomplete.' });
  }

  try {
    const checkUser = await pool.query('SELECT * FROM members WHERE email = $1', [email]);
    if (checkUser.rows.length === 0) {
      await pool.query(
        'INSERT INTO members (name, surname, email, subscription_status) VALUES ($1, $2, $3, $4)',
        [name, surname, email, 'pending']
      );
    } else {
      await pool.query(
        `UPDATE members SET name = $1, surname = $2, updated_at = CURRENT_TIMESTAMP WHERE email = $3`,
        [name, surname, email]
      );
    }

    const amount = process.env.MEMBERSHIP_AMOUNT || '100.00';

    const pending = await pool.query(
      `INSERT INTO pending_checkouts (customer_email, amount, checkout_type, cart_items, metadata)
       VALUES ($1, $2, 'membership', '[]'::jsonb, $3)
       RETURNING id`,
      [
        email.trim(),
        amount,
        JSON.stringify({ name, surname, type: 'membership' }),
      ]
    );

    const pendingId = pending.rows[0].id;

    const { orderId, approveUrl } = await createPayPalOrder({
      amount,
      currency: process.env.PAYPAL_CURRENCY || 'ZAR',
      description: 'Alpha Women Elevates Monthly Membership',
      customId: `membership:${pendingId}`,
      payerEmail: email.trim(),
      returnUrl: `${backendUrl()}/api/payments/paypal-return?pending_id=${pendingId}`,
      cancelUrl: `${frontendUrl()}/community?payment=cancelled`,
    });

    await pool.query(
      `UPDATE pending_checkouts SET paypal_order_id = $1 WHERE id = $2`,
      [orderId, pendingId]
    );

    if (!approveUrl) {
      return res.status(500).json({ error: 'PayPal did not return an approval link.' });
    }

    res.json({ redirectUrl: approveUrl, orderId });
  } catch (error) {
    console.error('Subscription initiation breakdown:', error.message);
    res.status(500).json({ error: error.message || 'Failed to initialize secure checkout engine.' });
  }
});

/* ==========================================
   🚫 MEMBERSHIP UNSUBSCRIBE (public)
   ========================================== */
async function processUnsubscribe(email, res) {
  const normalized = (email || '').trim();

  if (!normalized) {
    return res.status(400).json({ error: 'Email is required to unsubscribe.' });
  }

  try {
    const memberRes = await pool.query(
      `SELECT id, name, surname, email, subscription_status FROM members WHERE LOWER(email) = LOWER($1)`,
      [normalized]
    );

    if (memberRes.rows.length === 0) {
      return res.status(404).json({ error: 'No membership found for this email.' });
    }

    const member = memberRes.rows[0];

    await pool.query(
      `UPDATE members
       SET subscription_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [member.id]
    );

    try {
      await sendUnsubscribeRequestToAdmin({
        email: member.email,
        name: member.name,
        surname: member.surname,
      });
    } catch (emailErr) {
      console.error('Unsubscribe admin notification failed:', emailErr);
    }

    return res.json({
      success: true,
      message: 'Unsubscribe request received. Our team has been notified and will process your cancellation.',
    });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return res.status(500).json({ error: 'Failed to process unsubscribe request.' });
  }
}

app.post('/api/unsubscribe', async (req, res) => {
  return processUnsubscribe(req.body.email || req.query.email, res);
});

app.get('/api/unsubscribe', async (req, res) => {
  return processUnsubscribe(req.query.email, res);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n⚡ SERVER RUNNING ON PORT ${PORT}`);
});
