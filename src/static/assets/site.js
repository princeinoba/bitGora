import { listings } from "./catalog-data.js";

const THEME_KEY = "bitgora:theme:v2";
const WATCHLIST_KEY = "bitgora:watchlist:v2";
const INSTALL_DISMISSED_KEY = "bitgora:install-dismissed:v1";
let installPrompt = null;

export const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

function readJson(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function showToast(message) {
  const region = document.querySelector("[data-toast-region]");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = String(message);
  region.append(toast);
  window.setTimeout(() => toast.remove(), 4_000);
}

export function getWatchlist() {
  const value = readJson(localStorage, WATCHLIST_KEY, []);
  return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === "string" && listings.some(item => item.id === id)))] : [];
}

export function writeWatchlist(ids) {
  const next = [...new Set(ids)].filter(id => listings.some(item => item.id === id));
  try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next)); } catch { /* Keep UI usable if storage is blocked. */ }
  updateWatchlistButtons();
  document.dispatchEvent(new CustomEvent("bitgora:watchlistchange", { detail: next }));
  return next;
}

export function toggleWatchlist(id) {
  const current = new Set(getWatchlist());
  const listing = listings.find(item => item.id === id);
  if (current.has(id)) current.delete(id); else current.add(id);
  const next = writeWatchlist([...current]);
  showToast(current.has(id) ? `${listing?.title || "Listing"} saved locally.` : `${listing?.title || "Listing"} removed from your watchlist.`);
  return next;
}

export function clearWatchlist() {
  writeWatchlist([]);
  showToast("The local watchlist was cleared.");
}

function updateWatchlistButtons() {
  const saved = new Set(getWatchlist());
  document.querySelectorAll("[data-watchlist-toggle]").forEach(button => {
    const id = button.dataset.watchlistToggle;
    const listing = listings.find(item => item.id === id);
    const active = saved.has(id);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? `Remove ${listing?.title || "listing"} from watchlist` : `Save ${listing?.title || "listing"} to watchlist`);
    const text = button.querySelector("span");
    if (text) text.textContent = active ? "Saved" : button.classList.contains("save-button") ? "Save" : "Save to watchlist";
    button.classList.toggle("is-saved", active);
  });
}

function openDialog(dialog, trigger = null) {
  if (!dialog || dialog.open) return;
  if (trigger) dialog.dataset.returnFocus = trigger.id || "";
  dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}

function setupDialogs() {
  document.addEventListener("click", event => {
    const close = event.target.closest("[data-dialog-close]");
    if (close) closeDialog(close.closest("dialog"));
  });
  document.querySelectorAll("dialog").forEach(dialog => {
    dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(dialog); });
  });
}

function setupTheme() {
  let stored = "system";
  try {
    const candidate = localStorage.getItem(THEME_KEY);
    if (["system", "light", "dark"].includes(candidate)) stored = candidate;
  } catch { /* Use system. */ }
  document.documentElement.dataset.theme = stored;
  const update = () => {
    const current = document.documentElement.dataset.theme;
    const next = current === "system" ? "light" : current === "light" ? "dark" : "system";
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.setAttribute("aria-label", `Current theme: ${current}. Switch to ${next}.`);
    });
  };
  update();
  document.addEventListener("click", event => {
    if (!event.target.closest("[data-theme-toggle]")) return;
    const current = document.documentElement.dataset.theme;
    const next = current === "system" ? "light" : current === "light" ? "dark" : "system";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* Non-critical. */ }
    update();
    showToast(`Theme set to ${next}.`);
  });
}

function setupMobileNav() {
  const button = document.querySelector("[data-mobile-menu-button]");
  const nav = document.querySelector("[data-mobile-navigation]");
  if (!button || !nav) return;
  const setOpen = open => {
    nav.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  };
  button.addEventListener("click", () => setOpen(nav.hidden));
  nav.addEventListener("click", event => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !nav.hidden) { setOpen(false); button.focus(); } });
}

function commandItems() {
  const routes = [
    ["Home", "Product proposition and featured listings", "/"],
    ["Market", "Search every fictional listing", "/market/"],
    ["Sell studio", "Build a browser-local listing draft", "/sell/"],
    ["Watchlist", "Review saved listing IDs", "/watchlist/"],
    ["Safety", "Verification-first exchange guidance", "/safety/"],
    ["Demo messages", "Synthetic browser-only conversations", "/messages/"],
    ["About", "Architecture and product decisions", "/about/"],
    ["Privacy", "Local data and network boundaries", "/privacy/"]
  ].map(([label, detail, href]) => ({ label, detail, href }));
  return routes.concat(listings.map(item => ({
    label: item.title,
    detail: `${item.category} · ${item.condition} · ${item.region}`,
    href: `/market/${item.slug}/`
  })));
}

function setupCommandPalette() {
  const dialog = document.querySelector("[data-command-dialog]");
  const input = dialog?.querySelector("[data-command-input]");
  const results = dialog?.querySelector("[data-command-results]");
  if (!dialog || !input || !results) return;
  let lastTrigger = null;
  const render = query => {
    const normalized = query.trim().toLowerCase();
    const items = commandItems().filter(item => `${item.label} ${item.detail}`.toLowerCase().includes(normalized)).slice(0, 12);
    results.innerHTML = items.length
      ? items.map(item => `<a class="command-result" role="option" href="${item.href}"><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.detail)}</span></a>`).join("")
      : `<div class="empty-state empty-state--compact"><p>No BitGora destination matches that search.</p></div>`;
  };
  const open = trigger => {
    lastTrigger = trigger || document.activeElement;
    render("");
    openDialog(dialog);
    window.setTimeout(() => input.focus(), 0);
  };
  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-command-open]");
    if (trigger) open(trigger);
  });
  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      open(document.activeElement);
    }
  });
  input.addEventListener("input", () => render(input.value));
  dialog.addEventListener("close", () => {
    input.value = "";
    if (lastTrigger instanceof HTMLElement) lastTrigger.focus();
  });
}

function setupWatchlist() {
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-watchlist-toggle]");
    if (button) toggleWatchlist(button.dataset.watchlistToggle);
  });
  updateWatchlistButtons();
}

function setupOffline() {
  const banner = document.querySelector("[data-offline-banner]");
  if (!banner) return;
  const update = () => { banner.hidden = navigator.onLine; };
  window.addEventListener("online", () => { update(); showToast("You are back online."); });
  window.addEventListener("offline", update);
  update();
}

function setupInstall() {
  const button = document.querySelector("[data-install-button]");
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(INSTALL_DISMISSED_KEY) === "true"; } catch { /* Non-critical. */ }
    if (button && !dismissed) button.hidden = false;
  });
  button?.addEventListener("click", async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    button.hidden = true;
    try { sessionStorage.setItem(INSTALL_DISMISSED_KEY, "true"); } catch { /* Non-critical. */ }
  });
  window.addEventListener("appinstalled", () => showToast("BitGora was installed."));
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
}

setupDialogs();
setupTheme();
setupMobileNav();
setupCommandPalette();
setupWatchlist();
setupOffline();
setupInstall();
registerServiceWorker();
