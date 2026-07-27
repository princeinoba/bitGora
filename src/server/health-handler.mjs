export function handleHealth(request) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: { code: "method_not_allowed", message: "Use GET for this endpoint." } }), {
      status: 405,
      headers: { "content-type": "application/json; charset=utf-8", allow: "GET", "cache-control": "no-store" }
    });
  }
  return Response.json({
    status: "ok",
    product: "BitGora",
    mode: "portfolio-demo",
    capabilities: {
      marketplaceListings: "fictional-static",
      sellerDrafts: "browser-local",
      messages: "synthetic-browser-local",
      walletConnection: false,
      payments: false,
      custody: false,
      marketReference: "on-demand-read-only"
    }
  }, { headers: { "cache-control": "no-store", "x-robots-tag": "noindex" } });
}
