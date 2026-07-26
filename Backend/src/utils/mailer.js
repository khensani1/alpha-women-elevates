import { Resend } from 'resend';

// Initialize Resend with the API key from your environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a structured order notification email to Tersh (the owner)
 */
export const sendOrderNotificationToAdmin = async (orderData, items) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.product_name}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.size || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.color || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">R${item.price}</td>
    </tr>
  `).join('');

  try {
    const data = await resend.emails.send({
      from: 'AWE System <onboarding@resend.dev>', // Resend gives you this default testing domain for free!
      to: 'tersh_email_here@example.com', // 👈 Put Tersh's real email address here
      subject: `🚨 New Order Received! - Total: R${orderData.total_amount}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #4A154B; border-bottom: 2px solid #4A154B; padding-bottom: 10px;">New Order Details</h2>
          <p><strong>Customer Email:</strong> ${orderData.customer_email}</p>
          <p><strong>Order Status:</strong> ${orderData.status}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 8px; border: 1px solid #ddd;">Item</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Size</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Color</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <h3 style="text-align: right; margin-top: 20px; color: #4A154B;">Grand Total: R${orderData.total_amount}</h3>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    throw error;
  }
};