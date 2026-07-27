const TICKER_URLS = {
  btcUsdt: "https://api.exchange.coinbase.com/products/BTC-USDT/ticker",
  usdtUsdc: "https://api.exchange.coinbase.com/products/USDT-USDC/ticker",
  usdcCad: "https://api.exchange.coinbase.com/products/USDC-CAD/ticker"
};
const REQUEST_TIMEOUT_MS = 4_000;

export class RateServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "RateServiceError";
    this.code = code;
  }
}

async function fetchTicker(url, fetchFn) {
  let response;
  try {
    response = await fetchFn(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "user-agent": "BitGora-Market-Lab/2.0 (read-only public market reference)"
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch {
    throw new RateServiceError("provider_unavailable", "The BTC/CAD reference provider is temporarily unavailable.");
  }
  if (!response?.ok) {
    throw new RateServiceError("provider_error", "The BTC/CAD reference provider returned an unexpected response.");
  }
  const payload = await response.json().catch(() => null);
  const price = Number(payload?.price);
  if (!Number.isFinite(price) || price <= 0 || price > 10_000_000) {
    throw new RateServiceError("invalid_rate", "The BTC/CAD reference response could not be validated.");
  }
  return { price, time: payload?.time };
}

export async function fetchBtcCadRate({ fetchFn = fetch, now = () => new Date() } = {}) {
  const [btcUsdt, usdtUsdc, usdcCad] = await Promise.all([
    fetchTicker(TICKER_URLS.btcUsdt, fetchFn),
    fetchTicker(TICKER_URLS.usdtUsdc, fetchFn),
    fetchTicker(TICKER_URLS.usdcCad, fetchFn)
  ]);
  const rate = btcUsdt.price * usdtUsdc.price * usdcCad.price;
  if (!Number.isFinite(rate) || rate <= 0 || rate > 10_000_000) {
    throw new RateServiceError("invalid_rate", "The derived BTC/CAD reference could not be validated.");
  }
  const validTimes = [btcUsdt.time, usdtUsdc.time, usdcCad.time]
    .filter(value => typeof value === "string" && Number.isFinite(Date.parse(value)))
    .map(value => Date.parse(value));
  const timestamp = validTimes.length === 3
    ? new Date(Math.min(...validTimes)).toISOString()
    : now().toISOString();
  return {
    pair: "BTC-CAD",
    rate,
    asOf: timestamp,
    provider: "Coinbase Exchange",
    providerPairs: ["BTC-USDT", "USDT-USDC", "USDC-CAD"],
    providerUrl: "https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/products/get-product-ticker"
  };
}
