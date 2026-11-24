/**
 * PayPal REST API helpers (Orders v2)
 * Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE=sandbox|live
 */

const getBaseUrl = () =>
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET).');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('PayPal token error:', data);
    throw new Error(data.error_description || 'Failed to authenticate with PayPal.');
  }

  return data.access_token;
}

export async function createPayPalOrder({
  amount,
  currency = 'ZAR',
  description,
  customId,
  returnUrl,
  cancelUrl,
  payerEmail,
}) {
  const accessToken = await getPayPalAccessToken();

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: parseFloat(amount).toFixed(2),
        },
        description: (description || 'Alpha Women Elevates').slice(0, 127),
        custom_id: customId ? String(customId).slice(0, 127) : undefined,
      },
    ],
    application_context: {
      brand_name: 'Alpha Women Elevates',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  if (payerEmail) {
    payload.payer = { email_address: payerEmail };
  }

  const response = await fetch(`${getBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('PayPal create order error:', data);
    throw new Error(data.message || 'Failed to create PayPal order.');
  }

  const approveLink = (data.links || []).find((l) => l.rel === 'approve');
  return {
    orderId: data.id,
    approveUrl: approveLink?.href,
    raw: data,
  };
}

export async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('PayPal capture error:', data);
    throw new Error(data.message || 'Failed to capture PayPal payment.');
  }

  return data;
}

export async function getPayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getBaseUrl()}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch PayPal order.');
  }

  return data;
}
