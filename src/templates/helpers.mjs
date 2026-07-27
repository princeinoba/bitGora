const iconPaths = {
  bitcoin: '<path d="M9 3v18M15 3v18M7 7h9a3 3 0 0 1 0 6H7h10a3 3 0 0 1 0 6H7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
  tag: '<path d="M20 13 13 20l-9-9V4h7z"/><circle cx="8.5" cy="8.5" r="1.5"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  alert: '<path d="M10.3 3.8 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  refresh: '<path d="M20 11a8 8 0 1 0 2 5"/><path d="M20 4v7h-7"/>',
  external: '<path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
  spark: '<path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'
};

export function icon(name, className = "icon") {
  return `<svg class="${escapeHtml(className)}" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.spark}</svg>`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatBtc(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")} BTC`;
}

export function routeFile(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  return clean ? `${clean}/index.html` : "index.html";
}

export function joinUrl(origin, pathname) {
  if (!origin) return "";
  return `${origin.replace(/\/$/, "")}${pathname === "/" ? "/" : pathname}`;
}

export function button({ href, label, iconName = "arrow", variant = "primary", attrs = "" }) {
  return `<a class="button button--${escapeHtml(variant)}" href="${escapeHtml(href)}" ${attrs}>${escapeHtml(label)}${icon(iconName)}</a>`;
}

export function listingCard(listing, { compact = false } = {}) {
  return `<article class="listing-card${compact ? " listing-card--compact" : ""}" data-listing-card data-id="${escapeHtml(listing.id)}" data-category="${escapeHtml(listing.category)}" data-condition="${escapeHtml(listing.condition)}" data-status="${escapeHtml(listing.status)}" data-price="${listing.btcPrice}">
    <a class="listing-card__media" href="/market/${escapeHtml(listing.slug)}/">
      <img src="/assets/images/${escapeHtml(listing.image)}" alt="${escapeHtml(listing.imageAlt)}" width="960" height="720" loading="lazy" decoding="async">
      <span class="status-pill status-pill--${escapeHtml(listing.status)}">${listing.status === "sold" ? "Sold demo" : "Available demo"}</span>
    </a>
    <div class="listing-card__body">
      <div class="listing-card__meta"><span>${escapeHtml(listing.category)}</span><span>${escapeHtml(listing.condition)}</span></div>
      <h3><a href="/market/${escapeHtml(listing.slug)}/">${escapeHtml(listing.title)}</a></h3>
      <p>${escapeHtml(listing.summary)}</p>
      <div class="listing-card__location">${icon("map")}<span>${escapeHtml(listing.region)}</span></div>
      <div class="listing-card__footer">
        <div><strong>${formatBtc(listing.btcPrice)}</strong><span data-cad-estimate data-btc-price="${listing.btcPrice}">CAD estimate loads on demand</span></div>
        <button class="save-button" type="button" data-watchlist-toggle="${escapeHtml(listing.id)}" aria-pressed="false" aria-label="Save ${escapeHtml(listing.title)}">${icon("heart")}<span>Save</span></button>
      </div>
    </div>
  </article>`;
}
