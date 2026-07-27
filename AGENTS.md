# AGENTS.md — BitGora Repository Instructions

## Product boundary

BitGora Market Lab is a non-custodial portfolio demonstration.

Never implement or imply:

- real accounts;
- real public listings;
- real chat;
- wallet connection;
- seed/private key input;
- payment;
- escrow;
- custody;
- public user uploads;
- financial advice.

A future live marketplace is a separate approved programme.

## Architecture

- Static documents are generated into `dist/`.
- Content source: `src/content/`.
- Pure state/rules: `src/lib/`.
- Read-only Function service: `src/server/`.
- HTML templates: `src/templates/`.
- Browser modules/assets: `src/static/`.
- Vercel entrypoints: `api/`.
- Release scripts: `scripts/`.
- Tests: `tests/`.

Keep zero external npm dependencies unless the owner explicitly approves a direct product need.

## Required commands

Before any commit:

```bash
npm ci --ignore-scripts
npm audit
npm run verify
git diff --check
```

Do not weaken tests, security checks or budgets to make a failure disappear.

## Budgets

```text
Complete dist: ≤ 1,500,000 bytes
Browser JavaScript: ≤ 120,000 bytes
CSS: ≤ 60,000 bytes
External npm dependencies: 0
```

## Content integrity

- Every listing and seller must remain explicitly fictional.
- Do not add real names, contact details, addresses, wallet addresses or payment proofs.
- Keep sold/available status explicit.
- Keep BTC as the listing denomination.
- Treat CAD as an optional indicative reference only.
- Keep public pages complete without JavaScript.

## State and privacy

Use only scoped storage keys.

- Seller draft expires after 24 hours.
- Watchlist stores listing IDs only.
- Messages are synthetic.
- Inquiry text stays in page memory unless copied.
- Do not use `localStorage.clear()`.
- Do not transmit local tool data.
- Do not add analytics or trackers.

## Server boundary

Allowed:

```text
GET /api/health
GET /api/btc-rate
```

The rate endpoint is read-only, validates upstream data, times out, degrades safely and returns no personal data.

Do not add mutation routes without a separately approved architecture and threat model.

## Security

Preserve:

- same-origin scripts/styles/images/connect;
- no inline event handlers;
- no `unsafe-inline` or `unsafe-eval`;
- HSTS;
- frame denial;
- no geolocation, camera, microphone or payment capability;
- no source archives or environment files in output.

Never commit a secret.

## Git and Vercel

Do not commit:

```text
node_modules/
dist/
.vercel/
.env*
ZIP files
browser profiles
temporary evidence
```

Preferred release:

```text
feature branch
→ GitHub Actions
→ Vercel Preview
→ browser/accessibility/PWA verification
→ normal PR merge
→ Git-connected Production from main
```

Do not force-push or bypass checks.

## Owner boundaries

Read `docs/owner-decisions.md` before proposing:

- live accounts;
- moderation;
- real messaging;
- identity verification;
- payment coordination;
- wallet features;
- escrow/custody;
- custom domain or commercial launch.
