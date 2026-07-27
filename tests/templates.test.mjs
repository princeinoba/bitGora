import test from "node:test";
import assert from "node:assert/strict";
import { listings } from "../src/content/catalog.mjs";
import { homePage, listingPage, marketPage, messagesPage, sellPage } from "../src/templates/pages.mjs";

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

test("home is a complete semantic static document", () => {
  const html = homePage();
  assert.match(html, /<!doctype html>/i);
  assert.equal(count(html, /<main\b/g), 1);
  assert.equal(count(html, /<h1\b/g), 1);
  assert.match(html, /Portfolio demonstration/);
  assert.match(html, /No wallet, payment or public posting/);
});

test("market renders all twelve fictional cards", () => {
  const html = marketPage();
  assert.equal(count(html, /data-listing-card/g), listings.length);
  assert.match(html, /Every listing and seller is synthetic/);
});

test("listing documents expose safety and inquiry boundaries", () => {
  const html = listingPage(listings[0]);
  assert.match(html, /fictional/);
  assert.match(html, /No wallet, payment or public posting/);
  assert.match(html, /data-inquiry-dialog/);
});

test("local demo tools are noindex", () => {
  for (const html of [sellPage(), messagesPage()]) {
    assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  }
});
