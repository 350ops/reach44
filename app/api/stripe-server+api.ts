import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
// This example sets up an endpoint using the Express framework.

export async function POST(req: Request) {
    try {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create({

    });
  const customerSession = await stripe.customerSessions.create({
    customer: customer.id,
    components: {
      mobile_payment_element: {
        enabled: true,
        features: {
          payment_method_save: 'enabled',
          payment_method_redisplay: 'enabled',
          payment_method_remove: 'enabled'
        }
      },
    },
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'qar',
    customer: customer.id,
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter
    // is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return Response.json({
    paymentIntent: paymentIntent.client_secret,
    customerSessionClientSecret: customerSession.client_secret,
    customer: customer.id,
    publishableKey: 'pk_live_51QiAABDO4BRJvLH7ctaJuK2Hg3srajjDZhxijucRuHhA2RRjguQ1QxB5TL0XfnPINWX8hKtRpY5pZcZErgyI77As00NF3ZMijQ'
  });
} catch (error) {
  return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
}
}