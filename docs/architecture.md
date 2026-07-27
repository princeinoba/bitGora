# BitGora Market Lab — Product and Technical Architecture

## Architecture decision

The uploaded project combines a persistent Express/Mongo server, Passport sessions, Cloudinary uploads, Socket.IO messaging and a React single-page application. That stack is not merely difficult to deploy to Vercel; it represents a live-marketplace operating model that the source cannot secure or govern.

The final release uses a narrower architecture:

```text
Vercel CDN
├── 21 generated HTML documents
├── local CSS, JavaScript, SVG and PNG assets
├── PWA manifest and service worker
├── browser-local demo state
│   ├── watchlist
│   ├── seller draft
│   ├── inquiry text
│   └── synthetic messages
└── Vercel Functions
    ├── GET /api/health
    └── GET /api/btc-rate
         └── read-only Coinbase Exchange BTC-USDT × USDT-USDC × USDC-CAD ticker derivation
```

There is no database, authentication, session, upload, socket, wallet, payment, custody or public mutation.

## Product architecture

### Public, crawlable experience

```text
/
├── market/
│   ├── catalogue
│   └── twelve listing-detail documents
├── safety/
├── about/
└── privacy/
```

These routes explain the product and preserve the original Bitcoin-priced marketplace idea.

### Browser-local tools

```text
/sell/
/watchlist/
/messages/
```

These routes are marked `noindex,nofollow`.

They prove interaction design without creating real marketplace data.

### Product flow

```text
Understand the boundary
→ browse and filter fictional inventory
→ inspect a complete listing
→ optionally load a BTC/CAD reference
→ save an ID locally or prepare questions
→ review verification-first safety
```

Seller concept:

```text
enter bounded fictional details
→ validate
→ preview
→ save on device for 24 hours
→ explicitly export JSON
```

Message concept:

```text
open seeded synthetic thread
→ append local bounded message
→ persist scoped browser state
→ reset
```

## Source organization

```text
api/
├── btc-rate.js
└── health.js

src/
├── content/
│   ├── catalog.mjs
│   └── demo-messages.mjs
├── lib/
│   ├── catalog-utils.mjs
│   ├── seller-draft.mjs
│   └── message-core.mjs
├── server/
│   ├── rate-service.mjs
│   ├── rate-handler.mjs
│   └── health-handler.mjs
├── templates/
│   ├── helpers.mjs
│   ├── layout.mjs
│   └── pages.mjs
└── static/
    ├── site.webmanifest
    ├── sw.js
    └── assets/
        ├── site.css
        ├── site.js
        ├── rate.js
        ├── market.js
        ├── listing.js
        ├── sell.js
        ├── watchlist.js
        ├── messages.js
        ├── images/
        └── icons/

scripts/
├── build.mjs
├── dev-server.mjs
├── lint.mjs
├── smoke.mjs
├── verify-build.mjs
└── verify-determinism.mjs

tests/
├── catalog.test.mjs
├── messages.test.mjs
├── rate.test.mjs
├── seller-draft.test.mjs
└── templates.test.mjs
```

## Rendering model

Templates execute during `npm run build`.

Each route becomes a complete HTML document with:

- title;
- description;
- robots policy;
- canonical/social metadata when a stable production origin exists;
- structured data;
- header/navigation;
- one main landmark;
- one primary heading;
- page content;
- footer;
- global command/offline/status UI;
- local module scripts.

The browser does not need JavaScript to understand the proposition, browse listings, open details, read safety or access privacy information.

JavaScript progressively adds local state and optional live reference data.

## State model

| State | Storage | Retention | Network |
|---|---|---:|---:|
| Theme | `bitgora:theme:v2` local storage | until changed | No |
| Watchlist IDs | `bitgora:watchlist:v2` local storage | until cleared | No |
| Seller draft | `bitgora:seller-draft:v2` local storage | 24 hours | No |
| Synthetic messages | `bitgora:messages:v1` local storage | until reset | No |
| BTC/CAD cache | session storage | 60 seconds | rate only |
| Inquiry draft | page memory/clipboard | interaction | only after explicit copy |

Every persisted structure is scoped to BitGora. No whole-origin clearing is used.

## Market-reference boundary

### Request

```text
Browser
→ GET /api/btc-rate
→ Vercel Function
→ GET public BTC-USDT, USDT-USDC and USDC-CAD tickers
```

### Response

```json
{
  "status": "ok",
  "pair": "BTC-CAD",
  "rate": 100000,
  "asOf": "ISO timestamp",
  "provider": "Coinbase Exchange",
  "providerUrl": "provider documentation",
  "disclaimer": "Indicative market reference only..."
}
```

### Controls

- GET only;
- four-second upstream timeout;
- numeric/range validation;
- safe public error response;
- no API key;
- no personal data;
- CDN cache directive;
- session cache in the browser;
- on-demand refresh;
- BTC prices remain usable when CAD is unavailable;
- no payment or quote semantics.

## Security model

The most important security control is feature removal.

Removed:

- sessions;
- passwords;
- accounts;
- emails;
- personal seller data;
- database;
- uploads;
- sockets;
- private rooms;
- public mutations;
- wallet inputs;
- transaction signing;
- payment confirmation;
- escrow claims.

Vercel headers add:

- restrictive Content Security Policy;
- HSTS;
- frame denial;
- MIME-sniffing prevention;
- strict referrer policy;
- Cross-Origin-Opener-Policy;
- Permissions Policy disabling geolocation, camera, microphone, payment, USB and browsing topics.

The CSP permits only same-origin scripts, styles, images, fonts, connections, manifests and workers.

## Privacy model

The release has no analytics, advertising, tracking cookies, account profiles or database records.

The only third-party network operation is made server-side by the BTC/CAD Function. Visitors can use the full BTC-denominated catalogue without invoking it.

The UI repeatedly warns users not to enter:

- address;
- email;
- telephone;
- wallet address;
- seed phrase;
- private key;
- payment proof;
- identity document.

## PWA model

The manifest defines:

- name/short name;
- start URL and scope;
- standalone display;
- local 192px and 512px icons;
- shortcuts to market and seller studio.

The service worker:

- precaches the core shell;
- uses network-first navigation with cached fallback;
- caches successful same-origin static assets;
- does not cache API market data;
- deletes old cache versions;
- activates immediately and claims clients;
- has no remote image or font dependency.

## Performance model

Budgets enforced at build time:

```text
Complete dist: 1,500,000 bytes maximum
Browser JavaScript: 120,000 bytes maximum
CSS: 60,000 bytes maximum
External npm dependencies: 0
```

Images are local SVG illustrations. Only the social card and PWA icons are PNG.

## Deployment model

```text
Git feature branch
→ GitHub Actions quality gate
→ Vercel Preview
→ browser/accessibility/PWA verification
→ normal pull-request merge
→ Git-connected Production deployment from main
→ production smoke verification
```

Effective Vercel settings:

```text
Framework: Other
Node.js: 24.x
Install: npm ci --ignore-scripts
Build: npm run build
Output: dist
Functions: api/**/*.js
Region: iad1
```

No environment secret is required.

Optional:

```text
SITE_URL=https://stable-production-domain
```

The build otherwise uses Vercel's production system origin.

## Future live marketplace architecture

A future live BitGora is a separate product programme.

Suggested bounded contexts:

```text
Identity and account recovery
Listing moderation
Search/index
Conversation membership and moderation
Safety/reporting
Reputation
Exchange agreement
Bitcoin reference/quote semantics
Audit and compliance
Operations/incident response
```

A live version must not reuse browser role or sender identity. Every read/write must be authorized by the server against an authenticated principal and resource membership.

A possible high-level sequence:

```text
Buyer authenticates
→ server loads authorized listing
→ server creates conversation membership transactionally
→ realtime gateway validates token and room membership
→ message service persists bounded content
→ moderation/reporting events are auditable
→ exchange agreement records item, amount, expiry and acknowledgement
→ payment remains outside BitGora unless legal/custody programme is approved
```

This architecture is documented, not implemented.
