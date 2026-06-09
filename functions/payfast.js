const crypto = require("crypto");
const https = require("https");
const querystring = require("querystring");

const SANDBOX_PROCESS_URL = "https://sandbox.payfast.co.za/eng/process";
const LIVE_PROCESS_URL = "https://www.payfast.co.za/eng/process";
const SANDBOX_VALIDATE_HOST = "sandbox.payfast.co.za";
const LIVE_VALIDATE_HOST = "www.payfast.co.za";

function encodePayfastValue(value) {
  return encodeURIComponent(String(value).trim()).replace(/%20/g, "+");
}

function generateSignature(params, passphrase) {
  const orderedKeys = Object.keys(params)
    .filter((key) => key !== "signature" && params[key] !== "" && params[key] != null)
    .sort();

  const query = orderedKeys
    .map((key) => `${key}=${encodePayfastValue(params[key])}`)
    .join("&");

  const stringToHash = passphrase
    ? `${query}&passphrase=${encodePayfastValue(passphrase)}`
    : query;

  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

function getProcessUrl(sandbox) {
  return sandbox ? SANDBOX_PROCESS_URL : LIVE_PROCESS_URL;
}

function buildPaymentFields({
  merchantId,
  merchantKey,
  passphrase,
  pack,
  packId,
  uid,
  email,
  origin,
  notifyUrl,
  paymentId,
}) {
  const fields = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${origin}/?payment=success&pack=${packId}&provider=payfast#tokens`,
    cancel_url: `${origin}/?payment=cancelled#tokens`,
    notify_url: notifyUrl,
    email_address: email || undefined,
    m_payment_id: paymentId,
    amount: pack.amount,
    item_name: pack.name,
    item_description: `${pack.tokens} GoalKing validation tokens`,
    custom_str1: uid,
    custom_str2: packId,
    custom_str3: String(pack.tokens),
  };

  Object.keys(fields).forEach((key) => {
    if (fields[key] === undefined || fields[key] === "") {
      delete fields[key];
    }
  });

  fields.signature = generateSignature(fields, passphrase);
  return fields;
}

function validateItnSignature(payload, passphrase) {
  const received = payload.signature;
  if (!received) return false;
  const expected = generateSignature(payload, passphrase);
  return expected === received;
}

function confirmItnWithPayfast(payload, sandbox) {
  return new Promise((resolve, reject) => {
    const body = querystring.stringify(payload);
    const host = sandbox ? SANDBOX_VALIDATE_HOST : LIVE_VALIDATE_HOST;

    const request = https.request(
      {
        hostname: host,
        path: "/eng/query/validate",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          resolve(data.trim() === "VALID");
        });
      }
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

module.exports = {
  buildPaymentFields,
  confirmItnWithPayfast,
  generateSignature,
  getProcessUrl,
  validateItnSignature,
};