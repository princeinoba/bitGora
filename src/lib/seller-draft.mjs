export const DRAFT_VERSION = 2;
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
export const allowedCategories = Object.freeze([
  "Electronics", "Photography", "Cycling", "Audio", "Furniture", "Gaming",
  "Art", "Apparel", "Mobile", "Music", "Kitchen", "Other"
]);
export const allowedConditions = Object.freeze(["New", "Like new", "Excellent", "Good", "Tested"]);

const clean = (value, max) => String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max);

export function normalizeSellerDraft(input = {}, now = Date.now()) {
  const price = Number(input.btcPrice);
  return {
    version: DRAFT_VERSION,
    savedAt: Number.isFinite(Number(input.savedAt)) ? Number(input.savedAt) : now,
    title: clean(input.title, 90),
    category: allowedCategories.includes(input.category) ? input.category : "Other",
    condition: allowedConditions.includes(input.condition) ? input.condition : "Good",
    region: clean(input.region, 80),
    btcPrice: Number.isFinite(price) && price >= 0 && price <= 10 ? Number(price.toFixed(8)) : 0,
    description: clean(input.description, 700)
  };
}

export function validateSellerDraft(input = {}) {
  const draft = normalizeSellerDraft(input);
  const errors = {};
  if (draft.title.length < 4) errors.title = "Use at least 4 characters for the title.";
  if (!allowedCategories.includes(draft.category)) errors.category = "Choose a listed category.";
  if (!allowedConditions.includes(draft.condition)) errors.condition = "Choose a listed condition.";
  if (draft.region.length < 2) errors.region = "Add a city or broad region—never a precise address.";
  if (!(draft.btcPrice > 0 && draft.btcPrice <= 10)) errors.btcPrice = "Enter a BTC price greater than 0 and no more than 10 BTC.";
  if (draft.description.length < 20) errors.description = "Add at least 20 characters describing condition and included items.";
  return { draft, errors, valid: Object.keys(errors).length === 0 };
}

export function isDraftExpired(input, now = Date.now()) {
  const savedAt = Number(input?.savedAt);
  return !Number.isFinite(savedAt) || now - savedAt > DRAFT_TTL_MS;
}

export function restoreSellerDraft(input, now = Date.now()) {
  if (!input || Number(input.version) !== DRAFT_VERSION || isDraftExpired(input, now)) return null;
  return normalizeSellerDraft(input, savedAtOrNow(input.savedAt, now));
}

function savedAtOrNow(value, now) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : now;
}

export function exportSellerDraft(input) {
  const { draft, errors, valid } = validateSellerDraft(input);
  if (!valid) return { valid, errors, json: "" };
  const payload = {
    type: "bitgora-local-listing-draft",
    exportedAt: new Date().toISOString(),
    notice: "Local portfolio-demo draft only. This file has not been published to a marketplace.",
    listing: draft
  };
  return { valid: true, errors: {}, json: JSON.stringify(payload, null, 2) };
}
