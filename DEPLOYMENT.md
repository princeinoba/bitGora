# Vercel Deployment Guide

## Project settings

```text
Repository: princeinoba/bitGora
Framework preset: Other
Node.js: 24.x
Install command: npm ci --ignore-scripts
Build command: npm run build
Output directory: dist
Functions: api/**/*.js
Function region: iad1
Production branch: main
```

`vercel.json` is the version-controlled source of truth.

## 1. Verify locally

```bash
npm ci --ignore-scripts
npm audit
npm run verify
git diff --check
```

Do not deploy on failure.

## 2. Git workflow

Create a feature branch, commit the intentional clean-room rebuild, push and open a draft pull request into `main`.

The GitHub quality workflow must pass on the exact candidate SHA.

Do not commit:

```text
dist/
node_modules/
.vercel/
.env*
archives
embedded Git data
credentials
```

## 3. Link or create the Vercel project

Reuse the existing Vercel project when it is already connected to `princeinoba/bitGora`.

Otherwise create one project named:

```text
bitgora
```

under the approved owner/team scope.

Do not create random duplicate projects.

No environment secret is required.

Leave `SITE_URL` unset until a stable Production domain is known.

## 4. Preview gate

Use the Git-connected Preview for the pull-request branch.

Confirm:

- project identity;
- Preview target;
- exact Git SHA;
- READY state;
- Node 24;
- correct build/output settings.

Verify every route:

```text
/
 /market/
 /market/{each listing}/
 /sell/
 /watchlist/
 /messages/
 /safety/
 /about/
 /privacy/
 /unknown-route
 /api/health
 /api/btc-rate
 /site.webmanifest
 /sw.js
 /robots.txt
 /sitemap.xml
 /.well-known/security.txt
```

Viewports:

```text
390 × 844
768 × 1024
1440 × 900
1536 × 1024
```

Interactions:

- desktop/mobile navigation;
- skip link;
- themes and persistence;
- command palette;
- market search/filter/sort/reset/view;
- watchlist save/remove/clear;
- listing inquiry dialog and copy;
- seller validation/save/restore/export/clear;
- synthetic message thread/add/reset;
- on-demand BTC/CAD reference;
- provider-unavailable state;
- offline banner;
- service-worker registration/update;
- true offline navigation;
- installability;
- designed 404.

Require:

- no console errors;
- no failed same-origin requests;
- no CSP violations;
- no horizontal overflow;
- no keyboard trap;
- no invalid ARIA;
- no serious/critical accessibility violation;
- no secret/source archive/environment exposure.

Run Lighthouse and record actual values. Do not invent scores.

## 5. Live rate verification

Preview `/api/btc-rate` should:

- accept GET only;
- return `BTC-CAD`;
- return a positive bounded rate;
- include an ISO timestamp;
- contain a disclaimer;
- contain no key or user information;
- return a safe 503 when provider data is unavailable;
- expose cache directives.

Use only a small number of provider requests.

## 6. Merge and Production

When the exact PR head passes CI and Preview:

1. mark the PR ready;
2. merge normally without admin bypass;
3. update local `main`;
4. wait for the Git-connected Production deployment;
5. confirm Production Git SHA equals merged `main`.

Do not create a second manual Production deployment while Git deployment is progressing.

## 7. Production gate

Repeat the Preview checks on the public Production domain.

Confirm:

- public access without Vercel SSO;
- canonical URLs use Production;
- sitemap uses Production;
- health/rate endpoints work;
- security headers are present;
- runtime error logs are clean;
- Production deployment is from `main`.

## 8. Optional `SITE_URL`

If Vercel's Production system URL does not resolve the desired stable alias, set:

```text
SITE_URL=https://stable-production-domain
```

for Production, redeploy, and reverify canonical/social/sitemap output.

Never set a Preview URL.

## 9. Rollback

Record the previous Production deployment ID.

Use Vercel rollback if the new release regresses. Then repair source through a normal branch and pull request.

Local browser state is not server data and is not affected by a deployment rollback.
