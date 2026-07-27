# BitGora Market Lab — Verification Report

## Status

```text
PASS — source, build, service contracts, HTTP routes, security configuration and clean-room reproducibility verified.
Vercel Preview browser verification remains required because managed Chromium navigation was blocked by administrator policy.
```

## Environment

```text
Verification date: 2026-07-26
Node available in audit environment: v22.16.0
npm: 10.9.2
Target Production Node: 24.x
```

The audit environment displayed the expected engine warning because the release intentionally targets Node 24.x. The complete test/build gate passed under Node 22.16.0.

## Source integrity

```text
Original ZIP:
501db2ba1b9d616cb172378e107bdda1cbc9b30fd50b714f7cb38f8e2a90f4d3

Original embedded Git HEAD:
86d90687d16db03d1362fa75c72a925a72ee28d1
```

The historical embedded `.git` directory is not included in the rebuilt package.

The final source workspace contains 68 intended files before generated `dist/`.

## Dependency verification

```text
External npm dependencies: 0
npm ci --ignore-scripts: passed
npm audit --omit=dev: 0 vulnerabilities
```

## Automated release gate

Command:

```bash
npm run verify
```

Result:

```text
JavaScript syntax files: 32 passed
Deployable policy files: 25 passed
Automated tests: 33 passed
Failed tests: 0
Generated HTML documents: 21
Generated total files: 56
HTTP release assertions: 108 passed
Deterministic generated-tree comparison: passed
```

## Generated output

```text
Complete dist: 583,943 bytes
Browser JavaScript: 51,355 bytes
CSS: 38,737 bytes
```

Budgets:

```text
Complete dist: ≤ 1,500,000 bytes
Browser JavaScript: ≤ 120,000 bytes
CSS: ≤ 60,000 bytes
```

Deterministic generated-tree SHA-256:

```text
4a6e73ed2c9d00d29393bca56acc391b95cb039d63cac4a4dda3b1dba1d13c49
```

Two complete builds produced the same 56 path-and-file hashes.

## Unit and contract coverage

### Catalogue

Verified:

- twelve listing records;
- fictional seller aliases;
- unique IDs, slugs and titles;
- valid BTC bounds;
- valid available/sold status;
- local SVG images;
- image alt text;
- category and condition derivation;
- complete public routes;
- live-commerce capabilities disabled;
- search, category, condition, status and maximum-price filters;
- price/title/condition sorting;
- related-listing selection;
- BTC/CAD formatting.

### Seller draft

Verified:

- schema version;
- control-character removal;
- field bounds;
- category/condition allowlists;
- valid and invalid state;
- 24-hour expiry;
- stale/wrong-version rejection;
- local JSON export notice.

### Synthetic messages

Verified:

- three fictional counterparties;
- valid sender allowlist;
- missing/malformed-state reset;
- unknown-thread rejection;
- control-character removal;
- immutable append;
- empty-message rejection;
- maximum length.

### Market-reference service

Verified:

- Exchange-ticker-only BTC-USDT × USDT-USDC × USDC-CAD derivation;
- GET request;
- three-response normalization and conservative timestamp selection;
- numeric/range validation;
- timeout/failure conversion;
- bounded public 503 response;
- GET-only method handling;
- cache directive;
- disclaimer;
- no payment/custody capability.

### Templates

Verified:

- complete HTML documents;
- one main;
- one h1;
- visible portfolio boundary;
- twelve market cards;
- listing safety and inquiry interface;
- noindex local tools.

## Build verifier

Every generated document was checked for:

- title;
- description;
- one main;
- one primary heading;
- skip link;
- non-empty anchors;
- no inline event handlers;
- image alt text;
- image width and height;
- local-link resolution;
- local-asset resolution;
- unique titles;
- required route inventory;
- no stale CRA identity;
- no historical secret;
- no old Coindesk/Heroku/Mongo/localhost backend reference;
- local-tool/404 noindex policy;
- manifest identity/icons/install fields;
- service-worker lifecycle and API-cache exclusion;
- Vercel framework/install/build/output configuration;
- security-header presence;
- restrictive CSP;
- Vercel Function entrypoints;
- output budgets.

## HTTP smoke verification

The Production-style local server returned expected results for:

- home;
- market;
- twelve listing pages;
- Sell Studio;
- Watchlist;
- Demo Messages;
- Safety;
- About;
- Privacy;
- designed unknown-route 404;
- nine historical redirects;
- health endpoint;
- deterministic rate endpoint;
- method rejection;
- manifest;
- service worker;
- robots;
- sitemap;
- security contact;
- CSS;
- JavaScript;
- social image;
- CSP;
- Permissions Policy;
- referrer policy;
- MIME-sniffing protection;
- frame denial;
- Cross-Origin-Opener-Policy.

Total:

```text
108 assertions passed
```

## Clean-room verification

A fresh directory was created without:

```text
.git
.vercel
node_modules
dist
ZIP files
local environment values
browser profiles
```

The clean room ran:

```bash
npm ci --ignore-scripts
npm audit --omit=dev
npm run verify
```

Result:

```text
Passed
0 vulnerabilities
33 tests passed
108 HTTP assertions passed
same 56 generated files
same output sizes
same deterministic SHA-256
```

The release does not depend on an untracked local file.

## Secret scan

112 text/source/generated files were scanned with high-confidence patterns for:

- private keys;
- AWS access keys;
- GitHub tokens;
- Slack tokens;
- MongoDB URIs;
- the historical hard-coded session secret.

Result:

```text
0 findings
```

The two policy-scanner source files were excluded from this secondary scan because they intentionally contain banned-pattern strings as detection rules. They are syntax-checked and reviewed by the main release gate.

## Browser verification limitation

Managed Chromium was launched against the reachable local HTTP server, but navigation was blocked before application code executed:

```text
Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR
URLBlocklist: ["*"]
```

No browser policy was bypassed.

Therefore this report does not claim:

- real Chromium route navigation;
- real pointer/keyboard interactions;
- automated axe results;
- Lighthouse scores;
- runtime console/network cleanliness;
- runtime CSP-console results;
- service-worker registration/update;
- true offline navigation;
- install prompt behaviour;
- screenshots of rendered pages.

Evidence is stored in:

```text
docs/evidence/browser-runtime-limitation.txt
```

## Mandatory Vercel Preview gate

Before Production, verify on the exact Preview SHA:

1. all 21 HTML routes and designed 404;
2. mobile/tablet/desktop/wide layouts;
3. market filters and sorting;
4. watchlist persistence/clear;
5. inquiry dialog/copy;
6. seller invalid/valid/save/restore/export/clear;
7. message thread/add/reset;
8. on-demand live BTC/CAD;
9. safe provider-unavailable state;
10. themes and command palette;
11. mobile navigation and focus;
12. service-worker registration/update;
13. offline navigation;
14. installability;
15. axe/manual keyboard accessibility;
16. Lighthouse;
17. zero console errors;
18. zero failed same-origin requests;
19. zero CSP violations;
20. no horizontal overflow;
21. no exposed archive, environment file or source map.

## Verification conclusion

The source and generated release are deterministic, dependency-free, within budget, free of known npm vulnerabilities and high-confidence secrets, and ready for the Vercel Preview gate.

No public Vercel deployment was created during this audit.

## Current exact local release evidence — 2026-07-26

This section supersedes the earlier audit-environment and browser-limitation
notes above for the current release branch.

```text
Node: v24.18.0
npm: 10.2.4
Intended source files: 70
npm ci --ignore-scripts: passed
npm audit --omit=dev: 0 vulnerabilities
JavaScript syntax files: 32 passed
Deployable policy files: 25 passed
Automated tests: 33 passed, 0 failed
Generated HTML documents: 21
Generated total files: 56
Complete dist: 583,943 bytes
Browser JavaScript: 51,355 bytes
CSS: 38,737 bytes
HTTP release assertions: 108 passed
Deterministic SHA-256: 4a6e73ed2c9d00d29393bca56acc391b95cb039d63cac4a4dda3b1dba1d13c49
Clean-room npm ci/audit/verify: passed
Independent secret scan: 243 text/source/generated files, 0 findings
```

Bundled headless Chromium completed 84 route/viewport combinations across all
21 documents plus the designed 404 at 390×844, 768×1024, 1440×900 and
1536×1024. It also passed 38 interaction, storage, API and PWA assertions for
mobile navigation, Escape handling, active UI state, theme persistence, command
palette, market search/filter/sort/reset/view, no-results, watchlist, inquiry,
sold state, seller validation/preview/save/restore/export/clear, synthetic
messages, rate reference/session cache, service worker, offline navigation,
reduced motion and GET-only APIs.

```text
Unexpected console errors: 0
Failed required requests: 0
Unexpected external browser requests: 0
CSP violations: 0
Horizontal-overflow defects: 0
Invalid ARIA reference defects: 0
Keyboard/dialog Escape defects: 0
```

Axe 4.x ran on home, market, one listing, seller studio, watchlist, messages,
safety, about, privacy and the designed 404. It reported zero violations and
zero serious or critical findings.

Local Lighthouse homepage measurement:

```text
Performance: 100
Accessibility: 100
Best Practices: 100
SEO: 66
```

The SEO score is interpreted as expected because the owner-approved portfolio
release intentionally remains `noindex`. Preview and Production Lighthouse,
live Coinbase, public-access and deployment-identity evidence remain mandatory
for the exact deployed commits.
## Coinbase Exchange pair compatibility — 2026-07-27

Live verification found that Coinbase Exchange still documents the public
product-ticker endpoint, but `BTC-CAD` is no longer present in the public product
inventory and the direct ticker returns HTTP 404. The inventory still surfaces`n`BTC-USDC`, but its ticker identifies the product
as delisted. The currently responsive bridge tickers are `BTC-USDT`,
`USDT-USDC` and `USDC-CAD`.

The Function therefore derives an indicative BTC/CAD reference from exactly
three public, credential-free Coinbase Exchange product-ticker requests:

```text
BTC-USDT × USDT-USDC × USDC-CAD = indicative BTC-CAD
```

All three responses are validated independently, the older valid component`ntimestamp
is reported, the combined result is bounded, and any component failure still
returns the existing safe 503 response. No account, key, wallet, payment or user
data is involved.
