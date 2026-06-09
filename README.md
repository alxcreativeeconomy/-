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

**Custom domain:** `playmzansi.qd.je`

### DNS (at your qd.je registrar)

| Type  | Name        | Value                      |
|-------|-------------|----------------------------|
| CNAME | playmzansi  | alxcreativeeconomy.github.io |

Then in GitHub: **Settings → Pages → Custom domain** → enter `playmzansi.qd.je`.

Also add `playmzansi.qd.je` to Firebase **Authentication → Authorized domains**.