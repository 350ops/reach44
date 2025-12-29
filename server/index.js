require('dotenv').config?.();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
const port = process.env.PORT || 3000;

// CORS (open; restrict if needed)
app.use(cors());
// Use JSON for standard routes
app.use(express.json());

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe routes will fail until configured.');
}
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// Helpers
const PRICE_POINTS = [
  [0, 0],
  [100, 25],
  [500, 80],
  [1000, 120],
  [3000, 300],
  [5000, 450],
  [10_000, 900],
];
const MAX_FOLLOWERS = 10_000;
const MIN_PRICE_QAR = 1;

function getPriceFromFollowers(followers) {
  if (followers <= 0) return 0;
  if (followers >= MAX_FOLLOWERS) return PRICE_POINTS[PRICE_POINTS.length - 1][1];
  for (let i = 0; i < PRICE_POINTS.length - 1; i++) {
    const [f1, p1] = PRICE_POINTS[i];
    const [f2, p2] = PRICE_POINTS[i + 1];
    if (followers >= f1 && followers <= f2) {
      const t = (followers - f1) / (f2 - f1);
      const price = Math.round(p1 + t * (p2 - p1));
      return Math.max(price, MIN_PRICE_QAR);
    }
  }
  return PRICE_POINTS[PRICE_POINTS.length - 1][1];
}

// Routes
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) throw new Error('Stripe not configured');
    const { followers, targetLink, platforms } = req.body || {};
    const selectedPlatform = (platforms || 'instagram').toLowerCase();
    if (!followers || typeof followers !== 'number') {
      return res.status(400).json({ error: 'followers is required' });
    }
    const basePrice = getPriceFromFollowers(followers);
    const multiplier = selectedPlatform.includes('tiktok') ? 0.5 : 1.0;
    const priceQar = Math.round(basePrice * multiplier);
    if (priceQar <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }
    const amountMinor = priceQar * 100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountMinor,
      currency: 'qar',
      automatic_payment_methods: { enabled: true },
      metadata: {
        followers: String(followers),
        priceQar: String(priceQar),
        targetLink: targetLink || '',
        platforms: selectedPlatform,
      },
    });
    return res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amountMinor,
      currency: 'qar',
    });
  } catch (error) {
    console.error('[API:create-payment-intent] Error', error);
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

app.post('/api/subscription-payment-intent', async (req, res) => {
  try {
    if (!stripe) throw new Error('Stripe not configured');
    const PRICE_QAR_CENTS = { Monthly: 2900, Annual: 29900 };
    const plan = (req.body?.plan || 'Monthly');
    const amount = PRICE_QAR_CENTS[plan] ?? PRICE_QAR_CENTS.Monthly;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'qar',
      automatic_payment_methods: { enabled: true },
      metadata: {
        product: 'luna_plus',
        plan,
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency: 'qar',
      plan,
    });
  } catch (error) {
    console.error('[API:subscription-payment-intent] Error', error);
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// Stripe webhook (optional). If you don't need it on Railway, comment out.
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !stripe) {
    return res.status(400).send('Webhook not configured');
  }
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log('[Webhook] Event received:', event.type);
  res.json({ received: true });
});

app.get('/health', (_, res) => res.send('ok'));

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

