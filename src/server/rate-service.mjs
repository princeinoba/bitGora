const TICKER_URL = "https://api.exchange.coinbase.com/products/BTC-CAD/ticker";
const REQUEST_TIMEOUT_MS = 4_000;

export class RateServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "RateServiceError";
    this.code = code;
  }
}

export async function fetchBtcCadRate({ fetchFn = fetch, now = () => new Date() } = {}) {
  let response;
  try {
    response = await fetchFn(TICKER_URL, {
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
  const rate = Number(payload?.price);
  if (!Number.isFinite(rate) || rate <= 0 || rate > 10_000_000) {
    throw new RateServiceError("invalid_rate", "The BTC/CAD reference response could not be validated.");
  }
  const timestamp = typeof payload?.time === "string" && Number.isFinite(Date.parse(payload.time))
    ? new Date(payload.time).toISOString()
    : now().toISOString();
  return {
    pair: "BTC-CAD",
    rate,
    asOf: timestamp,
    provider: "Coinbase Exchange",
    providerUrl: "https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/products/get-product-ticker"
  };
}
