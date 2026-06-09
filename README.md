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

### DNS (Namecheap → Advanced DNS)

Add these records for `playmzansi.online`:

| Type | Host | Value |
|------|------|-------|
| A Record | `@` | `185.199.108.153` |
| A Record | `@` | `185.199.109.153` |
| A Record | `@` | `185.199.110.153` |
| A Record | `@` | `185.199.111.153` |
| CNAME Record | `www` | `alxcreativeeconomy.github.io.` |

Then in GitHub: **Settings → Pages → Custom domain** → enter `playmzansi.online` and enable **Enforce HTTPS**.

Also add these to Firebase **Authentication → Authorized domains**:

- `playmzansi.online`
- `www.playmzansi.online`