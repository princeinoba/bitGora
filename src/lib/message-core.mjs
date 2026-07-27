export const MESSAGE_VERSION = 1;
export const MAX_MESSAGE_LENGTH = 500;

const clean = value => String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, MAX_MESSAGE_LENGTH);

export function normalizeMessageState(input, seedThreads) {
  const seed = structuredClone(seedThreads);
  if (!input || Number(input.version) !== MESSAGE_VERSION || !Array.isArray(input.threads)) {
    return { version: MESSAGE_VERSION, updatedAt: Date.now(), threads: seed };
  }
  const byId = new Map(seed.map(thread => [thread.id, thread]));
  const threads = input.threads.map(thread => {
    const baseline = byId.get(thread?.id);
    if (!baseline || !Array.isArray(thread.messages)) return baseline;
    return {
      ...baseline,
      messages: thread.messages.slice(0, 100).map((message, index) => ({
        id: clean(message?.id) || `local-${index}`,
        sender: message?.sender === "buyer" ? "buyer" : "seller",
        body: clean(message?.body),
        time: clean(message?.time) || "Now"
      })).filter(message => message.body)
    };
  }).filter(Boolean);
  return { version: MESSAGE_VERSION, updatedAt: Date.now(), threads: threads.length ? threads : seed };
}

export function appendLocalMessage(state, threadId, body) {
  const message = clean(body);
  if (!message) return { state, error: "Write a message before adding it to the local demo." };
  const next = structuredClone(state);
  const thread = next.threads.find(item => item.id === threadId);
  if (!thread) return { state, error: "That demo conversation could not be found." };
  thread.messages.push({ id: `local-${Date.now()}`, sender: "buyer", body: message, time: "Now" });
  next.updatedAt = Date.now();
  return { state: next, error: "" };
}
