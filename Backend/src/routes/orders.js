const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { sendEmail } = require('../utils/mailer');

// PUT /api/admin/orders/:id/status
router.put('/admin/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'Processing', 'Shipped', or 'Delivered'

  try {
    // 1. Update the order status in the database and return customer details
    const updateResult = await db.query(
      `UPDATE orders 
       SET status = $1 
       WHERE id = $2 
       RETURNING id, customer_email, customer_name`,
      [status, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const order = updateResult.rows[0];

    // 2. If status is updated to 'Delivered', send the automated thank-you email
    if (status === 'Delivered') {
      await sendEmail({
        to: order.customer_email,
        subject: `Your Order #AWE-${order.id} Has Been Delivered!`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Thank You for Shopping With Us!</h2>
            <p>Hi ${order.customer_name || 'Valued Customer'},</p>
            <p>We are delighted to let you know that your order (Ref: <strong>AWE-${order.id}</strong>) has been successfully delivered.</p>
            <p>We hope you love your merchandise! If you have any questions or queries regarding your package, please do not hesitate to direct them to Tersh:</p>
            <p style="background-color: #f4f4f4; padding: 12px; border-left: 4px solid #cc2b5e;">
              📧 <strong>Support Email:</strong> <a href="mailto:tersh@alphawomenelevates.com">tersh@alphawomenelevates.com</a>
            </p>
            <br />
            <p>Warm regards,<br /><strong>Alpha Women Elevates Team</strong></p>
          </div>
        `
      });
    }

    res.json({ success: true, message: `Order status updated to ${status}` });

  } catch (err) {
    console.error('Failed to update order status:', err);
    res.status(500).json({ error: err.message || 'Server error updating order status.' });
  }
});

module.exports = router;