import { demoThreads } from "./demo-messages-data.js";
import { appendLocalMessage, MAX_MESSAGE_LENGTH, normalizeMessageState } from "./message-core.js";

const STORAGE_KEY = "bitgora:messages:v1";
const app = document.querySelector("[data-messages-app]");
const title = document.querySelector("[data-conversation-title]");
const subtitle = document.querySelector("[data-conversation-subtitle]");
const listingLink = document.querySelector("[data-conversation-listing]");
const list = document.querySelector("[data-message-list]");
const form = document.querySelector("[data-message-form]");
const status = document.querySelector("[data-message-status]");
let activeId = demoThreads[0]?.id || "";

function readState() {
  try {
    return normalizeMessageState(JSON.parse(localStorage.getItem(STORAGE_KEY)), demoThreads);
  } catch {
    return normalizeMessageState(null, demoThreads);
  }
}

let state = readState();

function writeState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {
    if (status) status.textContent = "Browser storage is unavailable; changes will last only for this page.";
  }
}

function activeThread() {
  return state.threads.find(thread => thread.id === activeId) || state.threads[0];
}

function renderThreadButtons() {
  document.querySelectorAll("[data-thread-id]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.threadId === activeId));
  });
}

function renderConversation() {
  const thread = activeThread();
  if (!thread) return;
  activeId = thread.id;
  if (title) title.textContent = thread.counterparty;
  if (subtitle) subtitle.textContent = thread.title;
  if (listingLink) listingLink.href = `/market/${thread.listingSlug}/`;
  if (list) {
    list.replaceChildren(...thread.messages.map(message => {
      const item = document.createElement("li");
      item.className = `message message--${message.sender}`;
      const label = document.createElement("span");
      label.className = "message__sender";
      label.textContent = message.sender === "buyer" ? "You · local demo" : thread.counterparty;
      const body = document.createElement("p");
      body.textContent = message.body;
      const time = document.createElement("time");
      time.textContent = message.time;
      item.append(label, body, time);
      return item;
    }));
    list.scrollTop = list.scrollHeight;
  }
  renderThreadButtons();
}

app?.addEventListener("click", event => {
  const button = event.target.closest("[data-thread-id]");
  if (!button) return;
  activeId = button.dataset.threadId;
  if (status) status.textContent = "";
  renderConversation();
});

form?.addEventListener("submit", event => {
  event.preventDefault();
  const field = form.elements.namedItem("message");
  const body = String(field?.value || "");
  const result = appendLocalMessage(state, activeId, body);
  if (result.error) {
    if (status) status.textContent = result.error;
    field?.focus();
    return;
  }
  state = result.state;
  writeState();
  if (field) field.value = "";
  if (status) status.textContent = "Message added to this browser-only demo. It was not delivered.";
  renderConversation();
  field?.focus();
});

document.querySelector("[data-messages-reset]")?.addEventListener("click", () => {
  state = normalizeMessageState(null, demoThreads);
  activeId = demoThreads[0]?.id || "";
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Non-critical. */ }
  if (status) status.textContent = "Synthetic conversations were reset.";
  renderConversation();
});

const textarea = form?.elements.namedItem("message");
if (textarea) {
  textarea.maxLength = MAX_MESSAGE_LENGTH;
  textarea.addEventListener("keydown", event => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
}
renderConversation();
