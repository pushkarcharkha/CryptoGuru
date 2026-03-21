const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const Stripe = require('stripe');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PAYMENTS_PORT || 8787;

const prices = {
  free: { monthly: 0, yearly: 0, title: 'FREE' },
  pro: { monthly: 999, yearly: 799, title: 'PRO' },
  'pro-plus': { monthly: 1999, yearly: 1599, title: 'PRO+' },
};

const getAmount = (plan, billing) => {
  const entry = prices[plan];
  if (!entry) return null;
  return billing === 'yearly' ? entry.yearly : entry.monthly;
};

app.get('/api/payments/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/payments/create-razorpay-order', async (req, res) => {
  try {
    const { plan, billing } = req.body || {};
    const amount = getAmount(plan, billing);
    if (amount === null) return res.status(400).json({ error: 'Invalid plan' });
    if (amount <= 0) return res.status(400).json({ error: 'Selected plan does not require payment' });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay keys missing in server env' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `cg-${plan}-${Date.now()}`,
      notes: { plan, billing },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
});

app.post('/api/payments/verify-razorpay-signature', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, error: 'Missing verification fields' });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(payload)
      .digest('hex');

    const verified = expected === razorpay_signature;
    if (!verified) return res.status(400).json({ verified: false, error: 'Invalid signature' });
    res.json({ verified: true });
  } catch (err) {
    res.status(500).json({ verified: false, error: err.message || 'Verification failed' });
  }
});

app.post('/api/payments/create-stripe-session', async (req, res) => {
  try {
    const { plan, billing } = req.body || {};
    const amount = getAmount(plan, billing);
    if (amount === null) return res.status(400).json({ error: 'Invalid plan' });
    if (amount <= 0) return res.status(400).json({ error: 'Selected plan does not require payment' });
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe secret key missing in server env' });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${prices[plan].title} (${billing})`,
              description: 'CryptoGuru.ai subscription payment',
            },
            unit_amount: amount * 100,
          },
        },
      ],
      success_url: `${process.env.APP_BASE_URL || 'http://localhost:5173'}/app?payment=success&plan=${plan}`,
      cancel_url: `${process.env.APP_BASE_URL || 'http://localhost:5173'}/payment/${plan}?billing=${billing}&payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create Stripe session' });
  }
});

app.listen(PORT, () => {
  console.log(`Payments server running on http://localhost:${PORT}`);
});
