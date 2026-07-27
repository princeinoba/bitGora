import { listings } from "./catalog-data.js";
import { clearWatchlist, escapeHtml, getWatchlist, toggleWatchlist } from "./site.js";

const grid = document.querySelector("[data-watchlist-grid]");
const empty = document.querySelector("[data-watchlist-empty]");
const count = document.querySelector("[data-watchlist-count]");

function formatBtc(value) {
  return `${Number(value).toFixed(8).replace(/0+$/, "").replace(/\.$/, "")} BTC`;
}

function icon(name) {
  if (name === "map") return '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/></svg>';
  return '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8z"/></svg>';
}

function card(item) {
  return `<article class="listing-card" data-listing-card data-id="${escapeHtml(item.id)}">
    <a class="listing-card__media" href="/market/${escapeHtml(item.slug)}/">
      <img src="/assets/images/${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt)}" width="960" height="720" loading="lazy" decoding="async">
      <span class="status-pill status-pill--${escapeHtml(item.status)}">${item.status === "sold" ? "Sold demo" : "Available demo"}</span>
    </a>
    <div class="listing-card__body">
      <div class="listing-card__meta"><span>${escapeHtml(item.category)}</span><span>${escapeHtml(item.condition)}</span></div>
      <h3><a href="/market/${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a></h3>
      <p>${escapeHtml(item.summary)}</p>
      <div class="listing-card__location">${icon("map")}<span>${escapeHtml(item.region)}</span></div>
      <div class="listing-card__footer"><div><strong>${formatBtc(item.btcPrice)}</strong><span>Saved on this device</span></div>
        <button class="save-button is-saved" type="button" data-watchlist-toggle="${escapeHtml(item.id)}" aria-pressed="true" aria-label="Remove ${escapeHtml(item.title)} from watchlist">${icon("heart")}<span>Saved</span></button>
      </div>
    </div>
  </article>`;
}

function render() {
  const ids = new Set(getWatchlist());
  const saved = listings.filter(item => ids.has(item.id));
  if (grid) grid.innerHTML = saved.map(card).join("");
  if (count) count.textContent = String(saved.length);
  if (empty) empty.hidden = saved.length !== 0;
}

grid?.addEventListener("click", event => {
  const button = event.target.closest("[data-watchlist-toggle]");
  if (!button) return;
  toggleWatchlist(button.dataset.watchlistToggle);
});
document.querySelector("[data-watchlist-clear]")?.addEventListener("click", () => {
  clearWatchlist();
  render();
});
document.addEventListener("bitgora:watchlistchange", render);
render();
