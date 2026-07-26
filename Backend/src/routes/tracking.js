import express from 'express';
import pool from '../db.js';

const router = express.Router();

/**
 * GET /api/tracking?email=user@example.com
 * Fetches all orders and associated items for a specific email
 */
router.get('/', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required to track orders.' });
  }

  try {
    // 1. Fetch all orders matching this email, sorted by newest first
    const ordersQuery = `
      SELECT id, total_amount, status, created_at 
      FROM orders 
      WHERE LOWER(customer_email) = LOWER($1)
      ORDER BY created_at DESC;
    `;
    const ordersResult = await pool.query(ordersQuery, [email.trim()]);
    const orders = ordersResult.rows;

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this email address.' });
    }

    // 2. Fetch all individual items for these specific orders
    const orderIds = orders.map(o => o.id);
    const itemsQuery = `
      SELECT order_id, product_name, quantity, size, color, price 
      FROM order_items 
      WHERE order_id = ANY($1);
    `;
    const itemsResult = await pool.query(itemsQuery, [orderIds]);
    const allItems = itemsResult.rows;

    // 3. Structural merge: Attach the items array directly to its respective order
    const structuredOrders = orders.map(order => {
      return {
        ...order,
        items: allItems.filter(item => item.order_id === order.id)
      };
    });

    return res.status(200).json({ orders: structuredOrders });

  } catch (error) {
    console.error('Tracking Error:', error);
    return res.status(500).json({ error: 'Internal server error while retrieving order logs.' });
  }
});

export default router;