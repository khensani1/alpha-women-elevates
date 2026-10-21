import { Resend } from 'resend';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key');

const FROM_EMAIL = process.env.EMAIL_FROM || 'AWE System <onboarding@resend.dev>';

/**
 * Generic sendEmail function required by event routes & delivery notifications
 */
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      attachments,
    });
    return data;
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    throw error;
  }
};

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
      from: FROM_EMAIL,
      to: 'tersh@alphawomenelevates.com',
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

/**
 * Sends automated customer purchase order receipt
 */
export const sendOrderReceiptToCustomer = async (orderData, items) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.product_name}</strong><br/>
        <span style="font-size: 11px; color: #666;">Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R${item.price}</td>
    </tr>
  `).join('');

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: orderData.customer_email,
      subject: `Order Confirmation - Ref: AWE-${orderData.id || 'NEW'}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: auto; padding: 24px; color: #2D2727; background-color: #fcfbfa; border: 1px solid #eaeaea;">
          <h1 style="color: #4A154B; text-align: center; margin-bottom: 5px;">Alpha Women Elevates</h1>
          <p style="text-align: center; font-style: italic; color: #666; font-size: 13px; margin-top: 0;">Thank you for your purchase!</p>
          
          <div style="margin-top: 24px; padding: 16px; background-color: #ffffff; border: 1px solid #e5e5e5;">
            <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Order Reference</p>
            <p style="margin: 0; font-weight: bold; font-size: 16px; color: #4A154B;">AWE-${orderData.id || 'CONFIRMED'}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #4A154B; text-align: left; font-size: 12px; text-transform: uppercase; color: #4A154B;">
                <th style="padding: 8px 10px;">Item</th>
                <th style="padding: 8px 10px; text-align: center;">Qty</th>
                <th style="padding: 8px 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px; padding-top: 10px; border-top: 2px solid #4A154B;">
            <span style="font-size: 14px; text-transform: uppercase; color: #666;">Total Paid: </span>
            <strong style="font-size: 20px; color: #4A154B;">R${orderData.total_amount}</strong>
          </div>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error("Failed to send customer order receipt via Resend:", error);
    throw error;
  }
};

/**
 * Generates and sends event ticket with an embedded QR Code
 */
export const sendEventTicketEmail = async (customerEmail, eventDetails, isMember = false) => {
  // Generate a unique 32-character token for secure QR verification
  const ticketToken = crypto.randomBytes(16).toString('hex');

  // Embed JSON payload inside QR code
  const qrPayload = JSON.stringify({
    token: ticketToken,
    eventId: eventDetails.id,
    email: customerEmail
  });

  // Render QR code to a PNG Buffer
  const qrPngBuffer = await QRCode.toBuffer(qrPayload, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2
  });

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Your Event Ticket: ${eventDetails.title}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: auto; padding: 24px; background-color: #fdf2f8; border: 1px solid #f3e8ff; color: #3A2346;">
          <h2 style="color: #4A154B; text-align: center; margin-bottom: 4px;">Alpha Women Elevates</h2>
          <p style="text-align: center; font-size: 12px; text-transform: uppercase; tracking: 2px; color: #666; margin-top: 0;">Official Access Ticket</p>

          <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e9d5ff; border-radius: 4px; text-align: center; margin-top: 20px;">
            <h3 style="margin: 0 0 8px 0; color: #4A154B; font-size: 20px;">${eventDetails.title}</h3>
            
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7e22ce; margin: 0 0 16px 0;">
              Event Pass: <strong>${(eventDetails.event_type || 'paid').toUpperCase()}</strong> 
              ${isMember ? ' | <span style="color:#15803d; font-weight:bold;">MEMBER ACCESS</span>' : ''}
            </p>

            <div style="margin: 16px 0;">
              <img src="cid:event_qr_code" alt="Event Access QR Code" style="width: 200px; height: 200px; border: 1px solid #f3e8ff; padding: 8px; background: #fff;" />
            </div>

            <p style="font-size: 12px; color: #555; margin-bottom: 4px;">Please show this QR code at the entrance for attendance registration.</p>
            <p style="font-size: 10px; color: #aaa; font-family: monospace; margin: 0;">Ref: ${ticketToken}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'ticket-qr.png',
          content: qrPngBuffer,
          content_type: 'image/png',
          cid: 'event_qr_code'
        }
      ]
    });

    return { data, ticketToken };
  } catch (error) {
    console.error("Failed to send event ticket via Resend:", error);
    throw error;
  }
};
