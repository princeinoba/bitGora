import { spawn } from "node:child_process";
import { once } from "node:events";
import assert from "node:assert/strict";
import { listings } from "../src/content/catalog.mjs";

const port = 4187;
const origin = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["scripts/dev-server.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port), MOCK_BTC_CAD_RATE: "100000" },
  stdio: ["ignore", "pipe", "pipe"]
});
let output = "";
child.stdout.on("data", chunk => { output += chunk; });
child.stderr.on("data", chunk => { output += chunk; });

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch { /* retry */ }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Server did not start.\n${output}`);
}

let assertions = 0;
function check(value, message) {
  assertions += 1;
  assert.ok(value, message);
}
async function get(path, options = {}) {
  return fetch(`${origin}${path}`, { redirect: "manual", ...options });
}

try {
  await waitForServer();

  const routes = [
    "/", "/market/", "/sell/", "/watchlist/", "/messages/", "/safety/", "/about/", "/privacy/",
    ...listings.map(item => `/market/${item.slug}/`)
  ];
  for (const route of routes) {
    const response = await get(route);
    check(response.status === 200, `${route} should return 200.`);
    const html = await response.text();
    check(html.includes('<main id="main"'), `${route} should render the application main.`);
    check(response.headers.get("content-security-policy")?.includes("default-src 'self'"), `${route} should include CSP.`);
  }

  const notFound = await get("/unknown-release-route");
  check(notFound.status === 404, "Unknown route should return 404.");
  check((await notFound.text()).includes("That listing is outside the demo market"), "Unknown route should render the designed 404.");

  const redirects = new Map([
    ["/login", "/"],
    ["/signup", "/"],
    ["/profile", "/about/"],
    ["/posts", "/market/"],
    ["/post", "/market/"],
    ["/chat", "/messages/"],
    ["/messages", "/messages/"],
    ["/sell", "/sell/"],
    ["/market", "/market/"]
  ]);
  for (const [source, target] of redirects) {
    const response = await get(source);
    check(response.status === 308, `${source} should permanently redirect.`);
    check(response.headers.get("location") === target, `${source} should redirect to ${target}.`);
  }

  const health = await get("/api/health");
  check(health.status === 200, "Health endpoint should return 200.");
  const healthData = await health.json();
  check(healthData.mode === "portfolio-demo", "Health endpoint should report portfolio-demo.");
  check(healthData.capabilities.payments === false, "Health endpoint should report no payments.");
  check(healthData.capabilities.custody === false, "Health endpoint should report no custody.");

  const rate = await get("/api/btc-rate");
  check(rate.status === 200, "Rate endpoint should return 200 in deterministic preview.");
  const rateData = await rate.json();
  check(rateData.pair === "BTC-CAD", "Rate endpoint should use BTC-CAD.");
  check(rateData.rate === 100000, "Rate endpoint should use deterministic release mock.");
  check(/not a quote/i.test(rateData.disclaimer), "Rate response should contain disclaimer.");

  const ratePost = await get("/api/btc-rate", { method: "POST" });
  check(ratePost.status === 405, "Rate endpoint should reject POST.");
  check(ratePost.headers.get("allow") === "GET", "Rate endpoint should advertise GET.");

  const healthPost = await get("/api/health", { method: "POST" });
  check(healthPost.status === 405, "Health endpoint should reject POST.");

  for (const path of ["/site.webmanifest", "/sw.js", "/robots.txt", "/sitemap.xml", "/.well-known/security.txt", "/assets/site.css", "/assets/site.js", "/assets/images/social-card.png"]) {
    const response = await get(path);
    check(response.status === 200, `${path} should return 200.`);
  }

  const root = await get("/");
  for (const header of ["content-security-policy", "permissions-policy", "referrer-policy", "x-content-type-options", "x-frame-options", "cross-origin-opener-policy"]) {
    check(Boolean(root.headers.get(header)), `Root should include ${header}.`);
  }
  check(root.headers.get("permissions-policy")?.includes("payment=()"), "Payment capability should be disabled.");
  check(root.headers.get("permissions-policy")?.includes("geolocation=()"), "Geolocation should be disabled.");

  const robots = await (await get("/robots.txt")).text();
  check(robots.includes("Disallow: /"), "Local release build should remain non-indexable.");

  console.log(`${assertions} HTTP release assertions passed.`);
} finally {
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), new Promise(resolve => setTimeout(resolve, 1_000))]);
}
