import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto'; // Built-in Node module for PayFast MD5 signature
import pool from './db.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import trackingRoutes from './routes/tracking.js';
import eventsRouter from './routes/events.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// PayFast sends ITN webhook data as URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api/payments', paymentRoutes);
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
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: process.env.PAYFAST_RETURN_URL || 'https://alpha-women-elevates.vercel.app/payment-success',
      cancel_url: process.env.PAYFAST_CANCEL_URL || 'https://alpha-women-elevates.vercel.app/payment-cancelled',
      notify_url: `${process.env.BACKEND_URL}/api/payfast-itn`,

      name_first: name,
      name_last: surname,
      email_address: email,

      item_name: 'Alpha Women Elevates Monthly Membership',
      amount: '100.00',

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

// ITN Webhook: PayFast calls this automatically when payment succeeds
app.post('/api/payfast-itn', async (req, res) => {
  console.log('🔔 PayFast ITN Received:', req.body);
  const { payment_status, email_address, token } = req.body;

  try {
    if (payment_status === 'COMPLETE' && email_address) {
      await pool.query(
        `UPDATE members 
         SET subscription_status = 'active', payfast_token = $1 
         WHERE email = $2`,
        [token || null, email_address]
      );
      console.log(`✅ Member ${email_address} activated!`);
    }
    // Always return 200 OK so PayFast stops retrying
    res.status(200).send('OK');
  } catch (err) {
    console.error('ITN Database Update Error:', err);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n⚡ SERVER RUNNING ON PORT ${PORT}`);
});