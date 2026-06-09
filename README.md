# GoalKing Draft 2026

Play Mzansi World Cup draft prediction site.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5174`.

## Deployment

Pushes to `main` deploy automatically to GitHub Pages.

**Custom domain:** `https://playmzansi.online`

Hosting stays on **GitHub Pages**. **Cloudflare** sits in front for DNS, DDoS protection, HTTPS, and security controls.

### 1) Add domain to Cloudflare

1. Sign up / log in at [cloudflare.com](https://dash.cloudflare.com)
2. **Add a site** → enter `playmzansi.online` → Free plan
3. Cloudflare scans existing DNS (you can skip/import)
4. Copy the two **nameservers** Cloudflare gives you (e.g. `ada.ns.cloudflare.com`, `bob.ns.cloudflare.com`)

### 2) Point Namecheap to Cloudflare

1. Namecheap → **Domain List** → `playmzansi.online` → **Manage**
2. **Nameservers** → **Custom DNS**
3. Paste Cloudflare’s nameservers → save  
   *(DNS is now managed in Cloudflare, not Namecheap Advanced DNS.)*

### 3) Cloudflare DNS records

In Cloudflare → **DNS** → **Records**, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `alxcreativeeconomy.github.io` | Proxied (orange cloud) |
| CNAME | `www` | `alxcreativeeconomy.github.io` | Proxied (orange cloud) |

GitHub also accepts A records if CNAME on apex causes issues — use all four GitHub IPs with **DNS only** (grey cloud) for `@` only:

`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

### 4) Cloudflare SSL & security (recommended)

**SSL/TLS → Overview:** set to **Full** (not Full Strict until GitHub has issued the cert)

**SSL/TLS → Edge Certificates:**

- **Always Use HTTPS:** On
- **Automatic HTTPS Rewrites:** On

**Security:**

- **Security Level:** Medium or High
- **Bots → Bot Fight Mode:** On (free tier)

### 5) GitHub Pages

Repo → **Settings → Pages**:

- **Custom domain:** `playmzansi.online`
- Enable **Enforce HTTPS** once DNS is active (can take up to 24h)

`public/CNAME` in this repo is already set to `playmzansi.online`.

### 6) Firebase Auth authorized domains

Firebase Console → **goalking-2026** → **Authentication** → **Settings** → **Authorized domains**:

- `playmzansi.online`
- `www.playmzansi.online`

### Why Cloudflare + GitHub Pages?

| Layer | Role |
|-------|------|
| Cloudflare | DNS, DDoS shield, WAF/bot filtering, edge HTTPS |
| GitHub Pages | Hosts the static site build |
| Firebase | Auth + Firestore (API key restricted by domain in Google Cloud) |

After propagation, the site should load at **https://playmzansi.online**.

### 7) Email for user support (free via Cloudflare)

Keep your **5 web records** as they are. Email uses **separate MX/TXT records** — they do not conflict.

1. Cloudflare → **Email** → **Email Routing** → **Get started**
2. **Destination address:** your real inbox (e.g. your Gmail) — verify the code Cloudflare emails you
3. **Custom address:** create `support@playmzansi.online` → forward to that inbox
4. Cloudflare will auto-add MX + SPF (and DKIM) DNS records — approve them when prompted
5. Send a test email to `support@playmzansi.online` and confirm it arrives

Public contact on the site: **support@playmzansi.online**

Optional extra addresses: `hello@`, `help@` → same inbox.

## PayFast token packs (South Africa)

Coin packs use **PayFast** (ZAR) via Firebase Cloud Functions. PayFast supports South African cards, debit cards, EFT, and other local methods. Tokens are credited after PayFast sends a confirmed **ITN** (Instant Transaction Notification).

### 1) PayFast account

1. Register at [payfast.io](https://www.payfast.co.za/) with your South African business or sole prop details
2. Complete merchant verification in the PayFast dashboard
3. For testing first, use **Sandbox**: [sandbox.payfast.co.za](https://sandbox.payfast.co.za/)
4. Copy from **Settings → Developer settings**:
   - **Merchant ID**
   - **Merchant Key**
   - **Security passphrase** (set one if empty)

**Sandbox test credentials** (PayFast public sandbox):

| Field | Value |
|-------|-------|
| Merchant ID | `10000100` |
| Merchant Key | `46f0cd694581a` |
| Passphrase | *(leave empty for sandbox unless you set one)* |

### 2) Firebase Blaze + Functions

Cloud Functions require the **Blaze** plan (pay-as-you-go).

```bash
cd functions
npm install
cd ..
firebase login
firebase use goalking-2026
firebase functions:config:set \
  payfast.merchant_id="10000100" \
  payfast.merchant_key="46f0cd694581a" \
  payfast.passphrase="" \
  payfast.sandbox="true"
firebase deploy --only functions,firestore:rules
```

For **live** payments, replace with your real PayFast credentials and set `payfast.sandbox="false"`.

### 3) PayFast ITN (notify URL)

PayFast Dashboard → **Settings → Developer settings → Instant Transaction Notification (ITN)**

Set the notify URL to:

```
https://us-central1-goalking-2026.cloudfunctions.net/payfastItn
```

Enable ITN. PayFast POSTs here when a payment completes; the function verifies the signature, confirms with PayFast, then credits tokens.

Also set in PayFast:

- **Return URL:** `https://playmzansi.online/?payment=success#tokens`
- **Cancel URL:** `https://playmzansi.online/?payment=cancelled#tokens`

(The app also sends per-checkout return/cancel URLs — these are fallbacks.)

### 4) Test a purchase

1. Deploy functions with sandbox credentials
2. Open **https://playmzansi.online** → log in → verify email
3. **Stake** section → **Buy R5 Pack**
4. Complete payment on PayFast sandbox (use sandbox test details from PayFast docs)
5. You return to the site; tokens appear after ITN runs

### Pack pricing (ZAR)

| Pack | Price | Tokens |
|------|-------|--------|
| Bronze | R5 | 5 |
| Silver | R25 | 25 |
| Gold | R60 | 60 |
| Platinum | R150 | 150 |

### Why PayFast instead of Stripe?

Stripe has limited support for many South African sole traders and small businesses. PayFast is built for ZAR and local payment methods, with lower onboarding friction for Mzansi merchants.