export function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "");
}

export function formatBtc(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "—";
  return `${amount.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")} BTC`;
}

export function formatCad(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "CAD estimate unavailable";
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(amount);
}

export function cadEstimate(btcPrice, rate) {
  const price = Number(btcPrice);
  const marketRate = Number(rate);
  return Number.isFinite(price) && Number.isFinite(marketRate) && price >= 0 && marketRate > 0 ? price * marketRate : null;
}

export function filterListings(listings, filters = {}) {
  const query = normalizeText(filters.query);
  const category = String(filters.category || "all");
  const condition = String(filters.condition || "all");
  const status = String(filters.status || "available");
  const maxBtc = filters.maxBtc === "" || filters.maxBtc == null ? null : Number(filters.maxBtc);
  return listings.filter(listing => {
    const haystack = normalizeText([
      listing.title, listing.category, listing.condition, listing.region,
      listing.summary, listing.description, ...(listing.features || [])
    ].join(" "));
    return (!query || haystack.includes(query))
      && (category === "all" || listing.category === category)
      && (condition === "all" || listing.condition === condition)
      && (status === "all" || listing.status === status)
      && (maxBtc == null || !Number.isFinite(maxBtc) || listing.btcPrice <= maxBtc);
  });
}

export function sortListings(listings, sort = "featured") {
  const next = [...listings];
  const conditionRank = { New: 0, "Like new": 1, Excellent: 2, Tested: 3, Good: 4 };
  if (sort === "price-asc") return next.sort((a, b) => a.btcPrice - b.btcPrice);
  if (sort === "price-desc") return next.sort((a, b) => b.btcPrice - a.btcPrice);
  if (sort === "condition") return next.sort((a, b) => (conditionRank[a.condition] ?? 99) - (conditionRank[b.condition] ?? 99));
  if (sort === "title") return next.sort((a, b) => a.title.localeCompare(b.title));
  return next.sort((a, b) => Number(a.status === "sold") - Number(b.status === "sold"));
}

export function relatedListings(listings, listing, limit = 3) {
  return listings
    .filter(item => item.id !== listing.id)
    .sort((a, b) => Number(b.category === listing.category) - Number(a.category === listing.category))
    .slice(0, limit);
}
