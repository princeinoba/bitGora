import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { handleHealth } from "../src/server/health-handler.mjs";

const root = resolve(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const mockRate = Number(process.env.MOCK_BTC_CAD_RATE || 100_000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

const redirects = new Map([
  ["/login", "/"],
  ["/login/", "/"],
  ["/signup", "/"],
  ["/signup/", "/"],
  ["/profile", "/about/"],
  ["/profile/", "/about/"],
  ["/posts", "/market/"],
  ["/posts/", "/market/"],
  ["/post", "/market/"],
  ["/post/", "/market/"],
  ["/chat", "/messages/"],
  ["/chat/", "/messages/"],
  ["/messages", "/messages/"],
  ["/sell", "/sell/"],
  ["/market", "/market/"]
]);

const securityHeaders = {
  "content-security-policy": "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; manifest-src 'self'; worker-src 'self'; frame-src 'none'",
  "permissions-policy": "geolocation=(), camera=(), microphone=(), payment=(), usb=(), browsing-topics=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "cross-origin-opener-policy": "same-origin"
};

function applyHeaders(response, extra = {}) {
  for (const [key, value] of Object.entries({ ...securityHeaders, ...extra })) response.setHeader(key, value);
}

async function sendFetchResponse(nodeResponse, response) {
  nodeResponse.statusCode = response.status;
  for (const [key, value] of response.headers) nodeResponse.setHeader(key, value);
  applyHeaders(nodeResponse);
  nodeResponse.end(Buffer.from(await response.arrayBuffer()));
}

async function fileFor(pathname) {
  let candidate = decodeURIComponent(pathname);
  if (candidate.endsWith("/")) candidate += "index.html";
  else if (!extname(candidate)) candidate += "/index.html";
  candidate = normalize(candidate).replace(/^(\.\.(\/|\\|$))+/, "");
  const path = join(root, candidate);
  if (!path.startsWith(root)) return null;
  try {
    const info = await stat(path);
    return info.isFile() ? path : null;
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);
  const redirect = redirects.get(url.pathname);
  if (redirect) {
    applyHeaders(response, { location: redirect, "cache-control": "no-store" });
    response.statusCode = 308;
    response.end();
    return;
  }

  if (url.pathname === "/api/health") {
    await sendFetchResponse(response, handleHealth(new Request(url, { method: request.method })));
    return;
  }

  if (url.pathname === "/api/btc-rate") {
    if (request.method !== "GET") {
      applyHeaders(response, { "content-type": "application/json; charset=utf-8", allow: "GET", "cache-control": "no-store" });
      response.statusCode = 405;
      response.end(JSON.stringify({ error: { code: "method_not_allowed", message: "Use GET for this endpoint." } }));
      return;
    }
    applyHeaders(response, { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=60" });
    response.end(JSON.stringify({
      status: "ok",
      pair: "BTC-CAD",
      rate: mockRate,
      asOf: new Date("2026-07-26T12:00:00.000Z").toISOString(),
      provider: "Local deterministic release mock",
      disclaimer: "Indicative market reference only—not a quote, payment request or financial recommendation."
    }));
    return;
  }

  const file = await fileFor(url.pathname);
  if (file) {
    applyHeaders(response, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "cache-control": file.endsWith("sw.js") ? "no-cache" : file.includes(`${join("assets", "")}`) ? "public, max-age=3600" : "public, max-age=0, must-revalidate"
    });
    response.end(await readFile(file));
    return;
  }

  applyHeaders(response, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  response.statusCode = 404;
  response.end(await readFile(join(root, "404.html")));
});

server.listen(port, host, () => console.log(`BitGora preview: http://${host}:${port}`));
