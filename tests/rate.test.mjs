import test from "node:test";
import assert from "node:assert/strict";
import { fetchBtcCadRate, RateServiceError } from "../src/server/rate-service.mjs";
import { handleBtcRate } from "../src/server/rate-handler.mjs";
import { handleHealth } from "../src/server/health-handler.mjs";

const request = (path, method = "GET") => new Request(`https://example.test${path}`, { method });

test("rate service normalizes Coinbase ticker data", async () => {
  const data = await fetchBtcCadRate({
    fetchFn: async (url, options) => {
      assert.match(String(url), /BTC-CAD\/ticker$/);
      assert.equal(options.method, "GET");
      return Response.json({ price: "101234.56", time: "2026-07-26T10:00:00Z" });
    }
  });
  assert.equal(data.pair, "BTC-CAD");
  assert.equal(data.rate, 101234.56);
  assert.equal(data.asOf, "2026-07-26T10:00:00.000Z");
  assert.equal(data.provider, "Coinbase Exchange");
});

test("rate service rejects invalid and unavailable responses", async () => {
  await assert.rejects(() => fetchBtcCadRate({ fetchFn: async () => Response.json({ price: "bad" }) }), RateServiceError);
  await assert.rejects(() => fetchBtcCadRate({ fetchFn: async () => new Response("bad", { status: 500 }) }), RateServiceError);
  await assert.rejects(() => fetchBtcCadRate({ fetchFn: async () => { throw new Error("offline"); } }), RateServiceError);
});

test("rate handler returns a normalized read-only payload", async () => {
  const response = await handleBtcRate(request("/api/btc-rate"), {
    fetchFn: async () => Response.json({ price: "100000", time: "2026-07-26T10:00:00Z" })
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.status, "ok");
  assert.equal(data.rate, 100000);
  assert.match(data.disclaimer, /not a quote/i);
  assert.match(response.headers.get("cache-control"), /s-maxage=60/);
});

test("rate handler safely degrades and rejects mutation methods", async () => {
  const unavailable = await handleBtcRate(request("/api/btc-rate"), { fetchFn: async () => { throw new Error("offline"); } });
  assert.equal(unavailable.status, 503);
  assert.equal((await unavailable.json()).status, "unavailable");
  const mutation = await handleBtcRate(request("/api/btc-rate", "POST"));
  assert.equal(mutation.status, 405);
  assert.equal(mutation.headers.get("allow"), "GET");
});

test("health endpoint describes the non-custodial product boundary", async () => {
  const response = handleHealth(request("/api/health"));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.mode, "portfolio-demo");
  assert.equal(data.capabilities.walletConnection, false);
  assert.equal(data.capabilities.payments, false);
  assert.equal(data.capabilities.custody, false);
});

test("health endpoint rejects mutation methods", async () => {
  const response = handleHealth(request("/api/health", "POST"));
  assert.equal(response.status, 405);
});
