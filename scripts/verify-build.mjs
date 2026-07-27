import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import assert from "node:assert/strict";
import { listings, privateDemoRoutes, publicRoutes } from "../src/content/catalog.mjs";

const root = resolve(process.cwd());
const dist = resolve(root, "dist");
const failures = [];
const fail = message => failures.push(message);

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else result.push(path);
  }
  return result;
}

const files = await walk(dist);
const htmlFiles = files.filter(file => extname(file) === ".html");
const relativeFiles = new Set(files.map(file => `/${relative(dist, file).replaceAll("\\", "/")}`));
const htmlByPath = new Map();

function routeForFile(file) {
  const rel = relative(dist, file).replaceAll("\\", "/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return "/404/";
  return `/${rel.replace(/index\.html$/, "")}`;
}

function assetPathFromUrl(value) {
  const clean = value.split(/[?#]/)[0];
  if (clean === "/") return "/index.html";
  if (clean.endsWith("/")) return `${clean}index.html`;
  if (!extname(clean)) return `${clean}/index.html`;
  return clean;
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const route = routeForFile(file);
  htmlByPath.set(route, html);

  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1]?.trim();
  if (!title) fail(`${route} has no title.`);
  if (!description || description.length < 40) fail(`${route} has an incomplete description.`);
  if ([...html.matchAll(/<main\b/gi)].length !== 1) fail(`${route} must have exactly one main.`);
  if ([...html.matchAll(/<h1\b/gi)].length !== 1) fail(`${route} must have exactly one h1.`);
  if (!/<a class="skip-link" href="#main">/i.test(html)) fail(`${route} is missing the skip link.`);
  if (/<a\b[^>]*href=""|<a\b[^>]*href="\s+"/i.test(html)) fail(`${route} contains an empty anchor.`);
  if (/on(?:click|change|submit|load|error)\s*=/i.test(html)) fail(`${route} contains an inline event handler.`);

  for (const match of html.matchAll(/<img\b([^>]+)>/gi)) {
    const attrs = match[1];
    if (!/\balt="[^"]*"/i.test(attrs)) fail(`${route} has an image without alt text.`);
    if (!/\bwidth="\d+"/i.test(attrs) || !/\bheight="\d+"/i.test(attrs)) fail(`${route} has an image without width/height.`);
  }

  for (const match of html.matchAll(/<(?:a|link|script|img)\b[^>]*(?:href|src)="([^"]+)"/gi)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|#|data:)/i.test(value)) continue;
    if (!value.startsWith("/")) continue;
    if (value.startsWith("/api/")) continue;
    const target = assetPathFromUrl(value);
    if (!relativeFiles.has(target)) fail(`${route} references missing local target ${value} (${target}).`);
  }

  const robot = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] || "";
  if (!robot.startsWith("noindex")) {
    fail(`${route} must be noindex while demonstration indexing is disabled.`);
  }
}

if (htmlFiles.length !== 21) fail(`Expected 21 HTML documents; found ${htmlFiles.length}.`);
for (const path of [...publicRoutes, ...privateDemoRoutes, "/404/"]) {
  if (!htmlByPath.has(path)) fail(`Missing generated route ${path}.`);
}

const titles = htmlFiles.map(file => readFile(file, "utf8").then(html => html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim()));
const resolvedTitles = await Promise.all(titles);
if (new Set(resolvedTitles).size !== resolvedTitles.length) fail("Generated titles are not unique.");

const textOutput = await Promise.all(files.filter(file => [".html", ".js", ".css", ".json", ".webmanifest", ".txt", ".xml", ".svg"].includes(extname(file))).map(file => readFile(file, "utf8")));
const combined = textOutput.join("\n");
const banned = [
  ["fdhs397y2y539n", "historical session secret"],
  ["api.coindesk.com", "obsolete Coindesk endpoint"],
  ["herokuapp.com", "obsolete Heroku endpoint"],
  ["localhost:4000", "hard-coded development API"],
  ["mongodb://", "database endpoint"],
  ["mongodb+srv://", "database endpoint"],
  ["React App", "stale CRA identity"],
  ["Create React App Sample", "stale manifest identity"]
];
for (const [needle, label] of banned) if (combined.includes(needle)) fail(`Generated output contains ${label}.`);

const robotsPolicy = await readFile(join(dist, "robots.txt"), "utf8");
if (!robotsPolicy.includes("Disallow: /") || robotsPolicy.includes("Allow: /")) fail("Demonstration robots policy must disallow crawling.");
const sitemapPolicy = await readFile(join(dist, "sitemap.xml"), "utf8");
if (/<url>/i.test(sitemapPolicy)) fail("Demonstration sitemap must remain empty.");
const manifest = JSON.parse(await readFile(join(dist, "site.webmanifest"), "utf8"));
if (manifest.name !== "BitGora Market Lab") fail("Manifest identity is incorrect.");
if (!manifest.icons?.some(icon => icon.sizes === "192x192") || !manifest.icons?.some(icon => icon.sizes === "512x512")) fail("Manifest icons are incomplete.");
if (manifest.start_url !== "/" || manifest.scope !== "/" || manifest.display !== "standalone") fail("Manifest installability fields are incomplete.");

const sw = await readFile(join(dist, "sw.js"), "utf8");
for (const required of ["install", "activate", "fetch", "CACHE_NAME", "self.skipWaiting", "clients.claim"]) {
  if (!sw.includes(required)) fail(`Service worker is missing ${required}.`);
}
if (/coinbase|api\/btc-rate/i.test(sw)) fail("Service worker must not cache live market-data API responses.");

const vercel = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
if (vercel.framework !== null) fail("Vercel framework must be Other/null.");
if (vercel.installCommand !== "npm ci --ignore-scripts") fail("Vercel install command is not deterministic.");
if (vercel.buildCommand !== "npm run build" || vercel.outputDirectory !== "dist") fail("Vercel build/output settings are incorrect.");
const headerValues = vercel.headers?.flatMap(rule => rule.headers || []).reduce((map, item) => (map[item.key.toLowerCase()] = item.value, map), {}) || {};
for (const required of ["content-security-policy", "strict-transport-security", "x-content-type-options", "x-frame-options", "permissions-policy", "referrer-policy"]) {
  if (!headerValues[required]) fail(`Vercel configuration is missing ${required}.`);
}
const csp = headerValues["content-security-policy"] || "";
for (const directive of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "connect-src 'self'", "object-src 'none'", "frame-ancestors 'none'"]) {
  if (!csp.includes(directive)) fail(`CSP is missing ${directive}.`);
}
if (/unsafe-inline|unsafe-eval|\*/i.test(csp)) fail("CSP contains an unsafe wildcard or inline/eval allowance.");

for (const api of ["api/btc-rate.js", "api/health.js"]) {
  try { await stat(join(root, api)); } catch { fail(`Missing Vercel Function ${api}.`); }
}

const totalBytes = files.reduce((sum, file) => sum + (relativeFiles.has(`/${relative(dist, file).replaceAll("\\", "/")}`) ? 0 : 0), 0);
const sizes = await Promise.all(files.map(async file => ({ file, size: (await stat(file)).size })));
const total = sizes.reduce((sum, item) => sum + item.size, 0);
const js = sizes.filter(item => extname(item.file) === ".js").reduce((sum, item) => sum + item.size, 0);
const css = sizes.filter(item => extname(item.file) === ".css").reduce((sum, item) => sum + item.size, 0);
if (total > 1_500_000) fail(`Output budget exceeded: ${total} bytes.`);
if (js > 120_000) fail(`JavaScript budget exceeded: ${js} bytes.`);
if (css > 60_000) fail(`CSS budget exceeded: ${css} bytes.`);

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join("\n"));
  process.exit(1);
}

console.log(`Verified ${htmlFiles.length} HTML documents and ${files.length} total files.`);
console.log(`Output: ${total} bytes; browser JavaScript: ${js} bytes; CSS: ${css} bytes.`);
