const dialog = document.querySelector("[data-inquiry-dialog]");
const form = document.querySelector("[data-inquiry-form]");
const output = document.querySelector("[data-inquiry-output]");
const status = document.querySelector("[data-inquiry-status]");
let trigger = null;

function buildDraft() {
  if (!form || !output) return;
  const data = new FormData(form);
  const title = form.dataset.listingTitle;
  const questions = data.getAll("question").map(value => `• ${value}`);
  const note = String(data.get("note") || "").trim();
  output.value = [
    `Hello — I am interested in the fictional BitGora listing “${title}”.`,
    "",
    ...questions,
    note ? `• Additional note: ${note}` : "",
    "",
    "I will not send a deposit or share wallet credentials. This text was prepared locally in a portfolio demonstration."
  ].filter(Boolean).join("\n");
}

document.querySelector("[data-inquiry-open]")?.addEventListener("click", event => {
  trigger = event.currentTarget;
  buildDraft();
  dialog?.showModal();
  window.setTimeout(() => form?.querySelector("input")?.focus(), 0);
});
form?.addEventListener("input", buildDraft);
dialog?.addEventListener("close", () => trigger?.focus());
document.querySelector("[data-inquiry-copy]")?.addEventListener("click", async () => {
  buildDraft();
  try {
    await navigator.clipboard.writeText(output.value);
    status.textContent = "Inquiry draft copied. It has not been sent.";
  } catch {
    output.focus();
    output.select();
    status.textContent = "Select and copy the prepared text manually.";
  }
});
