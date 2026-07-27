import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { listings, publicRoutes } from "../src/content/catalog.mjs";
import { demoThreads } from "../src/content/demo-messages.mjs";
import {
  aboutPage,
  homePage,
  listingPage,
  marketPage,
  messagesPage,
  notFoundPage,
  privacyPage,
  safetyPage,
  sellPage,
  watchlistPage
} from "../src/templates/pages.mjs";
import { routeFile } from "../src/templates/helpers.mjs";
import { DEMO_INDEXING_ENABLED, productionSiteOrigin } from "../src/templates/layout.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

async function write(relative, content) {
  const path = resolve(dist, relative);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(resolve(root, "src/static/assets"), resolve(dist, "assets"), { recursive: true });
await cp(resolve(root, "src/static/site.webmanifest"), resolve(dist, "site.webmanifest"));
await cp(resolve(root, "src/static/sw.js"), resolve(dist, "sw.js"));

const moduleCopies = [
  ["src/lib/catalog-utils.mjs", "assets/catalog-utils.js"],
  ["src/lib/seller-draft.mjs", "assets/seller-draft.js"],
  ["src/lib/message-core.mjs", "assets/message-core.js"]
];
for (const [source, target] of moduleCopies) {
  await cp(resolve(root, source), resolve(dist, target));
}

await write("assets/catalog-data.js", `export const listings = Object.freeze(${JSON.stringify(listings, null, 2)});\n`);
await write("assets/demo-messages-data.js", `export const demoThreads = Object.freeze(${JSON.stringify(demoThreads, null, 2)});\n`);

const documents = new Map([
  ["/", homePage()],
  ["/market/", marketPage()],
  ...listings.map(listing => [`/market/${listing.slug}/`, listingPage(listing)]),
  ["/sell/", sellPage()],
  ["/watchlist/", watchlistPage()],
  ["/messages/", messagesPage()],
  ["/safety/", safetyPage()],
  ["/about/", aboutPage()],
  ["/privacy/", privacyPage()]
]);
for (const [pathname, html] of documents) await write(routeFile(pathname), html);
await write("404.html", notFoundPage());

const origin = productionSiteOrigin();
const robots = DEMO_INDEXING_ENABLED && origin
  ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
  : "User-agent: *\nDisallow: /\n";
await write("robots.txt", robots);

const sitemap = DEMO_INDEXING_ENABLED && origin
  ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicRoutes.map(path => `  <url><loc>${origin}${path === "/" ? "/" : path}</loc></url>`).join("\n")}\n</urlset>\n`
  : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n`;
await write("sitemap.xml", sitemap);

await write(".well-known/security.txt", [
  "Contact: mailto:royceinoba@gmail.com",
  "Preferred-Languages: en",
  ...(origin ? [`Canonical: ${origin}/.well-known/security.txt`, "Policy: https://github.com/princeinoba/bitGora/security/policy"] : []),
  "Expires: 2027-07-26T00:00:00.000Z",
  ""
].join("\n"));

console.log(`Built ${documents.size + 1} HTML documents into ${dist}`);
