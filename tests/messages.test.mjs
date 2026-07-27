import test from "node:test";
import assert from "node:assert/strict";
import { demoThreads } from "../src/content/demo-messages.mjs";
import { appendLocalMessage, MAX_MESSAGE_LENGTH, MESSAGE_VERSION, normalizeMessageState } from "../src/lib/message-core.mjs";

test("demo messages contain only synthetic counterparties", () => {
  assert.equal(demoThreads.length, 3);
  assert.ok(demoThreads.every(thread => /^Demo Seller/.test(thread.counterparty)));
  assert.ok(demoThreads.every(thread => thread.messages.every(message => ["buyer", "seller"].includes(message.sender))));
});

test("missing message state resets to the synthetic seed", () => {
  const state = normalizeMessageState(null, demoThreads);
  assert.equal(state.version, MESSAGE_VERSION);
  assert.equal(state.threads.length, demoThreads.length);
  assert.notEqual(state.threads, demoThreads);
});

test("message normalization rejects unknown threads and strips control characters", () => {
  const input = {
    version: MESSAGE_VERSION,
    threads: [
      { id: demoThreads[0].id, messages: [{ id: "m", sender: "buyer", body: " Hi\u0000 there ", time: "Now" }] },
      { id: "unknown", messages: [{ body: "secret" }] }
    ]
  };
  const state = normalizeMessageState(input, demoThreads);
  assert.equal(state.threads.length, 1);
  assert.equal(state.threads[0].messages[0].body, "Hi there");
});

test("append adds a local buyer message to the selected thread", () => {
  const state = normalizeMessageState(null, demoThreads);
  const before = state.threads[0].messages.length;
  const result = appendLocalMessage(state, state.threads[0].id, "Could I inspect the fictional item?");
  assert.equal(result.error, "");
  assert.equal(result.state.threads[0].messages.length, before + 1);
  assert.equal(result.state.threads[0].messages.at(-1).sender, "buyer");
  assert.equal(state.threads[0].messages.length, before);
});

test("append rejects empty or unknown-thread messages", () => {
  const state = normalizeMessageState(null, demoThreads);
  assert.match(appendLocalMessage(state, state.threads[0].id, "  ").error, /Write a message/);
  assert.match(appendLocalMessage(state, "missing", "Hello").error, /could not be found/);
});

test("messages are bounded", () => {
  const state = normalizeMessageState(null, demoThreads);
  const result = appendLocalMessage(state, state.threads[0].id, "a".repeat(MAX_MESSAGE_LENGTH + 20));
  assert.equal(result.state.threads[0].messages.at(-1).body.length, MAX_MESSAGE_LENGTH);
});
