import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { initializePaystackTransaction, verifyPaystackTransaction } from '../utils/paystack.js';
import {
  sendOrderNotificationToAdmin,
  sendOrderReceiptToCustomer,
  sendPaymentSuccessEmail,
} from '../utils/mailer.js';

const router = express.Router();

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const backendUrl = () => process.env.BACKEND_URL || 'http://localhost:5000';

function makeReference(prefix, pendingId) {
  return `${prefix}_${pendingId}_${Date.now()}`;
}

/**
 * POST /api/payments/paystack-checkout
 * Initializes Paystack payment for shop cart checkout.
 */
router.post('/paystack-checkout', async (req, res) => {
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
    const reference = makeReference('shop', pendingId);

    const { authorizationUrl } = await initializePaystackTransaction({
      email: email.trim(),
      amount,
      reference,
      callbackUrl: `${backendUrl()}/api/payments/paystack-callback?pending_id=${pendingId}`,
      metadata: {
        pending_id: pendingId,
        checkout_type: 'shop',
        custom_fields: [
          {
            display_name: 'Order Type',
            variable_name: 'order_type',
            value: 'Shop Order',
          },
        ],
      },
    });

    await pool.query(
      `UPDATE pending_checkouts
       SET paypal_order_id = $1, payment_reference = $1
       WHERE id = $2`,
      [reference, pendingId]
    );

    res.status(200).json({ url: authorizationUrl, reference });
  } catch (err) {
    console.error('Paystack checkout init error:', err);
    res.status(500).json({ error: err.message || 'Failed to start Paystack checkout.' });
  }
});

/**
 * GET /api/payments/paystack-callback
 * Verifies payment after Paystack redirects the buyer back.
 */
router.get('/paystack-callback', async (req, res) => {
  const reference = req.query.reference || req.query.trxref;
  const pendingId = req.query.pending_id;

  try {
    if (!reference) {
      return res.redirect(`${frontendUrl()}/cart?payment=cancelled`);
    }

    const verified = await verifyPaystackTransaction(reference);

    if (verified.status !== 'success') {
      console.warn('Paystack payment not successful:', verified.status);
      return res.redirect(`${frontendUrl()}/cart?payment=cancelled`);
    }

    const pendingRes = await pool.query(
      `SELECT * FROM pending_checkouts
       WHERE payment_reference = $1
          OR paypal_order_id = $1
          OR id = $2
       LIMIT 1`,
      [reference, pendingId || 0]
    );

    if (pendingRes.rows.length === 0) {
      console.error('No pending checkout found for Paystack reference', reference);
      return res.redirect(`${frontendUrl()}/cart?payment=success`);
    }

    const pendingRow = pendingRes.rows[0];
    const claimed = await pool.query(
      `DELETE FROM pending_checkouts WHERE id = $1 RETURNING *`,
      [pendingRow.id]
    );

    if (claimed.rows.length === 0) {
      const dest =
        pendingRow.checkout_type === 'membership'
          ? `${frontendUrl()}/community?payment=success`
          : `${frontendUrl()}/cart?payment=success`;
      return res.redirect(dest);
    }

    const pending = claimed.rows[0];

    if (pending.checkout_type === 'membership') {
      await finalizeMembershipPayment(pending, reference);
      return res.redirect(`${frontendUrl()}/community?payment=success`);
    }

    await finalizeShopOrder(pending, reference);
    return res.redirect(`${frontendUrl()}/cart?payment=success`);
  } catch (err) {
    console.error('Paystack callback/verify error:', err);
    return res.redirect(`${frontendUrl()}/cart?payment=cancelled`);
  }
});

/**
 * POST /api/payments/paystack-webhook
 * Optional webhook for charge.success (set URL in Paystack dashboard).
 */
router.post('/paystack-webhook', async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'];

    if (secret && signature) {
      const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
      if (hash !== signature) {
        return res.status(401).send('Invalid signature');
      }
    }

    const event = req.body;
    if (event?.event === 'charge.success') {
      const reference = event.data?.reference;
      if (reference) {
        const pendingRes = await pool.query(
          `SELECT * FROM pending_checkouts
           WHERE payment_reference = $1 OR paypal_order_id = $1
           LIMIT 1`,
          [reference]
        );

        if (pendingRes.rows.length > 0) {
          const claimed = await pool.query(
            `DELETE FROM pending_checkouts WHERE id = $1 RETURNING *`,
            [pendingRes.rows[0].id]
          );
          if (claimed.rows.length > 0) {
            const pending = claimed.rows[0];
            if (pending.checkout_type === 'membership') {
              await finalizeMembershipPayment(pending, reference);
            } else {
              await finalizeShopOrder(pending, reference);
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Paystack webhook error:', err);
    res.sendStatus(500);
  }
});

async function finalizeShopOrder(pending, paymentReference) {
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

    console.log(`🎉 Shop order #${newOrder.id} paid via Paystack (${paymentReference})`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function finalizeMembershipPayment(pending, paymentReference) {
  const email = pending.customer_email;
  const amount = pending.amount || 100;

  await pool.query(
    `UPDATE members
     SET subscription_status = 'active',
         payfast_token = COALESCE($1, payfast_token),
         last_payment_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(email) = LOWER($2)`,
    [paymentReference, email]
  );

  await pool.query(
    `INSERT INTO membership_payments (member_email, amount, payment_status, payfast_payment_id)
     VALUES ($1, $2, 'COMPLETE', $3)`,
    [email, amount, paymentReference]
  );

  try {
    await sendPaymentSuccessEmail({
      to: email,
      amount,
      paymentType: 'Monthly Membership',
      reference: paymentReference,
    });
  } catch (emailErr) {
    console.error('Membership payment email failed:', emailErr);
  }

  console.log(`✅ Member ${email} activated via Paystack (${paymentReference})`);
}

export default router;
