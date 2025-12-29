import "dotenv/config";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return new Response(
        JSON.stringify({
          error:
            "Missing STRIPE_SECRET_KEY. If you're relying on a .env file, restart Expo after creating/updating it (try `npx expo start -c`).",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(secretKey);

    // 1️⃣ 创建一个新的 Customer
    const customer = await stripe.customers.create({
      // 如果你使用 Connect，可在这里加上 connected account:
      // stripeAccount: '{{CONNECTED_ACCOUNT_ID}}'
    });

    // 2️⃣ 创建一个 Customer Session
    const customerSession = await stripe.customerSessions.create({
      customer: customer.id,
      components: {
        mobile_payment_element: {
          enabled: true,
          features: {
            payment_method_save: "enabled",
            payment_method_redisplay: "enabled",
            payment_method_remove: "enabled",
          },
        },
      },
    });

    // 3️⃣ 创建一个 PaymentIntent（即支付请求）
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099, // 以最小货币单位表示 (€10.99)
      currency: "eur",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 4️⃣ 返回给前端所需信息
    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        customerSessionClientSecret: customerSession.client_secret,
        customer: customer.id,
        publishableKey:
          process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
          process.env.STRIPE_PUBLISHABLE_KEY,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Stripe error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
