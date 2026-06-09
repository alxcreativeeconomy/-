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

## Stripe token packs

Coin packs use **Stripe Checkout** (ZAR) via Firebase Cloud Functions. Tokens are credited to the user profile after Stripe confirms payment.

### 1) Stripe account

1. Create an account at [stripe.com](https://dashboard.stripe.com/register)
2. Stay in **Test mode** until you are ready to go live
3. Copy keys from **Developers → API keys**:
   - **Publishable key** → frontend
   - **Secret key** → Firebase Functions only

### 2) GitHub Secret (frontend)

Repo → **Settings → Secrets and variables → Actions** → add:

| Secret | Example |
|--------|---------|
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |

The deploy workflow injects this into `public/stripe-config.js` at build time.

### 3) Firebase Blaze + Functions

Cloud Functions require the **Blaze** plan (pay-as-you-go).

```bash
cd functions
npm install
cd ..
firebase login
firebase use goalking-2026
firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..."
firebase deploy --only functions,firestore:rules
```

### 4) Stripe webhook

Stripe Dashboard → **Developers → Webhooks → Add endpoint**

- **URL:** `https://us-central1-goalking-2026.cloudfunctions.net/stripeWebhook`
- **Event:** `checkout.session.completed`
- Copy the **Signing secret** (`whsec_...`) into Firebase config (step 3)

### 5) Local testing

```bash
cp public/stripe-config.example.js public/stripe-config.js
# Edit stripe-config.js with your pk_test_ key
npm run dev
```

Use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC.

### Pack pricing (ZAR)

| Pack | Price | Tokens |
|------|-------|--------|
| Bronze | R5 | 5 |
| Silver | R25 | 25 |
| Gold | R60 | 60 |
| Platinum | R150 | 150 |

After payment, users return to `/?payment=success&pack=gold` and tokens appear once the webhook runs.