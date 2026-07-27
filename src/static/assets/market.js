import { listings } from "./catalog-data.js";
import { filterListings, sortListings } from "./catalog-utils.js";

const controls = {
  search: document.querySelector("[data-market-search]"),
  category: document.querySelector("[data-market-category]"),
  condition: document.querySelector("[data-market-condition]"),
  status: document.querySelector("[data-market-status]"),
  maxBtc: document.querySelector("[data-market-max-price]"),
  sort: document.querySelector("[data-market-sort]")
};
const grid = document.querySelector("[data-market-grid]");
const count = document.querySelector("[data-market-count]");
const empty = document.querySelector("[data-market-empty]");

function currentFilters() {
  return {
    query: controls.search?.value || "",
    category: controls.category?.value || "all",
    condition: controls.condition?.value || "all",
    status: controls.status?.value || "available",
    maxBtc: controls.maxBtc?.value || ""
  };
}

function render() {
  const filtered = sortListings(filterListings(listings, currentFilters()), controls.sort?.value || "featured");
  const order = new Map(filtered.map((item, index) => [item.id, index]));
  grid?.querySelectorAll("[data-listing-card]").forEach(card => {
    const visible = order.has(card.dataset.id);
    card.hidden = !visible;
    card.style.order = visible ? String(order.get(card.dataset.id)) : "";
  });
  if (count) count.textContent = String(filtered.length);
  if (empty) empty.hidden = filtered.length !== 0;
}

Object.values(controls).forEach(control => {
  control?.addEventListener(control.tagName === "INPUT" ? "input" : "change", render);
});
document.querySelectorAll("[data-filter-reset]").forEach(button => button.addEventListener("click", () => {
  if (controls.search) controls.search.value = "";
  if (controls.category) controls.category.value = "all";
  if (controls.condition) controls.condition.value = "all";
  if (controls.status) controls.status.value = "available";
  if (controls.maxBtc) controls.maxBtc.value = "";
  if (controls.sort) controls.sort.value = "featured";
  render();
  controls.search?.focus();
}));
document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => {
  const view = button.dataset.view;
  grid?.classList.toggle("listing-grid--list", view === "list");
  document.querySelectorAll("[data-view]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
}));
render();
