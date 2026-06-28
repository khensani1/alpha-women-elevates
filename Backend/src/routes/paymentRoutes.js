// routes/paymentRoutes.js
import express from 'express';
import crypto from 'crypto';

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

export default router;