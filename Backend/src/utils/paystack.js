/**
 * Paystack API helpers
 * Env: PAYSTACK_SECRET_KEY, PAYSTACK_CURRENCY=ZAR
 */

const PAYSTACK_BASE = 'https://api.paystack.co';

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('Paystack is not configured (PAYSTACK_SECRET_KEY).');
  }
  return key;
}

/** Convert major units (e.g. R100.00) to Paystack smallest unit (cents). */
export function toPaystackAmount(amount) {
  return Math.round(parseFloat(amount) * 100);
}

/**
 * Initialize a Paystack transaction and return the hosted checkout URL.
 */
export async function initializePaystackTransaction({
  email,
  amount,
  reference,
  callbackUrl,
  metadata = {},
  currency,
}) {
  const payload = {
    email,
    amount: toPaystackAmount(amount),
    currency: currency || process.env.PAYSTACK_CURRENCY || 'ZAR',
    reference,
    callback_url: callbackUrl,
    metadata,
  };

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    console.error('Paystack initialize error:', data);
    throw new Error(data.message || 'Failed to initialize Paystack payment.');
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
    raw: data.data,
  };
}

/**
 * Verify a Paystack transaction by reference.
 */
export async function verifyPaystackTransaction(reference) {
  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
    }
  );

  const data = await response.json();
  if (!response.ok || !data.status) {
    console.error('Paystack verify error:', data);
    throw new Error(data.message || 'Failed to verify Paystack payment.');
  }

  return data.data;
}
