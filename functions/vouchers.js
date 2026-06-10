const crypto = require("crypto");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const SANDBOX_PINS = {
  ott: {
    "123456789012": "5.00",
    "123456789099": "25.00",
    "123456789188": "60.00",
    "123456789277": "150.00",
  },
  onevoucher: {
    "98765432109876": "5.00",
    "98765432109899": "25.00",
    "98765432109888": "60.00",
    "98765432109877": "150.00",
  },
};

function normalizePin(pin) {
  return String(pin || "").replace(/\s+/g, "").trim();
}

function hashPin(pin) {
  return crypto.createHash("sha256").update(normalizePin(pin)).digest("hex");
}

function getVoucherConfig(provider) {
  const root = require("firebase-functions").config().vouchers || {};
  const providerConfig = root[provider] || {};
  const sandbox = (process.env[`VOUCHERS_${provider.toUpperCase()}_SANDBOX`]
    || providerConfig.sandbox
    || root.sandbox
    || "true") === "true";

  return {
    sandbox,
    apiUrl: process.env[`VOUCHERS_${provider.toUpperCase()}_API_URL`] || providerConfig.api_url || "",
    apiKey: process.env[`VOUCHERS_${provider.toUpperCase()}_API_KEY`] || providerConfig.api_key || "",
    vendorId: process.env[`VOUCHERS_${provider.toUpperCase()}_VENDOR_ID`] || providerConfig.vendor_id || "",
    merchantId: process.env[`VOUCHERS_${provider.toUpperCase()}_MERCHANT_ID`] || providerConfig.merchant_id || "",
    username: process.env[`VOUCHERS_${provider.toUpperCase()}_USERNAME`] || providerConfig.username || "",
    password: process.env[`VOUCHERS_${provider.toUpperCase()}_PASSWORD`] || providerConfig.password || "",
  };
}

function requestJson(urlString, { method = "POST", headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const payload = body ? JSON.stringify(body) : null;
    const client = url.protocol === "https:" ? https : http;

    const req = client.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          let parsed = data;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch (_) {
            parsed = { raw: data };
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function validatePinFormat(provider, pin) {
  if (provider === "ott") {
    if (!/^\d{12}$/.test(pin)) {
      throw new Error("OTT voucher PIN must be 12 digits.");
    }
    return;
  }

  if (provider === "onevoucher") {
    if (!/^\d{14,16}$/.test(pin)) {
      throw new Error("1Voucher PIN must be 14 to 16 digits.");
    }
    return;
  }

  throw new Error("Unsupported voucher provider.");
}

function redeemSandbox(provider, pin, expectedAmount) {
  const table = SANDBOX_PINS[provider] || {};
  const voucherValue = table[pin];
  if (!voucherValue) {
    throw new Error("Invalid sandbox voucher PIN. Check README for test PINs.");
  }
  if (Number.parseFloat(voucherValue) < Number.parseFloat(expectedAmount)) {
    throw new Error(`Voucher value R${voucherValue} is less than pack price R${expectedAmount}.`);
  }
  return {
    provider,
    amount: expectedAmount,
    transactionId: `sandbox_${provider}_${Date.now()}`,
    sandbox: true,
  };
}

async function redeemViaApi(provider, pin, pack, reference, mobile, config) {
  if (!config.apiUrl) {
    throw new Error(`${provider === "ott" ? "OTT" : "1Voucher"} API is not configured on the server.`);
  }

  const headers = {};
  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
    headers["x-api-key"] = config.apiKey;
  }

  const body = provider === "ott"
    ? {
        vendor_id: config.vendorId,
        merchant_id: config.merchantId,
        pin,
        amount: pack.amount,
        reference,
        mobile: mobile || undefined,
      }
    : {
        merchant_id: config.merchantId,
        vendor_id: config.vendorId,
        voucher_pin: pin,
        amount: pack.amount,
        reference,
      };

  const response = await requestJson(config.apiUrl, { headers, body });
  const payload = response.data || {};
  const success = response.status >= 200
    && response.status < 300
    && (payload.success === true
      || payload.status === "success"
      || payload.status === "COMPLETE"
      || payload.code === "1000"
      || payload.code === 1000
      || payload.approved === true);

  if (!success) {
    const message = payload.message || payload.error || payload.description || "Voucher could not be redeemed.";
    throw new Error(message);
  }

  const redeemedAmount = payload.amount
    ? String(Number(payload.amount) > 100 ? Number(payload.amount) / 100 : payload.amount)
    : pack.amount;

  if (Number.parseFloat(redeemedAmount) < Number.parseFloat(pack.amount)) {
    throw new Error(`Voucher value R${redeemedAmount} is less than pack price R${pack.amount}.`);
  }

  return {
    provider,
    amount: pack.amount,
    transactionId: payload.transaction_id
      || payload.transactionId
      || payload.id
      || payload.payment_id
      || reference,
    sandbox: false,
    raw: payload,
  };
}

async function redeemVoucher({ provider, pin, pack, reference, mobile }) {
  const normalizedPin = normalizePin(pin);
  validatePinFormat(provider, normalizedPin);

  const config = getVoucherConfig(provider);
  if (config.sandbox) {
    return redeemSandbox(provider, normalizedPin, pack.amount);
  }

  return redeemViaApi(provider, normalizedPin, pack, reference, mobile, config);
}

module.exports = {
  hashPin,
  normalizePin,
  redeemVoucher,
  SANDBOX_PINS,
};