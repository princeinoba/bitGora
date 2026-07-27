import test from "node:test";
import assert from "node:assert/strict";
import { categories, conditions, listings, productMode, publicRoutes } from "../src/content/catalog.mjs";
import { cadEstimate, filterListings, formatCad, formatBtc, relatedListings, sortListings } from "../src/lib/catalog-utils.mjs";

test("catalog contains twelve fictional listing records", () => {
  assert.equal(listings.length, 12);
  assert.ok(listings.every(item => /^Demo Seller \d{2}$/.test(item.sellerAlias)));
});

test("listing identifiers, slugs and titles are unique", () => {
  for (const key of ["id", "slug", "title"]) assert.equal(new Set(listings.map(item => item[key])).size, listings.length);
});

test("each listing has a valid product boundary and local image", () => {
  for (const item of listings) {
    assert.ok(item.btcPrice > 0 && item.btcPrice <= 10);
    assert.ok(["available", "sold"].includes(item.status));
    assert.ok(item.image.endsWith(".svg"));
    assert.ok(item.imageAlt.length >= 20);
    assert.ok(item.summary.length >= 30);
    assert.ok(item.description.length >= 40);
    assert.ok(item.features.length >= 3);
    assert.ok(item.exchangeMethods.length >= 1);
  }
});

test("categories and conditions derive from the catalog", () => {
  assert.ok(categories.length >= 8);
  assert.ok(conditions.includes("Like new"));
  assert.ok(conditions.includes("Good"));
});

test("public routes include every listing route", () => {
  assert.ok(publicRoutes.includes("/"));
  assert.ok(publicRoutes.includes("/market/"));
  for (const item of listings) assert.ok(publicRoutes.includes(`/market/${item.slug}/`));
});

test("product mode disables live commerce capabilities", () => {
  assert.deepEqual(productMode, {
    classification: "portfolio-demo",
    liveCommerce: false,
    walletConnection: false,
    payments: false,
    publicPosting: false,
    realMessaging: false
  });
});

test("market filters search title, feature and region", () => {
  assert.deepEqual(filterListings(listings, { query: "hot-swappable", status: "all" }).map(item => item.id), ["listing-keyboard"]);
  assert.deepEqual(filterListings(listings, { query: "Ottawa", status: "all" }).map(item => item.id).sort(), ["listing-desk", "listing-keyboard"]);
});

test("market filters category, condition, status and price", () => {
  const result = filterListings(listings, { category: "Electronics", condition: "Like new", status: "available", maxBtc: "0.001" });
  assert.deepEqual(result.map(item => item.id), ["listing-keyboard"]);
  assert.ok(filterListings(listings, { status: "sold" }).every(item => item.status === "sold"));
});

test("sort modes are stable and evidence based", () => {
  const available = listings.filter(item => item.status === "available");
  assert.equal(sortListings(available, "price-asc")[0].id, "listing-art");
  assert.equal(sortListings(available, "price-desc")[0].id, "listing-camera");
  assert.deepEqual(sortListings(available, "title").map(item => item.title), [...available.map(item => item.title)].sort());
});

test("related listings exclude the current item and favour category", () => {
  const current = listings.find(item => item.id === "listing-keyboard");
  const related = relatedListings(listings, current, 3);
  assert.equal(related.length, 3);
  assert.ok(related.every(item => item.id !== current.id));
  assert.equal(related[0].category, "Electronics");
});

test("BTC and CAD formatters reject invalid input safely", () => {
  assert.equal(formatBtc(0.0012), "0.0012 BTC");
  assert.equal(formatBtc("bad"), "—");
  assert.match(formatCad(1200), /\$1,200/);
  assert.equal(cadEstimate(0.001, 100000), 100);
  assert.equal(cadEstimate(-1, 100000), null);
});
