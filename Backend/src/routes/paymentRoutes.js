import express from 'express';
import pool from '../db.js';
import { createPayPalOrder, capturePayPalOrder } from '../utils/paypal.js';
import {
  sendOrderNotificationToAdmin,
  sendOrderReceiptToCustomer,
  sendPaymentSuccessEmail,
} from '../utils/mailer.js';

const router = express.Router();

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const backendUrl = () => process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * POST /api/payments/paypal-checkout
 * Creates a PayPal order for shop cart checkout and returns the approval URL.
 */
router.post('/paypal-checkout', async (req, res) => {
  const { amount, item_name, email, cartItems } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ error: 'Email and amount are required.' });
  }

  try {
    const pending = await pool.query(
      `INSERT INTO pending_checkouts (customer_email, amount, checkout_type, cart_items, metadata)
       VALUES ($1, $2, 'shop', $3, $4)
       RETURNING id`,
      [
        email.trim(),
        parseFloat(amount).toFixed(2),
        JSON.stringify(cartItems || []),
        JSON.stringify({ item_name: item_name || 'Alpha Women Elevates Order' }),
      ]
    );

    const pendingId = pending.rows[0].id;

    const { orderId, approveUrl } = await createPayPalOrder({
      amount,
      currency: process.env.PAYPAL_CURRENCY || 'ZAR',
      description: item_name || 'Alpha Women Elevates Order',
      customId: `shop:${pendingId}`,
      payerEmail: email.trim(),
      returnUrl: `${backendUrl()}/api/payments/paypal-return?pending_id=${pendingId}`,
      cancelUrl: `${frontendUrl()}/cart?payment=cancelled`,
    });

    await pool.query(
      `UPDATE pending_checkouts SET paypal_order_id = $1 WHERE id = $2`,
      [orderId, pendingId]
    );

    if (!approveUrl) {
      return res.status(500).json({ error: 'PayPal did not return an approval link.' });
    }

    res.status(200).json({ url: approveUrl, orderId });
  } catch (err) {
    console.error('PayPal checkout init error:', err);
    res.status(500).json({ error: err.message || 'Failed to start PayPal checkout.' });
  }
});

/**
 * GET /api/payments/paypal-return
 * Captures payment after buyer approves on PayPal, then redirects to frontend.
 */
router.get('/paypal-return', async (req, res) => {
  const token = req.query.token; // PayPal order ID
  const pendingId = req.query.pending_id;

  try {
    if (!token) {
      return res.redirect(`${frontendUrl()}/cart?payment=cancelled`);
    }

    const capture = await capturePayPalOrder(token);
    const status = capture.status;

    if (status !== 'COMPLETED') {
      console.warn('PayPal capture not completed:', status);
      return res.redirect(`${frontendUrl()}/cart?payment=cancelled`);
    }

    const pendingRes = await pool.query(
      `SELECT * FROM pending_checkouts
       WHERE paypal_order_id = $1 OR id = $2
       LIMIT 1`,
      [token, pendingId || 0]
    );

    if (pendingRes.rows.length === 0) {
      console.error('No pending checkout found for PayPal order', token);
      return res.redirect(`${frontendUrl()}/cart?payment=success`);
    }

    const pending = pendingRes.rows[0];

    if (pending.checkout_type === 'membership') {
      await finalizeMembershipPayment(pending, token);
      await pool.query(`DELETE FROM pending_checkouts WHERE id = $1`, [pending.id]);
      return res.redirect(
        `${frontendUrl()}/community?payment=success`
      );
    }

    // Shop order
    await finalizeShopOrder(pending, token);
    await pool.query(`DELETE FROM pending_checkouts WHERE id = $1`, [pending.id]);
    return res.redirect(`${frontendUrl()}/cart?payment=success`);
  } catch (err) {
    console.error('PayPal return/capture error:', err);
    return res.redirect(`${frontendUrl()}/cart?payment=cancelled`);
  }
});

async function finalizeShopOrder(pending, paypalOrderId) {
  const customerEmail = pending.customer_email;
  const totalAmount = pending.amount;
  let cartItems = pending.cart_items;

  if (typeof cartItems === 'string') {
    try {
      cartItems = JSON.parse(cartItems);
    } catch {
      cartItems = [];
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (customer_email, total_amount, status)
       VALUES ($1, $2, 'Processing')
       RETURNING id, customer_email, total_amount, status`,
      [customerEmail, totalAmount]
    );
    const newOrder = orderResult.rows[0];

    if (Array.isArray(cartItems) && cartItems.length > 0) {
      for (const item of cartItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_name, quantity, size, color, price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            newOrder.id,
            item.name || item.product_name,
            item.quantity,
            item.size || 'N/A',
            item.color || 'N/A',
            item.price,
          ]
        );
      }
    }

    await client.query('COMMIT');

    const emailItems = (cartItems || []).map((item) => ({
      product_name: item.product_name || item.name,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
    }));

    try {
      await sendOrderNotificationToAdmin(newOrder, emailItems);
      await sendOrderReceiptToCustomer(newOrder, emailItems);
    } catch (emailErr) {
      console.error('Order email dispatch failed:', emailErr);
    }

    console.log(`🎉 Shop order #${newOrder.id} paid via PayPal (${paypalOrderId})`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function finalizeMembershipPayment(pending, paypalOrderId) {
  const email = pending.customer_email;
  const amount = pending.amount || 100;

  await pool.query(
    `UPDATE members
     SET subscription_status = 'active',
         payfast_token = COALESCE($1, payfast_token),
         last_payment_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(email) = LOWER($2)`,
    [paypalOrderId, email]
  );

  await pool.query(
    `INSERT INTO membership_payments (member_email, amount, payment_status, payfast_payment_id)
     VALUES ($1, $2, 'COMPLETE', $3)`,
    [email, amount, paypalOrderId]
  );

  try {
    await sendPaymentSuccessEmail({
      to: email,
      amount,
      paymentType: 'Monthly Membership',
      reference: paypalOrderId,
    });
  } catch (emailErr) {
    console.error('Membership payment email failed:', emailErr);
  }

  console.log(`✅ Member ${email} activated via PayPal (${paypalOrderId})`);
}

export default router;
