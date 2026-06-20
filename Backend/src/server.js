import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js'; // Imports our database controller

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Base Test Route
app.get('/', (req, res) => {
  res.json({ message: "API Running smoothly 🚀" });
});

// Endpoint to securely fetch the community link
app.get('/api/community-link', (req, res) => {
  res.json({ url: process.env.WHATSAPP_COMMUNITY_URL });
});

// Endpoint to initialize a secure subscription payload for PayFast
app.post('/api/initialize-subscription', async (req, res) => {
  const { name, surname, email } = req.body;

  if (!name || !surname || !email) {
    return res.status(400).json({ error: "Profile details are required to initialize subscription." });
  }

  try {
    // 1. Insert the member as 'pending' into Supabase first
    const checkUser = await pool.query('SELECT * FROM members WHERE email = $1', [email]);
    if (checkUser.rows.length === 0) {
      await pool.query(
        'INSERT INTO members (name, surname, email, subscription_status) VALUES ($1, $2, $3, $4)',
        [name, surname, email, 'pending']
      );
    }

    // 2. Build the PayFast parameters for a recurring R100 monthly subscription
    const payfastUrl = 'https://sandbox.payfast.co.za/eng/process'; // Use sandbox for testing
    
    const params = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: process.env.PAYFAST_RETURN_URL,
      cancel_url: process.env.PAYFAST_CANCEL_URL,
      
      // User Profile details
      name_first: name,
      name_last: surname,
      email_address: email,
      
      // Item Details
      item_name: 'Alpha Women Elevates Monthly Membership',
      amount: '100.00', // The absolute amount charged on day one
      
      // Subscription Mechanics (Debit Order settings)
      subscription_type: '1', // '1' defines a standard recurring token subscription
      billing_date: new Date().toISOString().split('T')[0], // Starts charging today
      recurring_amount: '100.00', // R100 every period
      frequency: '3', // '3' represents Monthly billing cycles
      cycles: '0' // '0' means run indefinitely until cancelled by member
    };

    // Construct the query parameter redirect string
    const queryString = new URLSearchParams(params).toString();
    
    res.json({ redirectUrl: `${payfastUrl}?${queryString}` });

  } catch (error) {
    console.error("Subscription initiation breakdown:", error);
    res.status(500).json({ error: "Failed to initialize secure checkout engine." });
  }
});

app.listen(PORT, () => {
  console.log(`\n⚡ SERVER RUNNING ON PORT ${PORT}`);
});