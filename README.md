# BitGora Market Lab

BitGora Market Lab is a privacy-first, non-custodial portfolio demonstration inspired by the original BitGora Bitcoin marketplace concept.

It preserves the strongest product idea—goods priced in Bitcoin—without pretending that a prototype can safely operate accounts, public listings, chat, wallets, payments, escrow or custody.

## Product boundary

The public site contains:

- twelve fictional product listings;
- search, category, condition, status and BTC-price filters;
- complete listing-detail routes;
- an optional read-only BTC/CAD reference;
- verification-first safety guidance;
- browser-local watchlist;
- browser-local seller draft with 24-hour expiry and explicit JSON export;
- browser-local inquiry text;
- synthetic browser-local messages;
- light, dark and system themes;
- responsive navigation and command palette;
- PWA manifest, install support and offline shell;
- SEO/social metadata and security headers.

It does not contain:

```text
real users
real listings
real chat
wallet connection
payment processing
escrow
custody
database
uploads
analytics
advertising
```

## Architecture

```text
Vercel CDN
├── generated static pages and local assets
├── browser-local demo state
└── two thin Vercel Functions
    ├── /api/health
    └── /api/btc-rate
         └── read-only public BTC-CAD ticker
```

See [docs/architecture.md](docs/architecture.md).

## Routes

Public:

```text
/
 /market/
 /market/{12-fictional-listing-slugs}/
 /safety/
 /about/
 /privacy/
```

Local demo tools:

```text
/sell/
 /watchlist/
 /messages/
```

Local tools are `noindex,nofollow`.

## Requirements

- Node.js 24.x
- npm

No external package dependency or environment secret is required.

## Commands

```bash
npm ci --ignore-scripts
npm run dev
npm run lint
npm test
npm run build
npm run smoke
npm run verify
npm run check
```

`npm run verify` is the release gate.

It runs syntax/policy checks, tests, production build, route/asset/security validation, real HTTP smoke tests and deterministic two-build comparison.

## Local development

```bash
npm ci --ignore-scripts
npm run dev
```

Open:

```text
http://127.0.0.1:4173
```

The local server returns a deterministic BTC/CAD mock. It does not call the live provider.

## Content updates

Edit:

```text
src/content/catalog.mjs
src/content/demo-messages.mjs
```

Add or update corresponding local images under:

```text
src/static/assets/images/
```

Then run:

```bash
npm run verify
```

The release gate checks routes, images, links, metadata, product boundaries and budgets.

## Optional Production origin

The build uses Vercel's Production URL when available.

A stable approved domain can be set with:

```text
SITE_URL=https://approved-domain
```

Never use a temporary Preview URL as `SITE_URL`.

## BTC/CAD reference

The browser requests BitGora's same-origin endpoint only when the visitor asks for the reference or a short session cache exists.

The Vercel Function:

- requests one public BTC-CAD ticker;
- validates the price and timestamp;
- returns a normalized response;
- never returns a wallet address or payment request;
- uses no secret;
- degrades safely.

The estimate is not a quote or financial recommendation.

## Privacy

Browser state:

```text
bitgora:theme:v2
bitgora:watchlist:v2
bitgora:seller-draft:v2
bitgora:messages:v1
```

Do not enter personal, payment or wallet information into demo fields.

See [docs/owner-decisions.md](docs/owner-decisions.md) before adding live features.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md).

## Security

See [SECURITY.md](SECURITY.md).

## Provenance

The uploaded historical package credited Angelica Mapeso and Ziyong He and described itself as MIT-licensed, but the archive did not contain the referenced licence file.

This implementation is a clean-room rebuild. See [NOTICE.md](NOTICE.md) and [docs/audit-report.md](docs/audit-report.md).
