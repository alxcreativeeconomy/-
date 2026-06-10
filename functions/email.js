const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

function getEmailConfig() {
  const config = functions.config().email || {};
  return {
    from: process.env.EMAIL_FROM || config.from || "GoalKing <support@playmzansi.online>",
    smtpHost: process.env.EMAIL_SMTP_HOST || config.smtp_host || "",
    smtpPort: Number(process.env.EMAIL_SMTP_PORT || config.smtp_port || 587),
    smtpUser: process.env.EMAIL_SMTP_USER || config.smtp_user || "",
    smtpPass: process.env.EMAIL_SMTP_PASS || config.smtp_pass || "",
    resendApiKey: process.env.RESEND_API_KEY || config.resend_api_key || "",
  };
}

function buildCoinEmailHtml({
  username,
  packName,
  tokens,
  newBalance,
  provider,
  amount,
}) {
  const providerLabel = provider === "ott" ? "OTT Voucher" : "1Voucher";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoalKing Coin Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:Arial,Helvetica,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#041326;border:1px solid rgba(244,197,66,0.25);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 12px;text-align:center;background:linear-gradient(180deg,#09152b,#041326);">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#f4c542;font-weight:700;">GoalKing 2026</p>
              <h1 style="margin:0;font-size:34px;line-height:1.1;color:#ffffff;font-weight:800;">Congratulations on your entry!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;text-align:center;">
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#cbd5e1;">
                Hi <strong style="color:#ffffff;">${username}</strong>, your ${providerLabel} redemption was successful and your validation coins are now in your GoalKing balance.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#050c18;border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;font-size:13px;color:#9ca3af;">Pack purchased</td>
                  <td style="padding:16px 18px;font-size:13px;color:#ffffff;text-align:right;font-weight:700;">${packName}</td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;font-size:13px;color:#9ca3af;border-top:1px solid rgba(255,255,255,0.06);">Amount paid</td>
                  <td style="padding:16px 18px;font-size:13px;color:#f4c542;text-align:right;font-weight:700;border-top:1px solid rgba(255,255,255,0.06);">R${amount}</td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;font-size:13px;color:#9ca3af;border-top:1px solid rgba(255,255,255,0.06);">Coins added</td>
                  <td style="padding:16px 18px;font-size:13px;color:#f4c542;text-align:right;font-weight:700;border-top:1px solid rgba(255,255,255,0.06);">+${tokens} tokens</td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;font-size:13px;color:#9ca3af;border-top:1px solid rgba(255,255,255,0.06);">New balance</td>
                  <td style="padding:16px 18px;font-size:16px;color:#ffffff;text-align:right;font-weight:800;border-top:1px solid rgba(255,255,255,0.06);">${newBalance} tokens</td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#9ca3af;">
                You can now use your coins to verify prediction entries on kickoff. Good luck in the draft room!
              </p>
              <a href="https://playmzansi.online/#tokens" style="display:inline-block;margin-top:22px;padding:14px 24px;background:linear-gradient(90deg,#f4c542,#c8991e);color:#030712;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;border-radius:8px;">
                View my balance
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:11px;line-height:1.5;color:#6b7280;">
                Questions? Contact <a href="mailto:support@playmzansi.online" style="color:#f4c542;">support@playmzansi.online</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendViaResend(config, { to, subject, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API failed (${response.status}): ${body}`);
  }

  return true;
}

async function sendViaSmtp(config, { to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject,
    html,
    text: subject,
  });

  return true;
}

async function sendCoinConfirmationEmail({
  to,
  username,
  packName,
  tokens,
  newBalance,
  provider,
  amount,
}) {
  if (!to) {
    console.warn("Coin confirmation email skipped: no recipient address.");
    return false;
  }

  const config = getEmailConfig();
  const subject = `GoalKing: +${tokens} validation coins added to your account`;
  const html = buildCoinEmailHtml({
    username,
    packName,
    tokens,
    newBalance,
    provider,
    amount,
  });

  if (config.resendApiKey) {
    await sendViaResend(config, { to, subject, html });
    return true;
  }

  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    await sendViaSmtp(config, { to, subject, html });
    return true;
  }

  console.warn("Coin confirmation email skipped: configure email.smtp_* or email.resend_api_key.");
  return false;
}

module.exports = {
  sendCoinConfirmationEmail,
  buildCoinEmailHtml,
};