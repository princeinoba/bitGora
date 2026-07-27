import { listings, categories, conditions } from "../content/catalog.mjs";
import { demoThreads } from "../content/demo-messages.mjs";
import { button, escapeHtml, formatBtc, icon, listingCard } from "./helpers.mjs";
import { renderDocument } from "./layout.mjs";
import { relatedListings } from "../lib/catalog-utils.mjs";

const featured = listings.filter(item => item.status === "available").slice(0, 6);

function sectionHead(eyebrow, title, copy = "", action = "") {
  return `<div class="section-head"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2>${escapeHtml(title)}</h2>${copy ? `<p>${escapeHtml(copy)}</p>` : ""}</div>${action}</div>`;
}

function ratePanel() {
  return `<section class="rate-panel" aria-labelledby="rate-panel-title">
    <div class="rate-panel__head"><span class="rate-panel__icon">${icon("bitcoin")}</span><div><p class="eyebrow">Read-only market reference</p><h2 id="rate-panel-title">BTC to Canadian dollars</h2></div></div>
    <output class="rate-panel__value" data-rate-output>Current estimate unavailable</output>
    <p data-rate-message>Load a current reference through BitGora’s same-origin Vercel Function. The result is indicative only.</p>
    <div class="rate-panel__actions"><button class="button button--primary" type="button" data-rate-refresh>Load current reference${icon("refresh")}</button><span data-rate-time></span></div>
    <form class="converter" data-converter>
      <label><span>Bitcoin amount</span><input type="number" min="0" max="10" step="0.00000001" value="0.001" data-converter-input></label>
      <div><span>Indicative CAD</span><output data-converter-output>Unavailable</output></div>
    </form>
  </section>`;
}

export function homePage() {
  const main = `<main id="main" tabindex="-1">
    <section class="hero hero--home">
      <div class="shell hero__grid">
        <div class="hero__copy">
          <p class="eyebrow">Bitcoin-priced local exchange · portfolio demo</p>
          <h1>Explore value in BTC.<br><span>Keep the exchange human.</span></h1>
          <p class="hero__lede">BitGora reimagines the original marketplace as a transparent, non-custodial product demonstration: fictional listings, local-first tools, safer inquiry planning and no connected wallet.</p>
          <div class="button-row">${button({ href: "/market/", label: "Explore demo listings", iconName: "arrow" })}${button({ href: "/safety/", label: "Understand the safety model", iconName: "shield", variant: "secondary" })}</div>
          <ul class="hero-proof">
            <li>${icon("check")}<span>No wallet connection</span></li>
            <li>${icon("check")}<span>No public posting</span></li>
            <li>${icon("check")}<span>No real chat or payment</span></li>
          </ul>
        </div>
        ${ratePanel()}
      </div>
    </section>
    <section class="trust-strip" aria-label="Product boundaries"><div class="shell trust-grid">
      <div><strong>12</strong><span>fictional demo listings</span></div>
      <div><strong>0</strong><span>custodied funds or wallets</span></div>
      <div><strong>Local</strong><span>watchlist, drafts and messages</span></div>
      <div><strong>Read-only</strong><span>optional BTC/CAD reference</span></div>
    </div></section>
    <section class="section shell">
      ${sectionHead("Marketplace preview", "Browse a deliberately small, coherent catalogue", "Search, compare and save fictional goods without creating an account or exposing personal information.", `<a class="text-link" href="/market/">View all listings ${icon("arrow")}</a>`)}
      <div class="listing-grid">${featured.map(item => listingCard(item)).join("")}</div>
    </section>
    <section class="section section--tint">
      <div class="shell">
        ${sectionHead("Product journey", "From discovery to a safer local plan", "The rebuilt experience connects the steps that were fragmented across login, dashboard, posts and chat.")}
        <ol class="journey-grid">
          <li><span>01</span>${icon("search")}<h3>Discover</h3><p>Search and filter a complete fictional market without signing in.</p></li>
          <li><span>02</span>${icon("heart")}<h3>Shortlist</h3><p>Save items locally on the device—no account or tracking required.</p></li>
          <li><span>03</span>${icon("message")}<h3>Prepare</h3><p>Draft clear questions or explore a synthetic conversation before any real-world exchange.</p></li>
          <li><span>04</span>${icon("shield")}<h3>Verify</h3><p>Use a safety checklist before considering an irreversible Bitcoin payment.</p></li>
        </ol>
      </div>
    </section>
    <section class="section shell split-feature">
      <div>
        <p class="eyebrow">Seller workflow</p>
        <h2>Build a listing draft without publishing it</h2>
        <p>The local Sell Studio validates title, condition, broad region, BTC price and description, then keeps the draft in this browser for 24 hours. It never uploads an image, address or wallet.</p>
        <div class="button-row">${button({ href: "/sell/", label: "Open the local Sell Studio", iconName: "plus" })}${button({ href: "/privacy/", label: "Review local data handling", iconName: "lock", variant: "secondary" })}</div>
      </div>
      <div class="studio-preview" aria-label="Illustration of a local listing draft">
        <div class="studio-preview__window"><div class="studio-preview__bar"><span></span><span></span><span></span></div><div class="studio-preview__body"><span class="preview-badge">Local draft</span><div class="preview-line preview-line--wide"></div><div class="preview-line"></div><div class="preview-media">${icon("tag","icon icon--xl")}</div><div class="preview-button"></div></div></div>
      </div>
    </section>
    <section class="section safety-band"><div class="shell safety-band__inner">
      <div>${icon("shield","icon icon--xl")}<p class="eyebrow">No escrow. No custody. No guarantees.</p><h2>Bitcoin payments can be irreversible.</h2><p>BitGora does not verify sellers, inspect goods, hold funds or mediate disputes. The demo teaches verification-first behaviour instead of presenting a false checkout flow.</p></div>
      ${button({ href: "/safety/", label: "Open the safer exchange guide", iconName: "arrow", variant: "light" })}
    </div></section>
  </main>`;
  return renderDocument({
    title: "BitGora — Bitcoin-priced marketplace concept",
    description: "Explore a modern, non-custodial Bitcoin-priced marketplace demonstration with fictional listings, local drafts, saved items and safety-first exchange planning.",
    path: "/", page: "home", main, bodyClass: "home-page"
  });
}

export function marketPage() {
  const categoryOptions = categories.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  const conditionOptions = conditions.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  const main = `<main id="main" tabindex="-1">
    <header class="page-hero page-hero--market"><div class="shell page-hero__grid"><div><p class="eyebrow">Fictional catalogue</p><h1>Explore the BitGora market</h1><p>Every listing and seller is synthetic. Use the catalogue to test discovery, comparison and exchange-planning flows—not to buy a real product.</p></div><div class="page-hero__badge">${icon("shield")}<strong>No live commerce</strong><span>BTC prices · no checkout</span></div></div></header>
    <section class="section shell market-layout">
      <aside class="filter-panel" aria-labelledby="filter-title">
        <div class="filter-panel__head"><div><p class="eyebrow">Refine</p><h2 id="filter-title">Find a listing</h2></div><button type="button" class="text-button" data-filter-reset>Reset</button></div>
        <label class="search-field"><span>Search</span><span class="input-shell">${icon("search")}<input type="search" data-market-search autocomplete="off" placeholder="Title, feature or region"></span></label>
        <label><span>Category</span><select data-market-category><option value="all">All categories</option>${categoryOptions}</select></label>
        <label><span>Condition</span><select data-market-condition><option value="all">All conditions</option>${conditionOptions}</select></label>
        <label><span>Status</span><select data-market-status><option value="available">Available demo listings</option><option value="all">All statuses</option><option value="sold">Sold demo listings</option></select></label>
        <label><span>Maximum BTC price</span><input type="number" min="0" max="10" step="0.00001" data-market-max-price placeholder="No maximum"></label>
        <label><span>Sort</span><select data-market-sort><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="condition">Condition</option><option value="title">Title</option></select></label>
        <div class="filter-note">${icon("bitcoin")}<p>CAD values are optional estimates. Listings remain denominated in BTC.</p></div>
      </aside>
      <div class="market-results">
        <div class="results-toolbar"><p aria-live="polite"><strong data-market-count>${listings.filter(item => item.status === "available").length}</strong> demo listings shown</p><div class="view-toggle" aria-label="Listing view"><button type="button" data-view="grid" aria-pressed="true" aria-label="Grid view">${icon("grid")}</button><button type="button" data-view="list" aria-pressed="false" aria-label="List view">${icon("list")}</button></div></div>
        <div class="listing-grid" data-market-grid>${listings.map(item => listingCard(item)).join("")}</div>
        <div class="empty-state" data-market-empty hidden>${icon("search","empty-state__icon")}<h2>No demo listings match those filters.</h2><p>Clear one or more filters to return to the fictional catalogue.</p><button class="button button--primary" type="button" data-filter-reset>Reset filters${icon("refresh")}</button></div>
      </div>
    </section>
  </main>`;
  return renderDocument({
    title: "Demo marketplace — BitGora",
    description: "Search and filter twelve fictional Bitcoin-priced listings in the rebuilt BitGora marketplace concept.",
    path: "/market/", page: "market", main, scripts: ["/assets/market.js"], bodyClass: "market-page",
    structuredData: { "@context": "https://schema.org", "@type": "ItemList", name: "BitGora fictional demo listings", numberOfItems: listings.length, description: "A portfolio demonstration catalogue; no real goods are offered." }
  });
}

export function listingPage(listing) {
  const related = relatedListings(listings, listing, 3);
  const main = `<main id="main" tabindex="-1">
    <nav class="breadcrumbs shell" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/market/">Market</a><span>/</span><span aria-current="page">${escapeHtml(listing.title)}</span></nav>
    <section class="listing-detail shell" data-listing-id="${escapeHtml(listing.id)}">
      <div class="listing-detail__media"><img src="/assets/images/${escapeHtml(listing.image)}" alt="${escapeHtml(listing.imageAlt)}" width="960" height="720" fetchpriority="high"><span class="status-pill status-pill--${escapeHtml(listing.status)}">${listing.status === "sold" ? "Sold demo" : "Available demo"}</span></div>
      <div class="listing-detail__content">
        <p class="eyebrow">${escapeHtml(listing.category)} · ${escapeHtml(listing.condition)}</p>
        <h1>${escapeHtml(listing.title)}</h1>
        <p class="listing-detail__summary">${escapeHtml(listing.summary)}</p>
        <div class="price-block"><strong>${formatBtc(listing.btcPrice)}</strong><span data-cad-estimate data-btc-price="${listing.btcPrice}">Load the BTC/CAD reference for an indicative estimate</span></div>
        <dl class="listing-facts"><div><dt>Broad region</dt><dd>${escapeHtml(listing.region)}</dd></div><div><dt>Seller</dt><dd>${escapeHtml(listing.sellerAlias)} · fictional</dd></div><div><dt>Status</dt><dd>${listing.status === "sold" ? "Unavailable demo listing" : "Available in this demo"}</dd></div><div><dt>Exchange ideas</dt><dd>${listing.exchangeMethods.map(escapeHtml).join(" · ")}</dd></div></dl>
        <div class="button-row">
          <button class="button button--primary" type="button" data-inquiry-open ${listing.status === "sold" ? "disabled" : ""}>Draft an inquiry${icon("message")}</button>
          <button class="button button--secondary" type="button" data-watchlist-toggle="${escapeHtml(listing.id)}" aria-pressed="false">Save to watchlist${icon("heart")}</button>
        </div>
        <p class="fine-print">${escapeHtml(listing.postedLabel)}. No real product, seller or transaction exists.</p>
      </div>
      <aside class="listing-safety"><p class="eyebrow">Before any real exchange</p><h2>Verify first</h2><ul class="check-list"><li>${icon("check")}Inspect the item and ownership.</li><li>${icon("check")}Use a public, daylight meeting location.</li><li>${icon("check")}Never send a deposit because of pressure.</li><li>${icon("check")}Confirm the BTC amount immediately before paying.</li></ul><a class="text-link" href="/safety/">Read the full safety guide ${icon("arrow")}</a></aside>
    </section>
    <section class="section section--tint"><div class="shell detail-grid"><div><p class="eyebrow">Listing details</p><h2>What the demo record includes</h2><p>${escapeHtml(listing.description)}</p></div><ul class="feature-list">${listing.features.map(feature => `<li>${icon("check")}<span>${escapeHtml(feature)}</span></li>`).join("")}</ul></div></section>
    <section class="section shell">${sectionHead("Related demos","Continue exploring","Related items are selected from the same fictional catalogue.")}<div class="listing-grid">${related.map(item => listingCard(item,{compact:true})).join("")}</div></section>
    <dialog class="inquiry-dialog" data-inquiry-dialog aria-labelledby="inquiry-title">
      <form method="dialog" class="inquiry-dialog__surface" data-inquiry-form data-listing-title="${escapeHtml(listing.title)}">
        <div class="dialog-head"><div><p class="eyebrow">Local inquiry draft</p><h2 id="inquiry-title">Prepare questions for ${escapeHtml(listing.title)}</h2></div><button class="icon-button" value="cancel" aria-label="Close inquiry draft">${icon("close")}</button></div>
        <p>This text stays in your browser. BitGora does not send it to a seller.</p>
        <fieldset><legend>Include verification questions</legend>
          <label class="check-control"><input type="checkbox" name="question" value="Could you confirm the item’s current condition and any defects?" checked><span>Condition and defects</span></label>
          <label class="check-control"><input type="checkbox" name="question" value="Can we inspect and test the item before discussing payment?" checked><span>Inspection and testing</span></label>
          <label class="check-control"><input type="checkbox" name="question" value="Can we meet in a public location without a deposit?" checked><span>Public meeting, no deposit</span></label>
        </fieldset>
        <label><span>Optional note</span><textarea name="note" maxlength="300" rows="4" placeholder="Add a short, non-sensitive note."></textarea></label>
        <label><span>Prepared text</span><textarea data-inquiry-output rows="8" readonly></textarea></label>
        <p class="form-status" data-inquiry-status aria-live="polite"></p>
        <div class="button-row"><button class="button button--primary" type="button" data-inquiry-copy>Copy draft${icon("copy")}</button><button class="button button--ghost" value="cancel">Close</button></div>
      </form>
    </dialog>
  </main>`;
  return renderDocument({
    title: `${listing.title} — BitGora demo`,
    description: `${listing.summary} Fictional Bitcoin-priced marketplace listing for the BitGora portfolio demonstration.`,
    path: `/market/${listing.slug}/`, page: "market", main, scripts: ["/assets/listing.js"], bodyClass: "listing-page"
  });
}

export function sellPage() {
  const categoryOptions = [...categories, "Other"].map(value => `<option>${escapeHtml(value)}</option>`).join("");
  const conditionOptions = ["New","Like new","Excellent","Good","Tested"].map(value => `<option>${escapeHtml(value)}</option>`).join("");
  const main = `<main id="main" tabindex="-1">
    <header class="page-hero"><div class="shell page-hero__grid"><div><p class="eyebrow">Browser-local seller workflow</p><h1>Build a listing draft</h1><p>Validate and preview a fictional listing without creating an account, uploading an image or publishing anything.</p></div><div class="page-hero__badge">${icon("lock")}<strong>Local for 24 hours</strong><span>No server or public feed</span></div></div></header>
    <section class="section shell studio-layout">
      <form class="studio-form" data-seller-form novalidate>
        <div class="form-intro"><h2>Listing information</h2><p>Use a broad region only. Never add an address, wallet, email or telephone number.</p></div>
        <div class="error-summary" data-error-summary tabindex="-1" hidden><h3>Review the highlighted fields</h3><ul></ul></div>
        <label><span>Listing title</span><input name="title" maxlength="90" autocomplete="off" required><small>4–90 characters</small><span class="field-error" data-error-for="title"></span></label>
        <div class="form-grid"><label><span>Category</span><select name="category">${categoryOptions}</select><span class="field-error" data-error-for="category"></span></label><label><span>Condition</span><select name="condition">${conditionOptions}</select><span class="field-error" data-error-for="condition"></span></label></div>
        <div class="form-grid"><label><span>Broad city or region</span><input name="region" maxlength="80" placeholder="Ottawa, ON"><span class="field-error" data-error-for="region"></span></label><label><span>Price in BTC</span><input name="btcPrice" type="number" min="0.00000001" max="10" step="0.00000001"><span class="field-error" data-error-for="btcPrice"></span></label></div>
        <label><span>Description</span><textarea name="description" maxlength="700" rows="7" placeholder="Describe condition, included items and anything a buyer should verify."></textarea><small>20–700 characters</small><span class="field-error" data-error-for="description"></span></label>
        <p class="form-status" data-seller-status aria-live="polite"></p>
        <div class="button-row"><button class="button button--primary" type="submit">Save local draft${icon("lock")}</button><button class="button button--secondary" type="button" data-export-draft>Export JSON${icon("download")}</button><button class="button button--ghost" type="button" data-clear-draft>Clear</button></div>
      </form>
      <aside class="draft-preview" aria-labelledby="draft-preview-title"><p class="eyebrow">Preview only</p><h2 id="draft-preview-title">Your draft card</h2><article class="listing-card listing-card--preview" data-draft-preview><div class="listing-card__media draft-media">${icon("tag","icon icon--xl")}<span class="status-pill status-pill--available">Local draft</span></div><div class="listing-card__body"><div class="listing-card__meta"><span data-preview-category>Category</span><span data-preview-condition>Condition</span></div><h3 data-preview-title>Untitled listing</h3><p data-preview-description>Your description will appear here.</p><div class="listing-card__location">${icon("map")}<span data-preview-region>Broad region</span></div><div class="listing-card__footer"><div><strong data-preview-price>0 BTC</strong><span>Not published</span></div></div></div></article><div class="privacy-card">${icon("shield")}<div><h3>What never leaves this page</h3><p>The draft is kept in scoped local storage, expires after 24 hours and is not sent to BitGora or another service.</p></div></div></aside>
    </section>
  </main>`;
  return renderDocument({
    title: "Local Sell Studio — BitGora",
    description: "Create and export a browser-local fictional listing draft without publishing personal information or connecting a marketplace backend.",
    path: "/sell/", page: "sell", main, scripts: ["/assets/sell.js"], bodyClass: "sell-page", noIndex: true
  });
}

export function watchlistPage() {
  const main = `<main id="main" tabindex="-1">
    <header class="page-hero"><div class="shell page-hero__grid"><div><p class="eyebrow">Device-local shortlist</p><h1>Your watchlist</h1><p>Saved listing IDs remain in this browser. No account, profile or behavioural analytics are created.</p></div><div class="page-hero__badge">${icon("heart")}<strong>Private by default</strong><span>Scoped local storage</span></div></div></header>
    <section class="section shell">
      <div class="results-toolbar"><p aria-live="polite"><strong data-watchlist-count>0</strong> saved demo listings</p><button class="text-button" type="button" data-watchlist-clear>Clear watchlist</button></div>
      <div class="listing-grid" data-watchlist-grid></div>
      <div class="empty-state" data-watchlist-empty>${icon("heart","empty-state__icon")}<h2>No listings are saved on this device.</h2><p>Use the Save control on a market card, then return here.</p>${button({href:"/market/",label:"Explore the demo market",iconName:"arrow"})}</div>
      <noscript><div class="empty-state"><p>JavaScript is required only to read this device’s local watchlist. Every market page remains available without it.</p></div></noscript>
    </section>
  </main>`;
  return renderDocument({
    title: "Watchlist — BitGora",
    description: "Review fictional BitGora listings saved locally on this device.",
    path: "/watchlist/", page: "watchlist", main, scripts: ["/assets/watchlist.js"], bodyClass: "watchlist-page", noIndex: true
  });
}

export function messagesPage() {
  const threadButtons = demoThreads.map((thread,index) => `<button class="thread-button" type="button" data-thread-id="${thread.id}" aria-pressed="${index===0?"true":"false"}"><span class="thread-avatar" aria-hidden="true">${thread.counterparty.at(-2).replace(/\D/g,"") || "D"}</span><span><strong>${escapeHtml(thread.counterparty)}</strong><small>${escapeHtml(thread.title)}</small></span></button>`).join("");
  const main = `<main id="main" tabindex="-1">
    <header class="page-hero"><div class="shell page-hero__grid"><div><p class="eyebrow">Synthetic conversation workspace</p><h1>Demo messages</h1><p>Explore the information architecture of marketplace chat without sockets, user accounts or real people.</p></div><div class="page-hero__badge">${icon("message")}<strong>Browser-only</strong><span>Nothing is delivered</span></div></div></header>
    <section class="section shell messages-layout" data-messages-app>
      <aside class="thread-list" aria-label="Demo conversations"><div class="thread-list__head"><div><p class="eyebrow">Conversations</p><h2>Fictional threads</h2></div><button class="icon-button" type="button" data-messages-reset aria-label="Reset demo conversations">${icon("refresh")}</button></div>${threadButtons}</aside>
      <section class="conversation-panel" aria-labelledby="conversation-title"><header class="conversation-head"><div><p class="eyebrow">Synthetic seller</p><h2 id="conversation-title" data-conversation-title></h2><p data-conversation-subtitle></p></div><a class="text-link" data-conversation-listing href="/market/">View listing ${icon("arrow")}</a></header><ol class="message-list" data-message-list aria-live="polite"></ol><form class="message-composer" data-message-form><label><span class="sr-only">Add a local demo message</span><textarea name="message" maxlength="500" rows="3" placeholder="Write a local demo reply…"></textarea></label><button class="button button--primary" type="submit">Add locally${icon("message")}</button><p class="form-status" data-message-status aria-live="polite"></p></form></section>
    </section>
    <section class="section shell"><div class="privacy-card privacy-card--wide">${icon("shield","icon icon--xl")}<div><h2>This is not end-to-end messaging</h2><p>The original application accepted unauthenticated room and sender data over HTTP and Socket.IO. This replacement keeps fictional messages in scoped browser storage so the interface can be evaluated without impersonation, data retention or moderation risk.</p></div></div></section>
  </main>`;
  return renderDocument({
    title: "Synthetic messages — BitGora",
    description: "Explore a browser-only marketplace messaging concept with fictional conversations and no real delivery.",
    path: "/messages/", page: "messages", main, scripts: ["/assets/messages.js"], bodyClass: "messages-page", noIndex: true
  });
}

export function safetyPage() {
  const main = `<main id="main" tabindex="-1">
    <header class="page-hero page-hero--safety"><div class="shell page-hero__grid"><div><p class="eyebrow">Verification before payment</p><h1>A safer exchange starts before the meetup</h1><p>Bitcoin payments may be irreversible. BitGora does not verify identities, inspect goods, hold funds, offer escrow or resolve disputes.</p></div><div class="page-hero__badge">${icon("alert")}<strong>No guarantees</strong><span>Education, not financial advice</span></div></div></header>
    <section class="section shell">
      ${sectionHead("Exchange checklist","Slow down the irreversible step","Use this framework for any real peer-to-peer marketplace—not as a guarantee of safety.")}
      <div class="safety-grid">
        <article><span>01</span>${icon("user")}<h2>Verify the person and item</h2><ul><li>Ask for condition, ownership and serial-number details where appropriate.</li><li>Inspect and test the item before discussing payment.</li><li>Walk away when facts change or pressure increases.</li></ul></article>
        <article><span>02</span>${icon("map")}<h2>Plan a public handoff</h2><ul><li>Choose a staffed, daylight location.</li><li>Tell a trusted person where you are going.</li><li>Avoid sharing a home address unnecessarily.</li></ul></article>
        <article><span>03</span>${icon("bitcoin")}<h2>Confirm the exact amount</h2><ul><li>Use an independent, current market reference.</li><li>Confirm network fees and the intended amount immediately before payment.</li><li>Never treat an indicative CAD estimate as a locked quote.</li></ul></article>
        <article><span>04</span>${icon("shield")}<h2>Protect against pressure</h2><ul><li>Do not send a deposit to “hold” an item.</li><li>Do not install remote-access software.</li><li>Do not share recovery phrases, private keys or authentication codes.</li></ul></article>
      </div>
    </section>
    <section class="section section--tint"><div class="shell red-flags"><div><p class="eyebrow">Common red flags</p><h2>Leave the conversation when…</h2></div><ul><li>${icon("alert")}The seller refuses inspection or changes the item.</li><li>${icon("alert")}You are pushed to pay before meeting.</li><li>${icon("alert")}A third party claims to “guarantee” escrow outside a trusted platform.</li><li>${icon("alert")}Someone asks for a seed phrase, private key or one-time code.</li><li>${icon("alert")}The price or urgency is inconsistent with the story.</li></ul></div></section>
    <section class="section shell"><div class="safety-disclaimer">${icon("shield","icon icon--xl")}<div><h2>BitGora’s current boundary</h2><p>This deployment is a portfolio demonstration. It does not create buyer or seller identities, perform KYC, moderate public content, connect a wallet, broadcast transactions, hold funds, provide custody or create a legally binding marketplace agreement.</p><div class="button-row">${button({href:"/about/",label:"Read the architecture decision",iconName:"arrow"})}${button({href:"/market/",label:"Return to the demo market",iconName:"search",variant:"secondary"})}</div></div></div></section>
  </main>`;
  return renderDocument({
    title: "Safer exchange guide — BitGora",
    description: "Review verification-first guidance and the non-custodial safety boundary of the BitGora portfolio marketplace demonstration.",
    path: "/safety/", page: "safety", main, bodyClass: "safety-page"
  });
}

export function aboutPage() {
  const main = `<main id="main" tabindex="-1">
    <header class="page-hero"><div class="shell page-hero__grid"><div><p class="eyebrow">Product evolution</p><h1>From fragile full-stack prototype to a trustworthy market lab</h1><p>The original BitGora connected posts, accounts and live chat, but its security and deployment boundaries were not safe for public operation. The rebuild preserves the product idea while making every claim and data flow explicit.</p></div><div class="page-hero__badge">${icon("spark")}<strong>Clean-room rebuild</strong><span>Modern static UI + one read-only Function</span></div></div></header>
    <section class="section shell split-feature">
      <div><p class="eyebrow">What changed</p><h2>A coherent public journey replaced an authentication wall</h2><p>Visitors can now understand the proposition, browse a complete market, inspect details, save items, prepare an inquiry, build a local seller draft and review safety without creating an account.</p><ul class="check-list"><li>${icon("check")}Server-rendered static documents for crawlability and resilience.</li><li>${icon("check")}Browser-local state for non-sensitive demo tools.</li><li>${icon("check")}Same-origin Vercel Function for optional read-only BTC/CAD data.</li><li>${icon("check")}No database, sockets, sessions, uploads or private identities.</li></ul></div>
      <div class="architecture-stack" aria-label="BitGora architecture layers"><div><span>Vercel CDN</span><strong>Static pages and PWA assets</strong></div><div><span>Browser</span><strong>Watchlist, drafts and synthetic messages</strong></div><div><span>Vercel Function</span><strong>Read-only BTC/CAD reference</strong></div><div class="architecture-stack__off"><span>Not connected</span><strong>Wallets · payments · custody · public users</strong></div></div>
    </section>
    <section class="section section--tint"><div class="shell">
      ${sectionHead("Product boundary","What this release deliberately does not do","A real marketplace is an operating system, not a handful of routes.")}
      <div class="boundary-grid"><article>${icon("user")}<h3>No live accounts</h3><p>Real identity, recovery, consent and abuse controls require a separately designed service.</p></article><article>${icon("message")}<h3>No real chat</h3><p>Messaging needs authenticated membership, moderation, retention, blocking and incident response.</p></article><article>${icon("bitcoin")}<h3>No wallet or custody</h3><p>The app never requests a wallet address, seed phrase, signature or payment.</p></article><article>${icon("shield")}<h3>No escrow promise</h3><p>No funds are held and no dispute outcome is guaranteed.</p></article></div>
    </div></section>
    <section class="section shell"><div class="notice-card"><p class="eyebrow">Attribution review</p><h2>Original repository provenance needs owner confirmation</h2><p>The uploaded package credited Angelica Mapeso and Ziyong He in <code>package.json</code> and described the project as MIT-licensed, but the archive did not contain the referenced licence file. This clean-room implementation does not copy the original application code or corrupted raster assets. See <code>NOTICE.md</code> and the audit report before redistributing historical materials.</p></div></section>
  </main>`;
  return renderDocument({
    title: "About the BitGora rebuild",
    description: "Understand the product, architecture, security and deployment decisions behind the modern BitGora marketplace demonstration.",
    path: "/about/", page: "about", main, bodyClass: "about-page"
  });
}

export function privacyPage() {
  const rows = [
    ["Theme","Scoped local storage","Until changed","No"],
    ["Watchlist listing IDs","Scoped local storage","Until cleared","No"],
    ["Seller draft","Scoped local storage","24 hours","No"],
    ["Synthetic message state","Scoped local storage","Until reset","No"],
    ["Inquiry draft","Page memory / clipboard after action","Current interaction","Only when you copy it"],
    ["BTC/CAD request","Same-origin Vercel Function","CDN cache up to 5 minutes","Yes; no personal data"]
  ];
  const main = `<main id="main" tabindex="-1">
    <header class="page-hero"><div class="shell page-hero__grid"><div><p class="eyebrow">Privacy by product boundary</p><h1>Local tools, minimal network activity</h1><p>BitGora does not create accounts, track behaviour, collect contact details, upload listings or connect cryptocurrency wallets.</p></div><div class="page-hero__badge">${icon("lock")}<strong>No analytics</strong><span>No database · no cookies</span></div></div></header>
    <section class="section shell">
      ${sectionHead("Data map","What exists and where","The only network feature is an optional same-origin request for a read-only BTC/CAD market reference.")}
      <div class="table-wrap" tabindex="0" aria-label="BitGora data handling table"><table><caption class="sr-only">BitGora local and network data handling</caption><thead><tr><th>Information</th><th>Location</th><th>Retention</th><th>Sent?</th></tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    </section>
    <section class="section section--tint"><div class="shell privacy-grid"><article>${icon("heart")}<h2>Watchlist</h2><p>Only fictional listing IDs are saved. Clearing site data or the Watchlist removes them.</p></article><article>${icon("tag")}<h2>Seller draft</h2><p>Text and BTC price stay on the device, expire after 24 hours and can be exported only by an explicit action.</p></article><article>${icon("message")}<h2>Messages</h2><p>All conversations are synthetic. Added messages are local and are never delivered to another person.</p></article><article>${icon("bitcoin")}<h2>Market reference</h2><p>The browser calls BitGora’s own endpoint; the Function requests public BTC/CAD ticker data and returns only a normalized rate and timestamp.</p></article></div></section>
    <section class="section shell"><div class="notice-card"><h2>Do not enter sensitive information</h2><p>Do not put an address, telephone number, email, wallet address, private key, seed phrase, payment proof or identity document into any local demo field.</p></div></section>
  </main>`;
  return renderDocument({
    title: "Privacy — BitGora",
    description: "Review BitGora’s browser-local state, read-only BTC/CAD request and zero-account privacy boundary.",
    path: "/privacy/", page: "privacy", main, bodyClass: "privacy-page"
  });
}

export function notFoundPage() {
  const main = `<main id="main" tabindex="-1"><section class="not-found shell"><div><p class="eyebrow">404 · Route not found</p><h1>That listing is outside the demo market.</h1><p>Return to a known BitGora route or review how the marketplace concept works.</p><div class="button-row">${button({href:"/market/",label:"Browse the demo market",iconName:"search"})}${button({href:"/about/",label:"Read about the rebuild",iconName:"arrow",variant:"secondary"})}</div></div><img src="/assets/images/404-market.svg" alt="Illustration of a marketplace sign pointing back to BitGora" width="720" height="540"></section></main>`;
  return renderDocument({
    title: "Page not found — BitGora",
    description: "The requested BitGora demo page could not be found.",
    path: "/404/", page: "404", main, bodyClass: "not-found-page", noIndex: true
  });
}
