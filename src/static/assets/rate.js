const CACHE_KEY = "bitgora:btc-cad:session:v1";
const CACHE_MAX_AGE_MS = 60_000;
let currentRate = null;

function formatCad(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
}

function readCache() {
  try {
    const value = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (!value || !Number.isFinite(value.rate) || Date.now() - value.cachedAt > CACHE_MAX_AGE_MS) return null;
    return value;
  } catch {
    return null;
  }
}

function writeCache(value) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...value, cachedAt: Date.now() })); } catch { /* Non-critical. */ }
}

function updateEstimates(rate) {
  currentRate = Number.isFinite(rate) && rate > 0 ? rate : null;
  document.querySelectorAll("[data-cad-estimate][data-btc-price]").forEach(node => {
    const btc = Number(node.dataset.btcPrice);
    node.textContent = currentRate && Number.isFinite(btc) ? `≈ ${formatCad(btc * currentRate)} at the loaded reference` : "CAD estimate unavailable";
  });
  const input = document.querySelector("[data-converter-input]");
  const output = document.querySelector("[data-converter-output]");
  if (input && output) {
    const amount = Number(input.value);
    output.value = currentRate && Number.isFinite(amount) ? formatCad(amount * currentRate) : "Unavailable";
    output.textContent = output.value;
  }
}

function renderRate(data) {
  const rate = Number(data?.rate);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Invalid rate");
  updateEstimates(rate);
  document.querySelectorAll("[data-rate-chip]").forEach(node => { node.textContent = formatCad(rate); });
  const output = document.querySelector("[data-rate-output]");
  if (output) output.textContent = `1 BTC ≈ ${formatCad(rate)}`;
  const message = document.querySelector("[data-rate-message]");
  if (message) message.textContent = "Indicative BTC/CAD market reference. It is not a locked quote, payment request or recommendation.";
  const time = document.querySelector("[data-rate-time]");
  if (time) time.textContent = `Updated ${new Date(data.asOf).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function renderUnavailable() {
  currentRate = null;
  updateEstimates(null);
  document.querySelectorAll("[data-rate-chip]").forEach(node => { node.textContent = "Unavailable"; });
  const output = document.querySelector("[data-rate-output]");
  if (output) output.textContent = "Current estimate unavailable";
  const message = document.querySelector("[data-rate-message]");
  if (message) message.textContent = "BTC prices remain visible. Try the read-only market reference again later.";
  const time = document.querySelector("[data-rate-time]");
  if (time) time.textContent = "";
}

export async function refreshRate({ force = false } = {}) {
  const cached = !force && readCache();
  if (cached) { renderRate(cached); return cached; }
  document.querySelectorAll("[data-rate-refresh]").forEach(button => button.setAttribute("aria-busy", "true"));
  try {
    const response = await fetch("/api/btc-rate", { headers: { accept: "application/json" } });
    const data = await response.json();
    if (!response.ok || data.status !== "ok") throw new Error("Unavailable");
    writeCache(data);
    renderRate(data);
    return data;
  } catch {
    renderUnavailable();
    return null;
  } finally {
    document.querySelectorAll("[data-rate-refresh]").forEach(button => button.removeAttribute("aria-busy"));
  }
}

document.addEventListener("click", event => {
  if (event.target.closest("[data-rate-refresh]")) refreshRate({ force: true });
});
document.querySelector("[data-converter-input]")?.addEventListener("input", event => {
  const output = document.querySelector("[data-converter-output]");
  const amount = Number(event.target.value);
  if (output) {
    output.value = currentRate && Number.isFinite(amount) ? formatCad(amount * currentRate) : "Unavailable";
    output.textContent = output.value;
  }
});
const cached = readCache();
if (cached) renderRate(cached);
