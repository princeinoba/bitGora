import { fetchBtcCadRate, RateServiceError } from "./rate-service.mjs";

const commonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex"
};

export async function handleBtcRate(request, options = {}) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: { code: "method_not_allowed", message: "Use GET for this endpoint." } }), {
      status: 405,
      headers: { ...commonHeaders, allow: "GET", "cache-control": "no-store" }
    });
  }
  try {
    const data = await fetchBtcCadRate(options);
    return new Response(JSON.stringify({
      status: "ok",
      ...data,
      disclaimer: "Indicative market reference only—not a quote, payment request or financial recommendation."
    }), { status: 200, headers: commonHeaders });
  } catch (error) {
    const known = error instanceof RateServiceError;
    return new Response(JSON.stringify({
      status: "unavailable",
      error: {
        code: known ? error.code : "rate_unavailable",
        message: "A current BTC/CAD estimate is unavailable. BitGora continues to display BTC prices."
      }
    }), {
      status: 503,
      headers: { ...commonHeaders, "cache-control": "no-store", "retry-after": "60" }
    });
  }
}
