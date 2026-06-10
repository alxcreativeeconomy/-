const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getPack } = require("./packs");

const db = admin.firestore();

function getAdminEmails() {
  const config = functions.config().admin || {};
  const combined = [
    process.env.ADMIN_EMAILS || "",
    config.emails || "",
  ].join(",");

  return new Set(
    combined
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isAdminUser(context) {
  if (!context?.auth) return false;
  if (context.auth.token.admin === true) return true;
  const email = (context.auth.token.email || "").toLowerCase();
  return getAdminEmails().has(email);
}

function assertAdmin(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Log in with an admin account.");
  }
  if (!isAdminUser(context)) {
    throw new functions.https.HttpsError("permission-denied", "This account is not authorized for admin access.");
  }
}

function toIso(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

async function loadUserSummaries(uids) {
  const unique = [...new Set(uids.filter(Boolean))];
  const summaries = {};

  await Promise.all(unique.map(async (uid) => {
    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) {
      summaries[uid] = { uid, email: null, username: null };
      return;
    }
    const data = snap.data();
    summaries[uid] = {
      uid,
      email: data.email || null,
      username: data.username || null,
      tokens: data.tokens ?? 0,
    };
  }));

  return summaries;
}

function buildStats(rows) {
  const stats = {
    total: rows.length,
    ott: 0,
    onevoucher: 0,
    payfast: 0,
    sandbox: 0,
    totalZar: 0,
    totalTokens: 0,
  };

  rows.forEach((row) => {
    if (row.provider === "ott") stats.ott += 1;
    if (row.provider === "onevoucher") stats.onevoucher += 1;
    if (row.provider === "payfast") stats.payfast += 1;
    if (row.sandbox) stats.sandbox += 1;
    stats.totalZar += Number.parseFloat(row.amount || 0) || 0;
    stats.totalTokens += Number.parseInt(row.tokens || 0, 10) || 0;
  });

  stats.totalZar = Number(stats.totalZar.toFixed(2));
  return stats;
}

async function fetchPayments({ provider = "all", limit = 50 }) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 200);
  let query = db.collection("payments").orderBy("createdAt", "desc").limit(safeLimit);

  if (provider === "ott" || provider === "onevoucher" || provider === "payfast") {
    query = db.collection("payments")
      .where("provider", "==", provider)
      .orderBy("createdAt", "desc")
      .limit(safeLimit);
  }

  const snap = await query.get();
  const rows = snap.docs.map((doc) => {
    const data = doc.data();
    const pack = getPack(data.packId);
    return {
      id: doc.id,
      uid: data.uid || null,
      provider: data.provider || "unknown",
      packId: data.packId || null,
      packName: pack?.name || data.packId || "Unknown pack",
      tokens: data.tokens || 0,
      amount: data.amount || pack?.amount || "0.00",
      currency: data.currency || "zar",
      status: data.status || "unknown",
      sandbox: Boolean(data.raw?.sandbox),
      transactionId: data.raw?.transactionId
        || data.raw?.pf_payment_id
        || data.raw?.m_payment_id
        || null,
      pinHashPrefix: data.raw?.pinHash ? String(data.raw.pinHash).slice(0, 12) : null,
      createdAt: toIso(data.createdAt),
    };
  });

  const users = await loadUserSummaries(rows.map((row) => row.uid));
  const enriched = rows.map((row) => ({
    ...row,
    user: users[row.uid] || { uid: row.uid, email: null, username: null },
  }));

  return {
    rows: enriched,
    stats: buildStats(enriched),
  };
}

async function fetchRedeemedVouchers({ provider = "all", limit = 50 }) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 200);
  let query = db.collection("redeemed_vouchers").orderBy("createdAt", "desc").limit(safeLimit);

  if (provider === "ott" || provider === "onevoucher") {
    query = db.collection("redeemed_vouchers")
      .where("provider", "==", provider)
      .orderBy("createdAt", "desc")
      .limit(safeLimit);
  }

  const snap = await query.get();
  const rows = await Promise.all(snap.docs.map(async (doc) => {
    const data = doc.data();
    const pack = getPack(data.packId);
    let payment = null;

    if (data.paymentId) {
      const paymentSnap = await db.collection("payments").doc(data.paymentId).get();
      if (paymentSnap.exists) {
        const paymentData = paymentSnap.data();
        payment = {
          amount: paymentData.amount || pack?.amount || "0.00",
          tokens: paymentData.tokens || pack?.tokens || 0,
          status: paymentData.status || "completed",
          sandbox: Boolean(paymentData.raw?.sandbox),
          transactionId: paymentData.raw?.transactionId || null,
        };
      }
    }

    return {
      id: doc.id,
      uid: data.uid || null,
      provider: data.provider || "unknown",
      packId: data.packId || null,
      packName: pack?.name || data.packId || "Unknown pack",
      paymentId: data.paymentId || null,
      pinHashPrefix: data.pinHash ? String(data.pinHash).slice(0, 12) : null,
      amount: payment?.amount || pack?.amount || "0.00",
      tokens: payment?.tokens || pack?.tokens || 0,
      status: payment?.status || "redeemed",
      sandbox: Boolean(payment?.sandbox),
      transactionId: payment?.transactionId || null,
      createdAt: toIso(data.createdAt),
    };
  }));

  const users = await loadUserSummaries(rows.map((row) => row.uid));
  const enriched = rows.map((row) => ({
    ...row,
    user: users[row.uid] || { uid: row.uid, email: null, username: null },
  }));

  return {
    rows: enriched,
    stats: buildStats(enriched),
  };
}

async function fetchTestRedemptions({ provider = "all", limit = 50 }) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 200);
  let query = db.collection("test_redemptions").orderBy("createdAt", "desc").limit(safeLimit);

  if (provider === "ott" || provider === "onevoucher") {
    query = db.collection("test_redemptions")
      .where("provider", "==", provider)
      .orderBy("createdAt", "desc")
      .limit(safeLimit);
  }

  const snap = await query.get();
  const rows = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      uid: data.uid || null,
      provider: data.provider || "unknown",
      packId: data.packId || null,
      packName: data.packName || data.packId || "Unknown pack",
      tokens: data.tokens || 0,
      amount: data.amount || "0.00",
      status: "test",
      sandbox: true,
      experimental: true,
      pinEntered: data.pinEntered || "—",
      pinLength: data.pinLength ?? null,
      newBalance: data.newBalance ?? null,
      playerShort: data.playerShort || null,
      playerName: data.playerName || null,
      transactionId: null,
      pinHashPrefix: null,
      createdAt: toIso(data.createdAt),
      user: {
        uid: data.uid || null,
        email: data.email || null,
        username: data.username || null,
      },
    };
  });

  const stats = buildStats(rows);
  stats.experimental = rows.length;

  return { rows, stats };
}

async function getDashboardData({ provider = "all", limit = 50, view = "vouchers" }) {
  if (view === "payments") {
    return fetchPayments({ provider, limit });
  }
  if (view === "test") {
    return fetchTestRedemptions({
      provider: provider === "payfast" ? "all" : provider,
      limit,
    });
  }
  return fetchRedeemedVouchers({
    provider: provider === "payfast" ? "all" : provider,
    limit,
  });
}

module.exports = {
  assertAdmin,
  isAdminUser,
  getDashboardData,
  getAdminEmails,
};