const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {
  buildPaymentFields,
  confirmItnWithPayfast,
  getProcessUrl,
  validateItnSignature,
} = require("./payfast");

admin.initializeApp();

const db = admin.firestore();

const PACKS = {
  bronze: { name: "Bronze Coin Pack", tokens: 5, amount: "5.00" },
  silver: { name: "Silver Coin Pack", tokens: 25, amount: "25.00" },
  gold: { name: "Gold Coin Pack", tokens: 60, amount: "60.00" },
  platinum: { name: "Platinum Coin Pack", tokens: 150, amount: "150.00" },
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

function getPayfastConfig() {
  const config = functions.config().payfast || {};
  const merchantId = process.env.PAYFAST_MERCHANT_ID || config.merchant_id;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || config.merchant_key;
  const passphrase = process.env.PAYFAST_PASSPHRASE || config.passphrase || "";
  const sandbox = (process.env.PAYFAST_SANDBOX || config.sandbox || "true") === "true";

  if (!merchantId || !merchantKey) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "PayFast merchant credentials are not configured on the server."
    );
  }

  return { merchantId, merchantKey, passphrase, sandbox };
}

function getNotifyUrl(sandbox) {
  const configured = process.env.PAYFAST_NOTIFY_URL || functions.config().payfast?.notify_url;
  if (configured) return configured;
  const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "goalking-2026";
  const region = "us-central1";
  return `https://${region}-${projectId}.cloudfunctions.net/payfastItn`;
}

async function creditTokens({
  paymentId,
  uid,
  packId,
  tokens,
  amount,
  provider,
  raw,
}) {
  const paymentRef = db.collection("payments").doc(paymentId);
  const existingPayment = await paymentRef.get();
  if (existingPayment.exists) {
    return false;
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
      amount,
      currency: "zar",
      provider,
      status: "completed",
      raw: raw || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return true;
}

exports.createPayFastPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to purchase tokens.");
  }

  const packId = data?.packId;
  const pack = PACKS[packId];
  if (!pack) {
    throw new functions.https.HttpsError("invalid-argument", "Unknown token pack.");
  }

  const { merchantId, merchantKey, passphrase, sandbox } = getPayfastConfig();
  const origin = resolveCheckoutOrigin(data?.origin);
  const paymentId = `${context.auth.uid}_${packId}_${Date.now()}`;
  const notifyUrl = getNotifyUrl(sandbox);

  const fields = buildPaymentFields({
    merchantId,
    merchantKey,
    passphrase,
    pack,
    packId,
    uid: context.auth.uid,
    email: context.auth.token.email || undefined,
    origin,
    notifyUrl,
    paymentId,
  });

  return {
    action: getProcessUrl(sandbox),
    fields,
    provider: "payfast",
  };
});

exports.payfastItn = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let config;
  try {
    config = getPayfastConfig();
  } catch (error) {
    console.error("PayFast config missing:", error.message);
    return res.status(500).send("PayFast not configured");
  }

  const payload = { ...req.body };
  if (!validateItnSignature(payload, config.passphrase)) {
    console.error("PayFast ITN signature invalid", payload.m_payment_id);
    return res.status(400).send("Invalid signature");
  }

  let confirmed = false;
  try {
    confirmed = await confirmItnWithPayfast(payload, config.sandbox);
  } catch (error) {
    console.error("PayFast ITN validation request failed:", error.message);
    return res.status(500).send("Validation failed");
  }

  if (!confirmed) {
    console.error("PayFast ITN not confirmed by PayFast", payload.m_payment_id);
    return res.status(400).send("Not confirmed");
  }

  if (payload.payment_status !== "COMPLETE") {
    return res.status(200).send("OK");
  }

  const uid = payload.custom_str1;
  const packId = payload.custom_str2;
  const tokens = Number.parseInt(payload.custom_str3 || "0", 10);
  const pack = PACKS[packId];
  const paymentId = payload.pf_payment_id || payload.m_payment_id;

  if (!uid || !tokens || !paymentId) {
    console.error("PayFast ITN missing metadata", paymentId);
    return res.status(200).send("OK");
  }

  if (pack && payload.amount_gross && Number.parseFloat(payload.amount_gross) < Number.parseFloat(pack.amount)) {
    console.error("PayFast ITN amount mismatch", paymentId, payload.amount_gross, pack.amount);
    return res.status(400).send("Amount mismatch");
  }

  try {
    await creditTokens({
      paymentId: `payfast_${paymentId}`,
      uid,
      packId,
      tokens,
      amount: payload.amount_gross || pack?.amount || null,
      provider: "payfast",
      raw: {
        m_payment_id: payload.m_payment_id,
        pf_payment_id: payload.pf_payment_id,
        payment_status: payload.payment_status,
      },
    });
  } catch (error) {
    console.error("Failed to credit tokens from PayFast ITN:", error);
    return res.status(500).send("Credit failed");
  }

  return res.status(200).send("OK");
});