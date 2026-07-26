// routes/paymentRoutes.js
import express from 'express';
import crypto from 'crypto';
import pool from '../db.js'; // Adjust this path to wherever your DB pool connection is
import { sendOrderNotificationToAdmin } from '../utils/mailer.js';

const router = express.Router();


router.post('/payfast-checkout', (req, res) => {
  const { amount, item_name } = req.body;

  const payfastData = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID || '10000100', 
    merchant_key: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a', 
    return_url: 'http://localhost:5173/cart?payment=success', 
    cancel_url: 'http://localhost:5173/cart?payment=cancelled',
    notify_url: 'https://your-domain.render.com/api/payments/payfast-notify', 
    name_first: 'AWE',
    name_last: 'Customer',
    amount: parseFloat(amount).toFixed(2),
    item_name: item_name,
  };

  let paramString = '';
  for (const key in payfastData) {
    if (payfastData.hasOwnProperty(key)) {
      paramString += `${key}=${encodeURIComponent(payfastData[key].trim()).replace(/%20/g, '+')}&`;
    }
  }
  paramString = paramString.slice(0, -1); 

  if (process.env.PAYFAST_PASSPHRASE) {
    paramString += `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE.trim()).replace(/%20/g, '+')}`;
  }
  const signature = crypto.createHash('md5').update(paramString).digest('hex');

  const payfastUrl = `https://sandbox.payfast.co.za/eng/process?${paramString}&signature=${signature}`;

  res.status(200).json({ url: payfastUrl });
});


export const handlePayFastCallback = async (req, res) => {
  // PayFast sends transaction data in the request body
  const pfData = req.body;

  // 1. Verify that the payment status is COMPLETE
  if (pfData.payment_status === 'COMPLETE') {
    const customerEmail = pfData.email_address;
    const totalAmount = pfData.amount_gross;
    
    // PayFast custom fields can pass data back to the callback. 
    // We assume you stringified the cart items into `custom_str1` during checkout initialization.
    let cartItems = [];
    try {
      if (pfData.custom_str1) {
        cartItems = JSON.parse(pfData.custom_str1);
      }
    } catch (err) {
      console.error("Failed to parse cart items from PayFast callback:", err);
    }

    let client;
    try {
      // Get a client from the pool to handle a multi-table database transaction
      client = await pool.connect();
      await client.query('BEGIN');

      // 2. Insert the main order record into the 'orders' table
      const orderQuery = `
        INSERT INTO orders (customer_email, total_amount, status)
        VALUES ($1, $2, 'Processing')
        RETURNING id, customer_email, total_amount, status;
      `;
      const orderResult = await client.query(orderQuery, [customerEmail, totalAmount]);
      const newOrder = orderResult.rows[0];

      // 3. Insert each individual cart item into the 'order_items' table
      if (cartItems.length > 0) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_name, quantity, size, color, price)
          VALUES ($1, $2, $3, $4, $5, $6);
        `;
        
        for (const item of cartItems) {
          await client.query(itemQuery, [
            newOrder.id,
            item.name,       // Product name
            item.quantity,   // Quantity
            item.size,       // e.g., 'M', 'L', 'XL'
            item.color,      // e.g., 'Black', 'White'
            item.price       // Single item price
          ]);
        }
      }

      // Commit the database transaction if both inserts pass smoothly
      await client.query('COMMIT');
      console.log(`🎉 Order #${newOrder.id} successfully saved to DB!`);

      // 4. Trigger the Resend email engine to notify Tersh
      // We pass the order summary details and the exact item breakdown arrays
      await sendOrderNotificationToAdmin(newOrder, cartItems);
      console.log(`✉️ Notification email sent to Tersh for Order #${newOrder.id}`);

    } catch (dbError) {
      if (client) await client.query('ROLLBACK');
      console.error("❌ Transaction Error. Failed to process order payload:", dbError);
    } finally {
      if (client) client.release();
    }
  }

  // PayFast needs a clean 200 OK status response to acknowledge you received the webhook data
  return res.status(200).send('OK');
};


export default router;