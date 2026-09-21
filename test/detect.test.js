import assert from "node:assert/strict";
import { test } from "node:test";
import { verdictFor } from "../src/typesafeClient.js";

test("verdictFor buckets probabilities from human to AI", () => {
  assert.equal(verdictFor(0.02), "likely_human");
  assert.equal(verdictFor(0.2), "possibly_human");
  assert.equal(verdictFor(0.5), "uncertain");
  assert.equal(verdictFor(0.7), "possibly_ai");
  assert.equal(verdictFor(0.95), "likely_ai");
});

test("createApp rejects text that is too short or too long", async () => {
  process.env.TYPESAFE_API_KEY ??= "test-key";
  const { createApp } = await import("../src/server.js");
  const app = createApp();

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const short = await fetch(`http://127.0.0.1:${port}/api/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "too short" }),
    });
    assert.equal(short.status, 400);

    const long = await fetch(`http://127.0.0.1:${port}/api/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "a".repeat(20001) }),
    });
    assert.equal(long.status, 400);
  } finally {
    server.close();
  }
});
