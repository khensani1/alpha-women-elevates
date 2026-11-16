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

// Helper function to generate PayFast MD5 Signature
function generatePayFastSignature(data, passPhrase = null) {
  let pfOutput = '';
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        // PayFast requires spaces encoded as '+' and uppercase hex encoding
        pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
      }
    }
  }

  // Remove trailing '&'
  let getString = pfOutput.slice(0, -1);
  if (passPhrase !== null && passPhrase !== '') {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(getString).digest('hex');
}

app.get('/', (req, res) => {
  res.json({ message: "API Running smoothly 🚀" });
});

app.get('/api/community-link', (req, res) => {
  res.json({ url: process.env.WHATSAPP_COMMUNITY_URL });
});

// Initialize PayFast Subscription
app.post('/api/initialize-subscription', async (req, res) => {
  const { name, surname, email } = req.body;

  if (!name || !surname || !email) {
    return res.status(400).json({ error: "Profile details are required to initialize subscription." });
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
      return_url: process.env.PAYFAST_RETURN_URL,
      cancel_url: process.env.PAYFAST_CANCEL_URL,
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

    // Generate MD5 Signature using your Passphrase
    params.signature = generatePayFastSignature(params, process.env.PAYFAST_PASSPHRASE);

    const queryString = new URLSearchParams(params).toString();
    res.json({ redirectUrl: `${payfastUrl}?${queryString}` });

  } catch (error) {
    console.error("Subscription initiation breakdown:", error);
    res.status(500).json({ error: "Failed to initialize secure checkout engine." });
  }
});

// ITN Webhook: PayFast calls this automatically when payment succeeds
app.post('/api/payfast-itn', async (req, res) => {
  console.log("🔔 PayFast ITN Received:", req.body);
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
    console.error("ITN Database Update Error:", err);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n⚡ SERVER RUNNING ON PORT ${PORT}`);
});