import Stripe from "stripe";
import { smmClient } from "../../lib/smm-panel";

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") as string;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (!webhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}`);
        return Response.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    console.log(`[Webhook] Processing Event: ${event.type}`);

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { targetLink, followers, platforms } = paymentIntent.metadata;

        if (targetLink && followers) {
            const quantity = parseInt(followers, 10);
            const platform = (platforms || "instagram").toLowerCase();

            // Determine Service ID
            let serviceId = 25; // Default Instagram
            if (platform.includes("tiktok")) serviceId = 9592;
            else if (platform.includes("facebook")) serviceId = 1882;

            // Fulfillment logic
            try {
                await smmClient.addOrder(serviceId, targetLink, quantity);
                console.log(`[Webhook] ✅ SMM Order Created Successfully for ${targetLink}`);
            } catch (error) {
                console.error("[Webhook] ❌ Failed to create SMM order:", error);
            }
        }
    }

    return Response.json({ received: true });
}
