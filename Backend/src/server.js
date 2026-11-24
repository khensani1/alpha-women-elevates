import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto'; // Built-in Node module for PayFast MD5 signature
import pool from './db.js';
import paymentRoutes, { handlePayFastCallback } from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import trackingRoutes from './routes/tracking.js';
import eventsRouter from './routes/events.js';
import {
  sendPaymentSuccessEmail,
  sendUnsubscribeRequestToAdmin,
} from './utils/mailer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// PayFast sends ITN webhook data as URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api/payments', paymentRoutes);
app.post('/api/payments/payfast-notify', handlePayFastCallback);
app.use('/api/admin', adminRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/gallery', adminRoutes);
app.use('/api/events', eventsRouter);

// PayFast-compliant URL encoder (matches PHP's urlencode uppercase hex)
function pfEncode(val) {
  return encodeURIComponent(val.toString().trim())
    .replace(/%20/g, '+')
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

// Builds the exact parameter string used for both the MD5 signature and redirect URL
function buildPayFastRedirectUrl(baseUrl, params, passPhrase = null) {
  const pairs = [];

  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) {
      pairs.push(`${key}=${pfEncode(value)}`);
    }
  }

  const paramString = pairs.join('&');
  const stringToHash =
    passPhrase && passPhrase.trim() !== ''
      ? `${paramString}&passphrase=${pfEncode(passPhrase)}`
      : paramString;

  const signature = crypto.createHash('md5').update(stringToHash).digest('hex');

  return `${baseUrl}?${paramString}&signature=${signature}`;
}

app.get('/', (req, res) => {
  res.json({ message: 'API Running smoothly 🚀' });
});

app.get('/api/community-link', (req, res) => {
  res.json({ url: process.env.WHATSAPP_COMMUNITY_URL });
});

// Initialize PayFast Subscription
app.post('/api/initialize-subscription', async (req, res) => {
  const { name, surname, email } = req.body;

  if (!name || !surname || !email) {
    return res.status(400).json({ error: 'Profile details are required to initialize subscription.' });
  }

  if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY || !process.env.BACKEND_URL) {
    console.error('Missing PayFast or BACKEND_URL environment variables on Render!');
    return res.status(500).json({ error: 'Server payment configuration is incomplete.' });
  }

  try {
    const checkUser = await pool.query('SELECT * FROM members WHERE email = $1', [email]);
    if (checkUser.rows.length === 0) {
      await pool.query(
        'INSERT INTO members (name, surname, email, subscription_status) VALUES ($1, $2, $3, $4)',
        [name, surname, email, 'pending']
      );
    }

    const isSandbox = process.env.PAYFAST_MODE === 'sandbox';
    const payfastUrl = isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    // IMPORTANT: Parameter order matters for PayFast signature validation!
    const params = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID.trim(),
      merchant_key: process.env.PAYFAST_MERCHANT_KEY.trim(),
      return_url: (process.env.PAYFAST_RETURN_URL || 'https://alpha-women-elevates.vercel.app/community?payment=success').trim(),
      cancel_url: (process.env.PAYFAST_CANCEL_URL || 'https://alpha-women-elevates.vercel.app/community?payment=cancelled').trim(),
      notify_url: `${process.env.BACKEND_URL.trim()}/api/payfast-itn`,

      name_first: name.trim(),
      name_last: surname.trim(),
      email_address: email.trim(),

      amount: '100.00',
      item_name: 'Alpha Women Elevates Monthly Membership',

      subscription_type: '1',
      billing_date: new Date().toISOString().split('T')[0],
      recurring_amount: '100.00',
      frequency: '3',
      cycles: '0'
    };

    const redirectUrl = buildPayFastRedirectUrl(
      payfastUrl,
      params,
      process.env.PAYFAST_PASSPHRASE
    );

    res.json({ redirectUrl });
  } catch (error) {
    console.error('Subscription initiation breakdown:', error.message);
    res.status(500).json({ error: error.message || 'Failed to initialize secure checkout engine.' });
  }
});

// ITN Webhook: PayFast calls this automatically when payment succeeds / fails / cancels
app.post('/api/payfast-itn', async (req, res) => {
  console.log('🔔 PayFast ITN Received:', req.body);
  const {
    payment_status,
    email_address,
    token,
    amount_gross,
    pf_payment_id,
  } = req.body;

  try {
    if (email_address && payment_status === 'COMPLETE') {
      await pool.query(
        `UPDATE members 
         SET subscription_status = 'active',
             payfast_token = COALESCE($1, payfast_token),
             last_payment_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE LOWER(email) = LOWER($2)`,
        [token || null, email_address]
      );

      await pool.query(
        `INSERT INTO membership_payments (member_email, amount, payment_status, payfast_payment_id)
         VALUES ($1, $2, $3, $4)`,
        [email_address, amount_gross || 100, 'COMPLETE', pf_payment_id || null]
      );

      try {
        await sendPaymentSuccessEmail({
          to: email_address,
          amount: amount_gross || '100.00',
          paymentType: 'Monthly Membership',
          reference: pf_payment_id || 'Membership',
        });
      } catch (emailErr) {
        console.error('Membership payment email failed:', emailErr);
      }

      console.log(`✅ Member ${email_address} activated / payment recorded!`);
    } else if (email_address && (payment_status === 'FAILED' || payment_status === 'CANCELLED')) {
      const fallbackStatus = payment_status === 'CANCELLED' ? 'cancelled' : 'failed';
      await pool.query(
        `UPDATE members
         SET subscription_status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE LOWER(email) = LOWER($2)`,
        [fallbackStatus, email_address]
      );
      console.log(`⚠️ Member ${email_address} marked as ${fallbackStatus}`);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('ITN Database Update Error:', err);
    res.status(500).send('Server Error');
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