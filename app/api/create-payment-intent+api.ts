import Stripe from "stripe";

// Price points for interpolation (followers -> QAR)
const PRICE_POINTS: [number, number][] = [
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

function getPriceFromFollowers(followers: number): number {
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

export async function POST(request: Request) {
    console.log("[API] Received create-payment-intent request");
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
        const body = await request.json();
        console.log("[API] Body:", body);
        const { followers, targetLink, platforms } = body;

        const selectedPlatform = platforms?.toLowerCase() || "instagram";

        if (!followers || typeof followers !== "number") {
            return Response.json({ error: "followers is required" }, { status: 400 });
        }

        const basePrice = getPriceFromFollowers(followers);
        const multiplier = selectedPlatform.includes("tiktok") ? 0.5 : 1.0;
        const priceQar = Math.round(basePrice * multiplier);

        if (priceQar <= 0) {
            return Response.json({ error: "Invalid price" }, { status: 400 });
        }

        const amountMinor = priceQar * 100;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountMinor,
            currency: "qar",
            automatic_payment_methods: { enabled: true },
            metadata: {
                followers: String(followers),
                priceQar: String(priceQar),
                targetLink: targetLink || "",
                platforms: selectedPlatform,
            },
        });

        return new Response(JSON.stringify({
            clientSecret: paymentIntent.client_secret,
            amount: amountMinor,
            currency: "qar",
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Create Payment Intent error:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

