import {
  DRAFT_TTL_MS,
  exportSellerDraft,
  normalizeSellerDraft,
  restoreSellerDraft,
  validateSellerDraft
} from "./seller-draft.js";

const STORAGE_KEY = "bitgora:seller-draft:v2";
const form = document.querySelector("[data-seller-form]");
const summary = document.querySelector("[data-error-summary]");
const status = document.querySelector("[data-seller-status]");

function readStoredDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const restored = restoreSellerDraft(parsed);
    if (!restored && parsed) localStorage.removeItem(STORAGE_KEY);
    return restored;
  } catch {
    return null;
  }
}

function formValue() {
  if (!form) return normalizeSellerDraft();
  const data = Object.fromEntries(new FormData(form).entries());
  return normalizeSellerDraft(data);
}

function setForm(draft) {
  if (!form || !draft) return;
  for (const [name, value] of Object.entries(draft)) {
    const field = form.elements.namedItem(name);
    if (field && !["version", "savedAt"].includes(name)) field.value = String(value);
  }
}

function formatBtc(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0
    ? `${number.toFixed(8).replace(/0+$/, "").replace(/\.$/, "")} BTC`
    : "0 BTC";
}

function updatePreview() {
  const draft = formValue();
  const set = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };
  set("[data-preview-category]", draft.category || "Category");
  set("[data-preview-condition]", draft.condition || "Condition");
  set("[data-preview-title]", draft.title || "Untitled listing");
  set("[data-preview-description]", draft.description || "Your description will appear here.");
  set("[data-preview-region]", draft.region || "Broad region");
  set("[data-preview-price]", formatBtc(draft.btcPrice));
}

function clearErrors() {
  if (summary) {
    summary.hidden = true;
    const list = summary.querySelector("ul");
    if (list) list.replaceChildren();
  }
  form?.querySelectorAll("[aria-invalid='true']").forEach(field => field.removeAttribute("aria-invalid"));
  form?.querySelectorAll("[data-error-for]").forEach(node => { node.textContent = ""; });
}

function showErrors(errors) {
  clearErrors();
  const list = summary?.querySelector("ul");
  Object.entries(errors).forEach(([name, message]) => {
    const field = form?.elements.namedItem(name);
    if (field instanceof HTMLElement) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", `error-${name}`);
    }
    const node = form?.querySelector(`[data-error-for="${CSS.escape(name)}"]`);
    if (node) {
      node.id = `error-${name}`;
      node.textContent = message;
    }
    if (list) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${field?.id || `field-${name}`}`;
      link.textContent = message;
      link.addEventListener("click", event => {
        event.preventDefault();
        field?.focus();
      });
      item.append(link);
      list.append(item);
    }
  });
  if (summary && Object.keys(errors).length) {
    summary.hidden = false;
    summary.focus();
  }
}

function saveDraft() {
  const result = validateSellerDraft(formValue());
  if (!result.valid) {
    showErrors(result.errors);
    if (status) status.textContent = "The local draft was not saved. Review the highlighted fields.";
    return false;
  }
  clearErrors();
  const draft = { ...result.draft, savedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    if (status) status.textContent = "Draft saved on this device for up to 24 hours. It has not been published.";
  } catch {
    if (status) status.textContent = "Browser storage is unavailable. You can still export the draft in this session.";
  }
  return draft;
}

form?.addEventListener("input", updatePreview);
form?.addEventListener("change", updatePreview);
form?.addEventListener("submit", event => {
  event.preventDefault();
  saveDraft();
});

document.querySelector("[data-clear-draft]")?.addEventListener("click", () => {
  form?.reset();
  clearErrors();
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Non-critical. */ }
  updatePreview();
  if (status) status.textContent = "The local draft was cleared.";
  form?.querySelector("input")?.focus();
});

document.querySelector("[data-export-draft]")?.addEventListener("click", () => {
  const result = exportSellerDraft(formValue());
  if (!result.valid) {
    showErrors(result.errors);
    if (status) status.textContent = "Complete the required fields before exporting.";
    return;
  }
  clearErrors();
  const blob = new Blob([result.json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bitgora-local-draft-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  if (status) status.textContent = "A local JSON copy was exported. Nothing was published.";
});

const restored = readStoredDraft();
if (restored) {
  setForm(restored);
  if (status) {
    const minutes = Math.max(1, Math.ceil((DRAFT_TTL_MS - (Date.now() - restored.savedAt)) / 60_000));
    status.textContent = `Local draft restored. It expires in about ${minutes} minutes.`;
  }
}
updatePreview();
