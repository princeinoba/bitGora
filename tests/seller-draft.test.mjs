import test from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_TTL_MS,
  DRAFT_VERSION,
  exportSellerDraft,
  isDraftExpired,
  normalizeSellerDraft,
  restoreSellerDraft,
  validateSellerDraft
} from "../src/lib/seller-draft.mjs";

const valid = {
  title: "Demo camera kit",
  category: "Photography",
  condition: "Excellent",
  region: "Ottawa, ON",
  btcPrice: 0.004,
  description: "A fictional camera kit with two batteries and a charger for local interface testing."
};

test("seller draft normalization strips controls and bounds values", () => {
  const draft = normalizeSellerDraft({ ...valid, title: "  Demo\u0000 camera kit  ", btcPrice: 20 }, 100);
  assert.equal(draft.version, DRAFT_VERSION);
  assert.equal(draft.savedAt, 100);
  assert.equal(draft.title, "Demo camera kit");
  assert.equal(draft.btcPrice, 0);
});

test("valid seller draft passes", () => {
  const result = validateSellerDraft(valid);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test("seller draft rejects missing or unsafe fields", () => {
  const result = validateSellerDraft({ title: "x", category: "Invalid", condition: "Unknown", region: "", btcPrice: 0, description: "short" });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["btcPrice", "description", "region", "title"]);
});

test("seller draft expires after twenty-four hours", () => {
  const savedAt = 1_000;
  assert.equal(isDraftExpired({ savedAt }, savedAt + DRAFT_TTL_MS), false);
  assert.equal(isDraftExpired({ savedAt }, savedAt + DRAFT_TTL_MS + 1), true);
});

test("restore accepts current version and rejects stale or mismatched state", () => {
  const now = 50_000;
  const saved = normalizeSellerDraft({ ...valid, savedAt: now - 1_000 }, now - 1_000);
  assert.ok(restoreSellerDraft(saved, now));
  assert.equal(restoreSellerDraft({ ...saved, version: 1 }, now), null);
  assert.equal(restoreSellerDraft({ ...saved, savedAt: now - DRAFT_TTL_MS - 1 }, now), null);
});

test("export produces a clearly local JSON artifact", () => {
  const result = exportSellerDraft(valid);
  assert.equal(result.valid, true);
  const parsed = JSON.parse(result.json);
  assert.equal(parsed.type, "bitgora-local-listing-draft");
  assert.match(parsed.notice, /not been published/i);
  assert.equal(parsed.listing.title, valid.title);
});
