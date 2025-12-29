import Stripe from "stripe";

const PRICE_EUR_CENTS = {
  Monthly: 699,
  Annual: 3999,
} as const;

type Plan = keyof typeof PRICE_EUR_CENTS;

export async function POST(request: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return Response.json(
        {
          error:
            "Missing STRIPE_SECRET_KEY. Set it in your environment (or .env) and restart the dev server.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);

    const body = await request.json().catch(() => ({}));
    const plan = (body?.plan ?? "Monthly") as Plan;
    const amount = PRICE_EUR_CENTS[plan] ?? PRICE_EUR_CENTS.Monthly;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        product: "luna_plus",
        plan,
      },
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency: "eur",
      plan,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


