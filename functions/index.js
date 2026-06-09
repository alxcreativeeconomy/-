const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

const db = admin.firestore();

const PACKS = {
  bronze: { name: "Bronze Coin Pack", tokens: 5, amount: 500, currency: "zar" },
  silver: { name: "Silver Coin Pack", tokens: 25, amount: 2500, currency: "zar" },
  gold: { name: "Gold Coin Pack", tokens: 60, amount: 6000, currency: "zar" },
  platinum: { name: "Platinum Coin Pack", tokens: 150, amount: 15000, currency: "zar" },
};

const DEFAULT_ORIGIN = "https://playmzansi.online";
const ALLOWED_ORIGINS = new Set([
  DEFAULT_ORIGIN,
  "https://www.playmzansi.online",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
]);

function resolveCheckoutOrigin(origin) {
  if (typeof origin === "string") {
    const normalized = origin.replace(/\/$/, "");
    if (ALLOWED_ORIGINS.has(normalized)) {
      return normalized;
    }
  }
  return DEFAULT_ORIGIN;
}

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key;
  if (!secretKey) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Stripe secret key is not configured on the server."
    );
  }
  return new Stripe(secretKey);
}

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe?.webhook_secret;
}

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to purchase tokens.");
  }

  const packId = data?.packId;
  const pack = PACKS[packId];
  if (!pack) {
    throw new functions.https.HttpsError("invalid-argument", "Unknown token pack.");
  }

  const origin = resolveCheckoutOrigin(data?.origin);

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: pack.currency,
          unit_amount: pack.amount,
          product_data: {
            name: pack.name,
            description: `${pack.tokens} GoalKing validation tokens`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      uid: context.auth.uid,
      packId,
      tokens: String(pack.tokens),
    },
    success_url: `${origin}/?payment=success&pack=${packId}&session_id={CHECKOUT_SESSION_ID}#tokens`,
    cancel_url: `${origin}/?payment=cancelled#tokens`,
    customer_email: context.auth.token.email || undefined,
  });

  return { url: session.url };
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    console.error("Stripe webhook secret is not configured.");
    return res.status(500).send("Webhook secret not configured.");
  }

  const stripe = getStripe();
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata?.uid;
    const packId = session.metadata?.packId;
    const tokens = Number.parseInt(session.metadata?.tokens || "0", 10);

    if (!uid || !tokens) {
      console.error("Missing checkout metadata", session.id);
      return res.json({ received: true });
    }

    const paymentRef = db.collection("payments").doc(session.id);
    const existingPayment = await paymentRef.get();
    if (existingPayment.exists) {
      return res.json({ received: true });
    }

    const userRef = db.collection("users").doc(uid);
    await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const currentTokens = userSnap.exists ? (userSnap.data().tokens || 0) : 0;
      transaction.set(
        userRef,
        { tokens: currentTokens + tokens },
        { merge: true }
      );
      transaction.set(paymentRef, {
        uid,
        packId: packId || null,
        tokens,
        amount: session.amount_total,
        currency: session.currency,
        stripeSessionId: session.id,
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
  }

  return res.json({ received: true });
});