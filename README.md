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