import { escapeHtml, icon, joinUrl } from "./helpers.mjs";

const navItems = [
  { href: "/", label: "Home", page: "home" },
  { href: "/market/", label: "Market", page: "market" },
  { href: "/sell/", label: "Sell studio", page: "sell" },
  { href: "/watchlist/", label: "Watchlist", page: "watchlist" },
  { href: "/safety/", label: "Safety", page: "safety" },
  { href: "/messages/", label: "Demo messages", page: "messages" }
];

function resolveSiteOrigin() {
  const explicit = String(process.env.SITE_URL || "").trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${String(process.env.VERCEL_PROJECT_PRODUCTION_URL).replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }
  return "";
}

function header(activePage) {
  const links = navItems.map(item => `<a href="${item.href}"${item.page === activePage ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`).join("");
  return `<div class="demo-banner" role="status">
    <div class="shell demo-banner__inner">${icon("shield")}<span><strong>Portfolio demonstration.</strong> Listings, sellers and conversations are fictional. No wallet, payment or public posting is connected.</span><a href="/safety/">Review the safety boundary</a></div>
  </div>
  <header class="site-header" data-site-header>
    <div class="shell site-header__inner">
      <a class="brand" href="/" aria-label="BitGora home">
        <span class="brand-mark" aria-hidden="true"><span>₿</span></span>
        <span><strong>BitGora</strong><small>Bitcoin-priced marketplace concept</small></span>
      </a>
      <button class="icon-button mobile-menu-button" type="button" data-mobile-menu-button aria-expanded="false" aria-controls="mobile-navigation" aria-label="Open navigation">${icon("menu")}</button>
      <nav class="desktop-nav" aria-label="Primary">${links}</nav>
      <div class="header-actions">
        <button class="rate-chip" type="button" data-rate-refresh aria-label="Refresh BTC to Canadian dollar reference">
          <span>BTC/CAD</span><strong data-rate-chip>Reference unavailable</strong>
        </button>
        <button class="icon-button" type="button" data-command-open aria-label="Open quick navigation">${icon("search")}</button>
        <button class="icon-button" type="button" data-theme-toggle aria-label="Change colour theme">${icon("sun")}</button>
      </div>
    </div>
    <nav id="mobile-navigation" class="mobile-nav shell" aria-label="Mobile" data-mobile-navigation hidden>${links}</nav>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="shell site-footer__grid">
      <div>
        <a class="brand brand--footer" href="/"><span class="brand-mark" aria-hidden="true"><span>₿</span></span><span><strong>BitGora</strong><small>Market Lab</small></span></a>
        <p>A modernized, non-custodial portfolio demonstration inspired by the original Bitcoin marketplace concept.</p>
        <p class="source-note">No real users, listings, chat rooms, wallet addresses, payments, escrow or financial advice are provided.</p>
      </div>
      <div><h2>Explore</h2><ul class="footer-links">
        <li><a href="/market/">Demo market</a></li>
        <li><a href="/sell/">Local sell studio</a></li>
        <li><a href="/watchlist/">Saved listings</a></li>
        <li><a href="/messages/">Synthetic messages</a></li>
      </ul></div>
      <div><h2>Learn</h2><ul class="footer-links">
        <li><a href="/safety/">Safer exchange guide</a></li>
        <li><a href="/about/">Architecture and rebuild</a></li>
        <li><a href="/privacy/">Privacy boundary</a></li>
        <li><a href="/api/health">System status</a></li>
      </ul></div>
      <div><h2>Reference data</h2>
        <p>Optional BTC/CAD estimates use a read-only public market-data endpoint through a same-origin Vercel Function.</p>
        <a class="text-link" href="https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/products/get-product-ticker" target="_blank" rel="noopener noreferrer">Coinbase Exchange documentation ${icon("external")}</a>
        <button class="button button--light install-button" type="button" data-install-button hidden>Install BitGora${icon("download")}</button>
      </div>
    </div>
    <div class="shell site-footer__bottom"><span>© ${new Date().getUTCFullYear()} BitGora Market Lab.</span><span>Indicative references only—not a quote or recommendation.</span></div>
  </footer>`;
}

function globalUi() {
  return `<div class="offline-banner" data-offline-banner hidden>${icon("alert")}<span>You are offline. Cached pages and local demo state remain available; live CAD estimates are paused.</span></div>
  <div class="toast-region" data-toast-region aria-live="polite" aria-atomic="false"></div>
  <dialog class="command-dialog" data-command-dialog aria-labelledby="command-title">
    <form method="dialog" class="command-dialog__surface">
      <div class="dialog-head"><div><p class="eyebrow">Quick navigation</p><h2 id="command-title">Search BitGora</h2></div><button class="icon-button" value="cancel" aria-label="Close quick navigation">${icon("close")}</button></div>
      <label class="search-field"><span class="sr-only">Search destinations and listings</span>${icon("search")}<input type="search" data-command-input autocomplete="off" placeholder="Search pages or demo listings"></label>
      <div class="command-results" data-command-results role="listbox" aria-label="Quick navigation results"></div>
      <p class="command-hint"><kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> opens this menu.</p>
    </form>
  </dialog>`;
}

export function renderDocument({
  title,
  description,
  path,
  page,
  main,
  scripts = [],
  bodyClass = "",
  noIndex = false,
  structuredData = null
}) {
  const origin = resolveSiteOrigin();
  const canonical = origin ? joinUrl(origin, path) : "";
  const indexable = Boolean(origin) && !noIndex;
  const robots = indexable ? "index,follow" : noIndex ? "noindex,nofollow" : "noindex,follow";
  const socialImage = origin ? `${origin}/assets/images/social-card.png` : "";
  const scriptTags = ["/assets/site.js", "/assets/rate.js", ...scripts]
    .map(src => `<script type="module" src="${src}"></script>`).join("\n    ");
  const schema = structuredData || {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BitGora Market Lab",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "A non-custodial Bitcoin-priced marketplace portfolio demonstration.",
    url: origin || undefined
  };
  return `<!doctype html>
<html lang="en" data-theme="system" data-page="${escapeHtml(page)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#071a26">
  <meta name="color-scheme" content="light dark">
  <meta name="robots" content="${robots}">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : ""}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="BitGora Market Lab">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}">` : ""}
  ${socialImage ? `<meta property="og:image" content="${escapeHtml(socialImage)}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${socialImage ? `<meta name="twitter:image" content="${escapeHtml(socialImage)}">` : ""}
  <link rel="manifest" href="/site.webmanifest">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/icon-192.png">
  <link rel="stylesheet" href="/assets/site.css">
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>
  ${scriptTags}
</head>
<body class="${escapeHtml(bodyClass)}">
  <a class="skip-link" href="#main">Skip to main content</a>
  ${header(page)}
  ${main}
  ${footer()}
  ${globalUi()}
</body>
</html>`;
}

export function productionSiteOrigin() {
  return resolveSiteOrigin();
}
