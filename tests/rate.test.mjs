import test from "node:test";
import assert from "node:assert/strict";
import { fetchBtcCadRate, RateServiceError } from "../src/server/rate-service.mjs";
import { handleBtcRate } from "../src/server/rate-handler.mjs";
import { handleHealth } from "../src/server/health-handler.mjs";

const request = (path, method = "GET") => new Request(`https://example.test${path}`, { method });
const tickerFixture = async (url, options) => {
  assert.equal(options.method, "GET");
  if (String(url).endsWith("/BTC-USDT/ticker")) {
    return Response.json({ price: "100000", time: "2026-07-26T10:00:00Z" });
  }
  if (String(url).endsWith("/USDT-USDC/ticker")) {
    return Response.json({ price: "0.9991", time: "2026-07-26T09:59:59Z" });
  }
  if (String(url).endsWith("/USDC-CAD/ticker")) {
    return Response.json({ price: "1.36", time: "2026-07-26T09:59:58Z" });
  }
  throw new Error(`Unexpected ticker URL: ${url}`);
};

test("rate service derives BTC-CAD from three public Coinbase Exchange tickers", async () => {
  const calls = [];
  const data = await fetchBtcCadRate({
    fetchFn: async (url, options) => {
      calls.push(String(url));
      return tickerFixture(url, options);
    }
  });
  assert.deepEqual(calls.sort(), [
    "https://api.exchange.coinbase.com/products/BTC-USDT/ticker",
    "https://api.exchange.coinbase.com/products/USDC-CAD/ticker",
    "https://api.exchange.coinbase.com/products/USDT-USDC/ticker"
  ]);
  assert.equal(data.pair, "BTC-CAD");
  assert.ok(Math.abs(data.rate - 135877.6) < 0.000001);
  assert.equal(data.asOf, "2026-07-26T09:59:58.000Z");
  assert.equal(data.provider, "Coinbase Exchange");
  assert.deepEqual(data.providerPairs, ["BTC-USDT", "USDT-USDC", "USDC-CAD"]);
});

test("rate service rejects invalid and unavailable responses", async () => {
  await assert.rejects(() => fetchBtcCadRate({ fetchFn: async () => Response.json({ price: "bad" }) }), RateServiceError);
  await assert.rejects(() => fetchBtcCadRate({ fetchFn: async () => new Response("bad", { status: 500 }) }), RateServiceError);
  await assert.rejects(() => fetchBtcCadRate({ fetchFn: async () => { throw new Error("offline"); } }), RateServiceError);
});

test("rate handler returns a normalized read-only payload", async () => {
  const response = await handleBtcRate(request("/api/btc-rate"), { fetchFn: tickerFixture });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.status, "ok");
  assert.ok(Math.abs(data.rate - 135877.6) < 0.000001);
  assert.deepEqual(data.providerPairs, ["BTC-USDT", "USDT-USDC", "USDC-CAD"]);
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
